// WalletScreen - matching SwiftUI WalletView
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, CreditCard, Camera, Wifi, X, Star } from 'lucide-react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getStrings, formatCurrency } from '../services/LocalizationManager';
import { BankCard } from '../components/BankCard';
import { DatabaseService } from '../services/DatabaseService';
import { Card } from '../types';

const WalletScreen: React.FC = () => {
    const { language } = useAppContext();
    const strings = getStrings(language);

    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [showAddCard, setShowAddCard] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');

    const loadCards = async () => {
        try {
            const data = await DatabaseService.getCards();
            setCards(data);
        } catch (error) {
            console.error('Error loading cards:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadCards();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        loadCards();
    };

    const clearForm = () => {
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        setCardHolder('');
    };

    // Auto-format expiry date: adds "/" automatically after MM
    const handleExpiryDateChange = (text: string) => {
        // Remove any non-digit characters
        let cleaned = text.replace(/\D/g, '');

        // Limit to 4 digits (MMYY)
        if (cleaned.length > 4) {
            cleaned = cleaned.substring(0, 4);
        }

        // Add slash after MM
        if (cleaned.length >= 2) {
            const formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
            setExpiryDate(formatted);
        } else {
            setExpiryDate(cleaned);
        }
    };

    const [isAddingCard, setIsAddingCard] = useState(false);

    const detectBankName = (cardNum: string): string => {
        // Simple bank detection based on card prefix
        const num = cardNum.replace(/\s/g, '');
        if (num.startsWith('4')) return 'ABB'; // Visa
        if (num.startsWith('5')) return 'Kapital'; // Mastercard
        if (num.startsWith('6')) return 'Leo'; // Discover-like
        return 'ABB'; // Default
    };

    const handleAddCard = async () => {
        // Validation
        if (!cardNumber || cardNumber.length < 16) {
            Alert.alert('Xəta', 'Kart nömrəsini düzgün daxil edin');
            return;
        }
        if (!expiryDate || expiryDate.length < 5) {
            Alert.alert('Xəta', 'Tarix (MM/YY) formatında daxil edin');
            return;
        }
        if (!cvv || cvv.length < 3) {
            Alert.alert('Xəta', 'CVV kodu düzgün daxil edin');
            return;
        }

        setIsAddingCard(true);
        try {
            const newCard = await DatabaseService.addCard({
                bankName: detectBankName(cardNumber),
                cardNumber: cardNumber.replace(/\s/g, ''),
                expiryDate: expiryDate,
                cardHolder: cardHolder || 'CARD HOLDER',
            });

            // Add to local state
            setCards(prev => [newCard, ...prev]);
            setShowAddCard(false);
            clearForm();
            Alert.alert('Uğurlu', 'Kart əlavə edildi!');
        } catch (error: any) {
            console.error('Add card error:', error);
            Alert.alert('Xəta', error.message || 'Kart əlavə edilə bilmədi');
        } finally {
            setIsAddingCard(false);
        }
    };

    const handleToggleFavorite = async (cardId: string, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus;
            await DatabaseService.toggleCardFavorite(cardId, newStatus);

            // Update local state
            setCards(prev => prev.map(c =>
                c.id === cardId ? { ...c, isFavorite: newStatus } : c
            ));
        } catch (error) {
            console.error('Toggle favorite error:', error);
            Alert.alert('Xəta', 'Favorit statusu dəyişdirilə bilmədi');
        }
    };

    return (
        <LinearGradient
            colors={[COLORS.background, COLORS.backgroundLight]}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{strings.myWallet}</Text>
                    <Text style={styles.subtitle}>
                        {cards.length} {strings.cardsLinked}
                    </Text>
                </View>

                {/* Loading State */}
                {isLoading && cards.length === 0 && (
                    <View style={{ padding: 50 }}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                )}

                {/* Featured Card */}
                {cards[0] && (
                    <View style={styles.featuredCard}>
                        <BankCard card={cards[0]} />
                    </View>
                )}

                {/* All Cards */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{strings.allCards}</Text>

                    {cards
                        .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
                        .map((card) => (
                            <View key={card.id} style={styles.cardRow}>
                                <TouchableOpacity style={styles.cardRowMain} activeOpacity={0.7}>
                                    <View style={styles.cardIcon}>
                                        <CreditCard size={22} color={COLORS.primary} />
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <View style={styles.cardNameRow}>
                                            <Text style={styles.cardBank}>{card.bankName}</Text>
                                            {card.isFavorite && (
                                                <Star size={12} color="#F59E0B" fill="#F59E0B" style={{ marginLeft: 4 }} />
                                            )}
                                        </View>
                                        <Text style={styles.cardNumber}>•••• {card.cardNumber}</Text>
                                    </View>
                                    <Text style={styles.cardBalance}>{formatCurrency(card.balance)}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.favoriteButton}
                                    onPress={() => handleToggleFavorite(card.id, !!card.isFavorite)}
                                >
                                    <Star
                                        size={20}
                                        color={card.isFavorite ? "#F59E0B" : COLORS.textMuted}
                                        fill={card.isFavorite ? "#F59E0B" : "transparent"}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}

                    {/* Add New Card */}
                    <TouchableOpacity
                        style={styles.addCardButton}
                        onPress={() => setShowAddCard(true)}
                    >
                        <View style={styles.addCardIcon}>
                            <Plus size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.addCardText}>{strings.addNewCard}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Add Card Modal */}
            <Modal visible={showAddCard} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={[COLORS.background, COLORS.backgroundLight]}
                        style={styles.modalContent}
                    >
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{strings.addNewCard}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowAddCard(false);
                                    clearForm();
                                }}
                            >
                                <X size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Card Preview */}
                            <View style={styles.cardPreview}>
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.primaryDark]}
                                    style={styles.previewGradient}
                                >
                                    <View style={styles.previewChip}>
                                        <CreditCard size={20} color={COLORS.text} />
                                    </View>
                                    <Text style={styles.previewNumber}>
                                        {cardNumber || '•••• •••• •••• ••••'}
                                    </Text>
                                    <View style={styles.previewBottom}>
                                        <Text style={styles.previewName}>
                                            {cardHolder || strings.cardHolderName.toUpperCase()}
                                        </Text>
                                        <Text style={styles.previewExpiry}>
                                            {expiryDate || 'MM/YY'}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>

                            {/* Scan Options */}
                            <View style={styles.scanOptions}>
                                <TouchableOpacity style={styles.scanButton}>
                                    <Camera size={20} color={COLORS.primary} />
                                    <Text style={styles.scanText}>{strings.scanCard}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.scanButton}>
                                    <Wifi size={20} color={COLORS.success} />
                                    <Text style={styles.scanText}>{strings.tapToAdd}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Form */}
                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>{strings.cardNumber}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="1234 5678 9012 3456"
                                        placeholderTextColor={COLORS.textMuted}
                                        value={cardNumber}
                                        onChangeText={setCardNumber}
                                        keyboardType="number-pad"
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.inputLabel}>{strings.expiryDate}</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="MM/YY"
                                            placeholderTextColor={COLORS.textMuted}
                                            value={expiryDate}
                                            onChangeText={handleExpiryDateChange}
                                            keyboardType="number-pad"
                                            maxLength={5}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.inputLabel}>CVV</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="123"
                                            placeholderTextColor={COLORS.textMuted}
                                            value={cvv}
                                            onChangeText={setCvv}
                                            keyboardType="number-pad"
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>{strings.cardHolderName}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="ORKHAN ALIYEV"
                                        placeholderTextColor={COLORS.textMuted}
                                        value={cardHolder}
                                        onChangeText={setCardHolder}
                                        autoCapitalize="characters"
                                    />
                                </View>
                            </View>

                            {/* Add Button */}
                            <TouchableOpacity
                                style={[styles.addButton, isAddingCard && { opacity: 0.5 }]}
                                onPress={handleAddCard}
                                disabled={isAddingCard}
                            >
                                <Text style={styles.addButtonText}>
                                    {isAddingCard ? 'Əlavə edilir...' : strings.addCard}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </LinearGradient>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: SPACING.xxxl * 2,
    },

    // Header
    header: {
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },

    // Featured Card
    featuredCard: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },

    // Section
    section: {
        paddingHorizontal: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: COLORS.textSecondary,
        letterSpacing: 1,
        marginBottom: SPACING.md,
    },

    // Card Row
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },
    cardRowMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    cardNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    favoriteButton: {
        padding: SPACING.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: COLORS.glassBorder,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: `${COLORS.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    cardInfo: {
        flex: 1,
    },
    cardBank: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    cardNumber: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        fontFamily: 'monospace',
    },
    cardBalance: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text,
    },

    // Add Card Button
    addCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.glassBorder,
        borderStyle: 'dashed',
        marginTop: SPACING.sm,
    },
    addCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${COLORS.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    addCardText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text,
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xxxl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    modalTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
    },

    // Card Preview
    cardPreview: {
        marginBottom: SPACING.xl,
    },
    previewGradient: {
        height: 200,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        justifyContent: 'space-between',
    },
    previewChip: {
        width: 40,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: SPACING.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewNumber: {
        fontSize: FONT_SIZE.xl,
        fontFamily: 'monospace',
        color: COLORS.text,
        letterSpacing: 2,
    },
    previewBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    previewName: {
        fontSize: FONT_SIZE.sm,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    previewExpiry: {
        fontSize: FONT_SIZE.sm,
        color: 'rgba(255, 255, 255, 0.7)',
    },

    // Scan Options
    scanOptions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    scanButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        padding: SPACING.md,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.lg,
    },
    scanText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.text,
    },

    // Form
    form: {
        gap: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    inputGroup: {
        gap: SPACING.sm,
    },
    inputRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    inputLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    input: {
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        color: COLORS.text,
        fontSize: FONT_SIZE.md,
        fontFamily: 'monospace',
    },

    // Add Button
    addButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: 'bold',
        color: COLORS.text,
    },
});

export default WalletScreen;
