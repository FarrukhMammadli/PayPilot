// InsightsScreen - Improved Analytics with SVG Charts and Glassmorphism
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getStrings, formatCurrency } from '../services/LocalizationManager';
import { DatabaseService } from '../services/DatabaseService';
import { CategoryLabels } from '../types';
import {
    Lightbulb,
    Utensils,
    Car,
    ShoppingBag,
    ArrowLeftRight,
    CircleDot,
    TrendingUp,
    TrendingDown,
    Calendar,
    PieChart
} from 'lucide-react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CHART_SIZE = 220;
const RADIUS = CHART_SIZE / 2;
const STROKE_WIDTH = 25;
const CIRCUMFERENCE = 2 * Math.PI * (RADIUS - STROKE_WIDTH / 2);

const CATEGORY_ICONS: Record<string, any> = {
    Utilities: Lightbulb,
    Food: Utensils,
    Transport: Car,
    Shopping: ShoppingBag,
    Transfer: ArrowLeftRight,
    General: CircleDot,
};

const CATEGORY_COLORS: Record<string, string> = {
    Utilities: '#F59E0B',
    Food: '#EF4444',
    Transport: '#3B82F6',
    Shopping: '#EC4899',
    Transfer: '#8B5CF6',
    General: '#6B7280',
};

interface WeeklyData {
    day: string;
    amount: number;
}

interface CategoryData {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}

const InsightsScreen: React.FC = () => {
    const { language } = useAppContext();
    const strings = getStrings(language);

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [weeklySpending, setWeeklySpending] = useState<WeeklyData[]>([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryData[]>([]);
    const [totalSpending, setTotalSpending] = useState(0);
    const [bonusStats, setBonusStats] = useState({ total: 0, today: 0 });
    const [trend, setTrend] = useState(0); // Mock trend percentage

    const loadData = async () => {
        try {
            const [weekly, categories, bonuses] = await Promise.all([
                DatabaseService.getWeeklySpending(),
                DatabaseService.getCategoryBreakdown(),
                DatabaseService.getBonusStats(),
            ]);

            setBonusStats(bonuses);

            // FALLBACK FOR DEMO: If no real data, use realistic mock data
            if (categories.length === 0) {
                const mockWeekly = [
                    { day: 'Mon', amount: 45 }, { day: 'Tue', amount: 30 }, { day: 'Wed', amount: 120 },
                    { day: 'Thu', amount: 60 }, { day: 'Fri', amount: 200 }, { day: 'Sat', amount: 150 },
                    { day: 'Sun', amount: 80 }
                ];
                const mockCategories = [
                    { category: 'Utilities', amount: 250, percentage: 35, color: CATEGORY_COLORS.Utilities },
                    { category: 'Food', amount: 180, percentage: 25, color: CATEGORY_COLORS.Food },
                    { category: 'Transport', amount: 120, percentage: 17, color: CATEGORY_COLORS.Transport },
                    { category: 'Shopping', amount: 150, percentage: 21, color: CATEGORY_COLORS.Shopping },
                    { category: 'General', amount: 15, percentage: 2, color: CATEGORY_COLORS.General },
                ];
                setWeeklySpending(mockWeekly);
                setCategoryBreakdown(mockCategories);
                setTotalSpending(715);
                // Keep the fetched bonuses or fallback if zero
                if (bonuses.total === 0) setBonusStats({ total: 45.20, today: 2.40 });
            } else {
                setWeeklySpending(weekly);
                const coloredCategories = categories.map(cat => ({
                    ...cat,
                    color: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.General
                }));
                setCategoryBreakdown(coloredCategories);
                const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
                setTotalSpending(total);
            }

            setTrend(Math.floor(Math.random() * 20) - 5);

        } catch (error) {
            console.error('Error loading insights:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setIsRefreshing(true);
        loadData();
    };

    // Calculate Donut Chart Segments
    const donutSegments = useMemo(() => {
        let currentAngle = 0;
        return categoryBreakdown.map((item) => {
            const strokeDasharray = `${(item.percentage / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
            const rotation = currentAngle;
            currentAngle += (item.percentage / 100) * 360;
            return { ...item, strokeDasharray, rotation };
        });
    }, [categoryBreakdown]);

    if (isLoading) {
        return (
            <LinearGradient colors={[COLORS.background, COLORS.backgroundLight]} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </LinearGradient>
        );
    }

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
                {/* Header Title */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
                    <Text style={styles.title}>{strings.insights}</Text>
                    <Text style={styles.subtitle}>{language === 'az' ? 'Maliyyə vəziyyətiniz' : 'Your financial overview'}</Text>
                </Animated.View>

                {/* Trend Card */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.trendCard}>
                    <View style={styles.trendInfo}>
                        <Text style={styles.totalLabel}>{strings.weeklySpending}</Text>
                        <Text style={styles.totalAmount}>{formatCurrency(totalSpending)}</Text>
                        <View style={styles.trendBadge}>
                            {trend >= 0 ? <TrendingUp size={16} color={COLORS.error} /> : <TrendingDown size={16} color={COLORS.success} />}
                            <Text style={[styles.trendText, { color: trend >= 0 ? COLORS.error : COLORS.success }]}>
                                {Math.abs(trend)}% {language === 'az' ? 'keçən həftəyə nəzərən' : 'vs last week'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.trendIconBg}>
                        <PieChart size={32} color={COLORS.primary} />
                    </View>
                </Animated.View>

                {/* Donut Chart Section */}
                {totalSpending > 0 && (
                    <Animated.View entering={ZoomIn.delay(300)} style={styles.chartSection}>
                        <Text style={styles.sectionTitle}>{strings.categoryBreakdown}</Text>
                        <View style={styles.donutContainer}>
                            <Svg height={CHART_SIZE} width={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
                                <G rotation="-90" origin={`${RADIUS}, ${RADIUS}`}>
                                    {donutSegments.map((segment, index) => (
                                        <Circle
                                            key={index}
                                            cx={RADIUS}
                                            cy={RADIUS}
                                            r={RADIUS - STROKE_WIDTH / 2}
                                            stroke={segment.color}
                                            strokeWidth={STROKE_WIDTH}
                                            strokeDasharray={segment.strokeDasharray}
                                            strokeDashoffset={0}
                                            rotation={segment.rotation}
                                            origin={`${RADIUS}, ${RADIUS}`}
                                            fill="transparent"
                                            strokeLinecap="round"
                                        />
                                    ))}
                                </G>
                                <SvgText
                                    x={RADIUS}
                                    y={RADIUS - 5}
                                    textAnchor="middle"
                                    fontSize="28"
                                    fontWeight="bold"
                                    fill={COLORS.text}
                                >
                                    {totalSpending}
                                </SvgText>
                                <SvgText
                                    x={RADIUS}
                                    y={RADIUS + 18}
                                    textAnchor="middle"
                                    fontSize="14"
                                    fill={COLORS.textSecondary}
                                >
                                    AZN
                                </SvgText>
                            </Svg>
                        </View>
                    </Animated.View>
                )}

                {/* Weekly Bar Chart */}
                <Animated.View entering={FadeInUp.delay(400)} style={styles.barChartSection}>
                    <Text style={styles.sectionTitle}>{strings.weeklySpending}</Text>
                    <View style={styles.barContainer}>
                        {weeklySpending.map((day, index) => {
                            const maxVal = Math.max(...weeklySpending.map(d => d.amount), 1);
                            const barHeight = (day.amount / maxVal) * 100;
                            return (
                                <View key={index} style={styles.barWrapper}>
                                    <View style={[styles.bar, { height: `${barHeight}%` }]}>
                                        <LinearGradient
                                            colors={[COLORS.primary, '#9333EA']}
                                            style={styles.barGradient}
                                        />
                                    </View>
                                    <Text style={styles.barLabel}>{day.day}</Text>
                                </View>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Bonuses Section with Card Names */}
                <Animated.View entering={FadeInUp.delay(600)} style={styles.bonusesSection}>
                    <Text style={styles.sectionTitle}>
                        {language === 'az' ? 'Bonuslar və Təkliflər' : 'Bonuses & Offers'}
                    </Text>
                    <View style={styles.bonusCard}>
                        <View style={styles.bonusInfo}>
                            <Text style={styles.bonusCount}>{bonusStats.total.toFixed(2)} AZN</Text>
                            <Text style={styles.bonusLabel}>
                                {language === 'az' ? 'Ümumi Qazanılan Bonus' : 'Total Earned Bonuses'}
                            </Text>
                        </View>
                        {bonusStats.today > 0 && (
                            <View style={styles.bonusBadge}>
                                <Text style={styles.bonusBadgeText}>+{bonusStats.today.toFixed(2)} {language === 'az' ? 'Bu gün' : 'Today'}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.offerRow}>
                        <View style={[styles.offerBox, { backgroundColor: '#FFEDD5' }]}>
                            <Text style={styles.offerText}>Wolt: 5% Bonus</Text>
                            <Text style={[styles.offerText, { fontSize: 10, opacity: 0.7 }]}>Leobank ilə</Text>
                        </View>
                        <View style={[styles.offerBox, { backgroundColor: '#DBEAFE' }]}>
                            <Text style={styles.offerText}>Bravo: 2% Cash</Text>
                            <Text style={[styles.offerText, { fontSize: 10, opacity: 0.7 }]}>Kapital ilə</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Detailed List */}
                <View style={[styles.detailsContainer, { marginTop: SPACING.xl }]}>
                    <Text style={[styles.sectionTitle, { marginLeft: 0 }]}>{strings.details}</Text>
                    {categoryBreakdown.map((item, index) => {
                        const IconComponent = CATEGORY_ICONS[item.category] || CircleDot;
                        return (
                            <Animated.View
                                key={item.category}
                                entering={FadeInUp.delay(500 + index * 100)}
                                style={styles.categoryRow}
                            >
                                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                                    <IconComponent size={20} color={item.color} />
                                </View>
                                <View style={styles.rowContent}>
                                    <View style={styles.rowHeader}>
                                        <Text style={styles.catName}>
                                            {(CategoryLabels as any)[item.category] || item.category}
                                        </Text>
                                        <Text style={styles.catAmount}>{formatCurrency(item.amount)}</Text>
                                    </View>
                                    <View style={styles.progressBg}>
                                        <View style={[styles.progressFill, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                                    </View>
                                    <Text style={styles.percentageText}>{item.percentage.toFixed(1)}%</Text>
                                </View>
                            </Animated.View>
                        );
                    })}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingTop: 60, paddingBottom: 100 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: { marginBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
    title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
    subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },

    trendCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: SPACING.lg,
        padding: SPACING.xl,
        backgroundColor: COLORS.glass,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        marginBottom: SPACING.xxl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    trendInfo: { flex: 1 },
    totalLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
    totalAmount: { fontSize: 36, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
    trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.3)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    trendText: { fontSize: 12, fontWeight: '600' },
    trendIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(52, 211, 153, 0.1)', justifyContent: 'center', alignItems: 'center' },

    chartSection: { alignItems: 'center', marginBottom: SPACING.xxl },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xl, alignSelf: 'flex-start', marginLeft: SPACING.lg },
    donutContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },

    // Bar Chart
    barChartSection: { marginBottom: SPACING.xxl, paddingHorizontal: SPACING.lg },
    barContainer: {
        height: 150,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        backgroundColor: COLORS.glass,
        padding: SPACING.lg,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    barWrapper: { alignItems: 'center', flex: 1 },
    bar: { width: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
    barGradient: { width: '100%', height: '100%' },
    barLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 8 },

    // Bonuses
    bonusesSection: { marginBottom: SPACING.xxl, paddingHorizontal: SPACING.lg },
    bonusCard: {
        backgroundColor: COLORS.primary,
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    bonusInfo: { flex: 1 },
    bonusCount: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
    bonusLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    bonusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    bonusBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
    offerRow: { flexDirection: 'row', gap: 12 },
    offerBox: { flex: 1, padding: 12, borderRadius: 16, alignItems: 'center' },
    offerText: { fontSize: 12, fontWeight: '600', color: '#1F2937' },

    detailsContainer: { paddingHorizontal: SPACING.lg },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 16,
    },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rowContent: { flex: 1 },
    rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    catName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    catAmount: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
    progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
    progressFill: { height: '100%', borderRadius: 3 },
    percentageText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right' }
});

export default InsightsScreen;
