// HomeScreen - Real Supabase Data Integration
import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
    Bell,
    ArrowUpCircle,
    Send,
    ArrowDownCircle,
    MoreHorizontal,
    Clapperboard,
    ParkingCircle,
    ShieldPlus,
    Landmark,
    Bus,
    QrCode,
    Gift,
    Lightbulb,
    Utensils,
    Car,
    ShoppingBag,
    ArrowLeftRight,
    CircleDot,
} from 'lucide-react-native';
import { Alert } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getStrings, getGreeting, formatCurrency, formatDate } from '../services/LocalizationManager';
import { SERVICES } from '../constants/mockData';
import { CardCarousel } from '../components/CardCarousel';
import { Transaction, Card } from '../types';
import { DatabaseService } from '../services/DatabaseService';

// Icon mappings
const SERVICE_ICONS: Record<string, typeof Bell> = {
    'popcorn': Clapperboard,
    'parking-circle': ParkingCircle,
    'shield-plus': ShieldPlus,
    'landmark': Landmark,
    'bus': Bus,
    'qr-code': QrCode,
    'gift': Gift,
    'more-horizontal': MoreHorizontal,
};

const CATEGORY_ICONS: Record<string, typeof Bell> = {
    Utilities: Lightbulb,
    Food: Utensils,
    Transport: Car,
    Shopping: ShoppingBag,
    Transfer: ArrowLeftRight,
    General: CircleDot,
};

// Quick Action Button
const QuickActionButton = memo<{ icon: typeof Bell; label: string; onPress?: () => void }>(
    ({ icon: Icon, label, onPress }) => (
        <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
            <View style={styles.quickActionIcon}>
                <Icon size={24} color={COLORS.text} />
            </View>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    )
);
QuickActionButton.displayName = 'QuickActionButton';

// Service Item
const ServiceItem = memo<{ icon: string; label: string; color: string; onPress?: () => void }>(
    ({ icon, label, color, onPress }) => {
        const IconComponent = SERVICE_ICONS[icon] || CircleDot;
        return (
            <TouchableOpacity style={styles.serviceItem} onPress={onPress}>
                <View style={[styles.serviceIcon, { backgroundColor: color }]}>
                    <IconComponent size={22} color={COLORS.text} />
                </View>
                <Text style={styles.serviceLabel} numberOfLines={1}>{label}</Text>
            </TouchableOpacity>
        );
    }
);
ServiceItem.displayName = 'ServiceItem';

// Transaction Row
const TransactionRow = memo<{ transaction: Transaction; onPress?: () => void }>(
    ({ transaction, onPress }) => {
        const IconComponent = CATEGORY_ICONS[transaction.category] || CircleDot;
        const formattedDate = formatDate(new Date(transaction.createdAt));
        const formattedAmount = formatCurrency(transaction.amount);
        const amountColor = transaction.amount < 0 ? COLORS.error : COLORS.success;

        return (
            <TouchableOpacity style={styles.transactionRow} onPress={onPress}>
                <View style={styles.transactionIcon}>
                    <IconComponent size={20} color={COLORS.text} />
                </View>
                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionMerchant}>{transaction.merchantName}</Text>
                    <Text style={styles.transactionDate}>{formattedDate}</Text>
                </View>
                <Text style={[styles.transactionAmount, { color: amountColor }]}>
                    {formattedAmount}
                </Text>
            </TouchableOpacity>
        );
    }
);
TransactionRow.displayName = 'TransactionRow';

// Main HomeScreen
const HomeScreen: React.FC = () => {
    const navigation = useNavigation();
    const { language, userProfile } = useAppContext();

    // State for real data
    const [cards, setCards] = useState<Card[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch data from Supabase
    const loadData = useCallback(async () => {
        try {
            const [cardsData, txData] = await Promise.all([
                DatabaseService.getCards(),
                DatabaseService.getTransactions(),
            ]);
            setCards(cardsData);
            setTransactions(txData);
        } catch (error) {
            console.error('Failed to load home data:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        loadData();
    }, [loadData]);

    // Memoized values
    const strings = useMemo(() => getStrings(language), [language]);
    const greeting = useMemo(() => getGreeting(language), [language]);
    const totalBalance = useMemo(() => cards.reduce((sum, c) => sum + c.balance, 0), [cards]);
    const formattedBalance = useMemo(() => formatCurrency(totalBalance), [totalBalance]);
    const displayName = userProfile?.name || 'User';
    const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

    const quickActions = useMemo(() => [
        { icon: ArrowUpCircle, label: strings.topUp, onPress: () => Alert.alert(strings.topUp, 'Tezliklə...') },
        { icon: Send, label: strings.send, onPress: () => navigation.navigate('Chat' as never) },
        { icon: ArrowDownCircle, label: strings.request, onPress: () => Alert.alert(strings.request, 'Tezliklə...') },
        { icon: MoreHorizontal, label: strings.more, onPress: () => Alert.alert(strings.more, 'Tezliklə...') },
    ], [strings, navigation]);

    return (
        <LinearGradient colors={[COLORS.background, COLORS.backgroundLight]} style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {/* Header */}
                <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{greeting}</Text>
                        <Text style={styles.userName}>{displayName}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => Alert.alert(strings.notifications, 'Yeni bildiriş yoxdur')}
                    >
                        <Bell size={24} color={COLORS.text} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Total Balance */}
                <Animated.View entering={FadeInUp.delay(200)} style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>{strings.totalBalance}</Text>
                    <Text style={styles.balanceAmount}>{formattedBalance}</Text>
                </Animated.View>

                {/* Card Carousel */}
                <CardCarousel cards={cards} />

                {/* Quick Actions */}
                <Animated.View entering={FadeInUp.delay(300)} style={styles.quickActions}>
                    {quickActions.map((action, index) => (
                        <QuickActionButton key={index} icon={action.icon} label={action.label} onPress={action.onPress} />
                    ))}
                </Animated.View>

                {/* Services */}
                <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
                    <Text style={styles.sectionTitle}>{strings.services}</Text>
                    <View style={styles.servicesGrid}>
                        {SERVICES.map((service) => (
                            <ServiceItem
                                key={service.id}
                                icon={service.icon}
                                label={strings[service.label as keyof typeof strings] || service.label}
                                color={service.color}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Favorite Payments */}
                <Animated.View entering={FadeInUp.delay(450)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitleInline}>
                            {language === 'az' ? '⭐ Favori Ödənişlər' : '⭐ Favorite Payments'}
                        </Text>
                        <TouchableOpacity onPress={() => (navigation as any).navigate('Chat', { query: 'Favori ödəniş əlavə et' })}>
                            <Text style={styles.viewAll}>+ {language === 'az' ? 'Əlavə et' : 'Add'}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favoritesScroll}>
                        <TouchableOpacity
                            style={styles.favoriteChip}
                            onPress={() => (navigation as any).navigate('Chat', { query: 'Azərişıq ödə' })}
                        >
                            <Text style={styles.favoriteChipIcon}>💡</Text>
                            <Text style={styles.favoriteChipText}>Azərişıq</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.favoriteChip}
                            onPress={() => (navigation as any).navigate('Chat', { query: 'Azercell 10 AZN' })}
                        >
                            <Text style={styles.favoriteChipIcon}>📱</Text>
                            <Text style={styles.favoriteChipText}>Azercell</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.favoriteChip}
                            onPress={() => (navigation as any).navigate('Chat', { query: 'Wolt ödəniş' })}
                        >
                            <Text style={styles.favoriteChipIcon}>🍔</Text>
                            <Text style={styles.favoriteChipText}>Wolt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.favoriteChip}
                            onPress={() => (navigation as any).navigate('Chat', { query: 'Bolt taksi' })}
                        >
                            <Text style={styles.favoriteChipIcon}>🚕</Text>
                            <Text style={styles.favoriteChipText}>Bolt</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>

                {/* Auto Payments */}
                <Animated.View entering={FadeInUp.delay(475)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitleInline}>
                            {language === 'az' ? '🔄 Avtomatik Ödənişlər' : '🔄 Auto Payments'}
                        </Text>
                        <TouchableOpacity onPress={() => Alert.alert(language === 'az' ? 'Tezliklə' : 'Coming Soon', language === 'az' ? 'Avtomatik ödəniş planla' : 'Schedule auto payment')}>
                            <Text style={styles.viewAll}>+ {language === 'az' ? 'Planla' : 'Schedule'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.autoPaymentCard}>
                        <View style={styles.autoPaymentRow}>
                            <Text style={styles.autoPaymentIcon}>💡</Text>
                            <View style={styles.autoPaymentInfo}>
                                <Text style={styles.autoPaymentName}>Azərişıq</Text>
                                <Text style={styles.autoPaymentFreq}>{language === 'az' ? 'Hər ay 25-i' : 'Monthly 25th'}</Text>
                            </View>
                            <Text style={styles.autoPaymentAmount}>~25 AZN</Text>
                        </View>
                        <View style={styles.autoPaymentRow}>
                            <Text style={styles.autoPaymentIcon}>📱</Text>
                            <View style={styles.autoPaymentInfo}>
                                <Text style={styles.autoPaymentName}>Azercell</Text>
                                <Text style={styles.autoPaymentFreq}>{language === 'az' ? 'Hər həftə' : 'Weekly'}</Text>
                            </View>
                            <Text style={styles.autoPaymentAmount}>10 AZN</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Recent Transactions */}
                <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitleInline}>{strings.recentTransactions}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Wallet' as never)}>
                            <Text style={styles.viewAll}>{strings.viewAll}</Text>
                        </TouchableOpacity>
                    </View>
                    {recentTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Əməliyyat yoxdur</Text>
                        </View>
                    ) : (
                        recentTransactions.map((tx) => (
                            <TransactionRow key={tx.id} transaction={tx} />
                        ))
                    )}
                </Animated.View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingTop: Platform.OS === 'ios' ? SPACING.xxxl * 2 : SPACING.xxxl * 1.5 },
    bottomSpacer: { height: 100 },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    greeting: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
    userName: { fontSize: FONT_SIZE.xxl, fontWeight: 'bold', color: COLORS.text },
    notificationButton: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.glass,
        alignItems: 'center', justifyContent: 'center',
    },
    notificationBadge: {
        position: 'absolute', top: 0, right: 0,
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: COLORS.error,
    },

    // Balance
    balanceContainer: { alignItems: 'center', marginBottom: SPACING.lg },
    balanceLabel: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
    balanceAmount: { fontSize: FONT_SIZE.hero, fontWeight: 'bold', color: COLORS.text },

    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.xxl,
    },
    quickActionButton: { alignItems: 'center', gap: SPACING.sm },
    quickActionIcon: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: COLORS.glass,
        alignItems: 'center', justifyContent: 'center',
    },
    quickActionLabel: { fontSize: FONT_SIZE.sm, color: COLORS.text },

    // Section
    section: { marginBottom: SPACING.xxl },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.text,
        paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg,
    },
    sectionTitleInline: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.text },
    viewAll: { fontSize: FONT_SIZE.md, color: COLORS.primary },

    // Services
    servicesGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        paddingHorizontal: SPACING.lg, gap: SPACING.sm,
    },
    serviceItem: { width: '23%', alignItems: 'center', marginBottom: SPACING.md },
    serviceIcon: {
        width: 50, height: 50, borderRadius: 25,
        alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs,
    },
    serviceLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, textAlign: 'center' },

    // Transactions
    transactionRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: SPACING.lg, marginHorizontal: SPACING.xl, marginBottom: SPACING.sm,
        backgroundColor: COLORS.glass, borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1, borderColor: COLORS.glassBorder,
    },
    transactionIcon: {
        width: 44, height: 44, borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.glassLight,
        alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
    },
    transactionInfo: { flex: 1 },
    transactionMerchant: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
    transactionDate: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
    transactionAmount: { fontSize: FONT_SIZE.md, fontWeight: '600' },

    // Empty State
    emptyState: {
        padding: SPACING.xl, marginHorizontal: SPACING.xl,
        backgroundColor: COLORS.glass, borderRadius: BORDER_RADIUS.lg, alignItems: 'center',
    },
    emptyText: { color: COLORS.textSecondary },

    // Favorite Payments
    favoritesScroll: {
        paddingHorizontal: SPACING.xl,
    },
    favoriteChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.full,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        marginRight: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    favoriteChipIcon: {
        fontSize: 18,
        marginRight: SPACING.xs,
    },
    favoriteChipText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        fontWeight: '500',
    },

    // Auto Payments
    autoPaymentCard: {
        marginHorizontal: SPACING.xl,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        padding: SPACING.md,
    },
    autoPaymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    autoPaymentIcon: {
        fontSize: 24,
        marginRight: SPACING.md,
    },
    autoPaymentInfo: {
        flex: 1,
    },
    autoPaymentName: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    autoPaymentFreq: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    autoPaymentAmount: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.primary,
    },
});

export default HomeScreen;
