// Bank Card component with gradient - Optimized
import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Wifi } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../types';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../services/LocalizationManager';
import { useAppContext } from '../context/AppContext';
import { getStrings } from '../services/LocalizationManager';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 200;

interface BankCardProps {
    card: Card;
    index?: number;
}

export const BankCard = memo<BankCardProps>(({ card, index = 0 }) => {
    const { language } = useAppContext();
    const strings = getStrings(language);

    // Memoize static computations
    const formattedBalance = useMemo(() => formatCurrency(card.balance), [card.balance]);
    const maskedNumber = useMemo(() => `•••• •••• •••• ${card.cardNumber}`, [card.cardNumber]);

    const colors = useMemo(() => {
        switch (card.bankName) {
            case 'ABB': return ['#0033A0', '#0097D7'] as [string, string];
            case 'Kapital': return ['#E30613', '#A0040D'] as [string, string];
            case 'Leo': return ['#1A1A1A', '#333333'] as [string, string];
            default: return ['#6366F1', '#A855F7'] as [string, string];
        }
    }, [card.bankName]);

    // Animation delay based on index
    const animationDelay = index * 100;

    return (
        <Animated.View
            entering={FadeInDown.delay(animationDelay).springify()}
            style={[styles.container, SHADOWS.card]}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Decorative circles */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />

                {/* Card content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.chipContainer}>
                            <CreditCard size={24} color={COLORS.text} />
                        </View>
                        <View style={styles.contactlessContainer}>
                            <Wifi
                                size={20}
                                color={COLORS.text}
                                style={styles.wifiIcon}
                            />
                        </View>
                    </View>

                    {/* Card number */}
                    <Text
                        style={styles.cardNumber}
                        accessibilityLabel={`Card ending in ${card.cardNumber}`}
                    >
                        {maskedNumber}
                    </Text>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View>
                            <Text style={styles.label}>{card.bankName}</Text>
                        </View>
                        <View style={styles.balanceContainer}>
                            <Text style={styles.label}>
                                {strings.totalBalance || 'Balance'}
                            </Text>
                            <Text style={styles.balance}>{formattedBalance}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for memo
    return (
        prevProps.card.id === nextProps.card.id &&
        prevProps.card.balance === nextProps.card.balance &&
        prevProps.index === nextProps.index
    );
});

BankCard.displayName = 'BankCard';

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        position: 'relative',
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    content: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chipContainer: {
        width: 45,
        height: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: BORDER_RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactlessContainer: {
        opacity: 0.8,
    },
    wifiIcon: {
        transform: [{ rotate: '90deg' }],
    },
    cardNumber: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '600',
        color: COLORS.text,
        letterSpacing: 3,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    label: {
        fontSize: FONT_SIZE.xs,
        color: 'rgba(255, 255, 255, 0.6)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardName: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 2,
    },
    balanceContainer: {
        alignItems: 'flex-end',
    },
    balance: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 2,
    },
});
