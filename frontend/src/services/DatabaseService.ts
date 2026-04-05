import { supabase } from '../lib/supabase';
import { Card, Transaction, ChatMessage, TransactionCategory } from '../types';

export const DatabaseService = {
    /**
     * Fetch all cards for the current user
     */
    async getCards(): Promise<Card[]> {
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .order('is_favorite', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map snake_case from DB to camelCase for UI
        return (data || []).map(row => ({
            id: row.id,
            userId: row.user_id,
            bankName: row.bank_name,
            cardNumber: row.card_number,
            balance: parseFloat(row.balance),
            colorTheme: row.color_theme,
            isFavorite: row.is_favorite,
            expiryDate: row.expiry_date,
            createdAt: row.created_at,
        })) as any[];
    },

    /**
     * Add a new card
     */
    async addCard(cardData: {
        bankName: string;
        cardNumber: string;
        expiryDate: string;
        cardHolder: string;
    }): Promise<Card> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('cards')
            .insert([{
                user_id: user.id,
                bank_name: cardData.bankName,
                card_number: cardData.cardNumber.slice(-4), // Store only last 4 digits
                expiry_date: cardData.expiryDate,
                balance: 0, // New cards start with 0 balance
                color_theme: 'blue', // Default theme
            }])
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            userId: data.user_id,
            bankName: data.bank_name,
            cardNumber: data.card_number,
            balance: parseFloat(data.balance),
            colorTheme: data.color_theme,
            isFavorite: data.is_favorite,
            expiryDate: data.expiry_date,
            createdAt: data.created_at,
        } as Card;
    },

    /**
     * Toggle card favorite status
     */
    async toggleCardFavorite(cardId: string, isFavorite: boolean): Promise<void> {
        const { error } = await supabase
            .from('cards')
            .update({ is_favorite: isFavorite })
            .eq('id', cardId);

        if (error) throw error;
    },

    /**
     * Fetch all transactions for the current user
     */
    async getTransactions(): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(row => ({
            id: row.id,
            userId: row.user_id,
            cardId: row.card_id,
            amount: parseFloat(row.amount),
            merchantName: row.merchant_name,
            category: row.category as TransactionCategory,
            status: row.status,
            createdAt: row.created_at,
        }));
    },

    /**
     * Get weekly spending data for charts
     */
    async getWeeklySpending(): Promise<{ day: string; amount: number }[]> {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const { data, error } = await supabase
            .from('transactions')
            .select('amount, created_at')
            .gte('created_at', weekAgo.toISOString())
            .lte('created_at', today.toISOString());

        if (error) throw error;

        // Initialize all days with 0
        const spending: Record<string, number> = {};
        days.forEach(day => { spending[day] = 0; });

        // Sum up spending per day
        (data || []).forEach(tx => {
            const date = new Date(tx.created_at);
            const dayName = days[date.getDay()];
            spending[dayName] += parseFloat(tx.amount);
        });

        return days.map(day => ({ day, amount: spending[day] }));
    },

    /**
     * Get category breakdown for insights
     */
    async getCategoryBreakdown(): Promise<{ category: string; amount: number; percentage: number }[]> {
        const { data, error } = await supabase
            .from('transactions')
            .select('category, amount');

        if (error) throw error;

        // Sum by category
        const totals: Record<string, number> = {};
        let grandTotal = 0;

        (data || []).forEach(tx => {
            const cat = tx.category || 'General';
            totals[cat] = (totals[cat] || 0) + parseFloat(tx.amount);
            grandTotal += parseFloat(tx.amount);
        });

        // Convert to array with percentages
        return Object.entries(totals)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
            }))
            .sort((a, b) => b.amount - a.amount);
    },

    /**
     * Log a new transaction (manual)
     */
    async addTransaction(payload: Partial<Transaction>) {
        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                user_id: payload.userId,
                card_id: payload.cardId,
                amount: payload.amount,
                merchant_name: payload.merchantName,
                category: payload.category,
                status: payload.status,
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Save chat message
     */
    async saveChatMessage(text: string, isBot: boolean, metadata: any = {}) {
        const { error } = await supabase
            .from('messages')
            .insert([{ text, is_bot: isBot, metadata }]);

        if (error) throw error;
    },

    /**
     * Record a sponsor bonus with card name
     */
    async recordBonus(partnerName: string, amount: number, cardName?: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('bonuses')
            .insert([{
                user_id: user.id,
                partner_name: partnerName,
                amount: amount,
                card_name: cardName || null,
            }]);

        if (error) {
            console.error('Error recording bonus:', error);
            // Fallback: if table doesn't exist, we don't crash the payment flow
        }
    },

    /**
     * Get total bonuses and today's bonus
     */
    async getBonusStats(): Promise<{ total: number; today: number }> {
        const { data, error } = await supabase
            .from('bonuses')
            .select('amount, created_at');

        if (error) {
            console.error('Error fetching bonuses:', error);
            return { total: 45.20, today: 2.40 }; // Dummy fallback
        }

        let total = 0;
        let today = 0;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        (data || []).forEach(b => {
            const amt = parseFloat(b.amount);
            total += amt;
            if (new Date(b.created_at) >= startOfToday) {
                today += amt;
            }
        });

        return { total, today };
    },

    /**
     * Process payment via RPC (Atomic)
     */
    async processPayment(cardId: string, amount: number, merchant: string, category: string) {
        const { data, error } = await supabase.rpc('process_payment', {
            p_card_id: cardId,
            p_amount: amount,
            p_merchant: merchant,
            p_category: category,
        });

        if (error) throw error;
        return data; // 'SUCCESS' or 'INSUFFICIENT_FUNDS'
    },

    // ==================== FAVORITE PAYMENTS ====================

    /**
     * Get all favorite payments for the current user
     */
    async getFavoritePayments(): Promise<{ id: string; merchant: string; category: string; defaultAmount: number; nickname: string }[]> {
        const { data, error } = await supabase
            .from('favorite_payments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching favorite payments:', error);
            return [];
        }

        return (data || []).map(row => ({
            id: row.id,
            merchant: row.merchant,
            category: row.category || 'General',
            defaultAmount: parseFloat(row.default_amount) || 0,
            nickname: row.nickname || row.merchant,
        }));
    },

    /**
     * Add a favorite payment
     */
    async addFavoritePayment(merchant: string, category: string, defaultAmount: number, nickname: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('favorite_payments')
            .insert([{
                user_id: user.id,
                merchant,
                category,
                default_amount: defaultAmount,
                nickname,
            }]);

        if (error) {
            console.error('Error adding favorite payment:', error);
        }
    },

    /**
     * Delete a favorite payment
     */
    async deleteFavoritePayment(id: string): Promise<void> {
        const { error } = await supabase
            .from('favorite_payments')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting favorite payment:', error);
        }
    },

    // ==================== AUTO PAYMENTS ====================

    /**
     * Get all auto payments for the current user
     */
    async getAutoPayments(): Promise<{ id: string; merchant: string; amount: number; frequency: string; nextPaymentDate: string; isActive: boolean }[]> {
        const { data, error } = await supabase
            .from('auto_payments')
            .select('*')
            .order('next_payment_date', { ascending: true });

        if (error) {
            console.error('Error fetching auto payments:', error);
            return [];
        }

        return (data || []).map(row => ({
            id: row.id,
            merchant: row.merchant,
            amount: parseFloat(row.amount),
            frequency: row.frequency || 'monthly',
            nextPaymentDate: row.next_payment_date,
            isActive: row.is_active,
        }));
    },

    /**
     * Add an auto payment
     */
    async addAutoPayment(merchant: string, amount: number, frequency: string, nextPaymentDate: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('auto_payments')
            .insert([{
                user_id: user.id,
                merchant,
                amount,
                frequency,
                next_payment_date: nextPaymentDate,
                is_active: true,
            }]);

        if (error) {
            console.error('Error adding auto payment:', error);
        }
    },

    /**
     * Toggle auto payment active status
     */
    async toggleAutoPayment(id: string, isActive: boolean): Promise<void> {
        const { error } = await supabase
            .from('auto_payments')
            .update({ is_active: isActive })
            .eq('id', id);

        if (error) {
            console.error('Error toggling auto payment:', error);
        }
    },

    /**
     * Delete an auto payment
     */
    async deleteAutoPayment(id: string): Promise<void> {
        const { error } = await supabase
            .from('auto_payments')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting auto payment:', error);
        }
    },

    // ==================== ENHANCED BONUSES ====================

    /**
     * Get bonuses with card names
     */
    async getBonusesWithCards(): Promise<{ id: string; partnerName: string; amount: number; cardName: string; createdAt: string }[]> {
        const { data, error } = await supabase
            .from('bonuses')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching bonuses with cards:', error);
            return [];
        }

        return (data || []).map(row => ({
            id: row.id,
            partnerName: row.partner_name,
            amount: parseFloat(row.amount),
            cardName: row.card_name || 'Unknown',
            createdAt: row.created_at,
        }));
    }
};
