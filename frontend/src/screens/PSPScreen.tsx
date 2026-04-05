import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, CreditCard, Lock, ArrowRight, X } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn, SlideInDown } from 'react-native-reanimated';
import { RootStackParamList } from '../types';
import { DatabaseService } from '../services/DatabaseService';

type PSPScreenRouteProp = RouteProp<RootStackParamList, 'PSP'>;

const PSPScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<PSPScreenRouteProp>();

    // Params might be undefined if opened directly, so handle gracefully
    // But logically it strictly comes from Chat with params
    const { amount, merchant, bankName } = (route.params as any) || { amount: 0, merchant: 'Unknown', bankName: 'Bank' };

    const [otp, setOtp] = useState(['', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Generate random OTP on mount
    useEffect(() => {
        const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(randomOtp);

        // Timer countdown
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Handle Input
    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 3) {
            inputs.current[index + 1]?.focus();
        }

        // Auto-submit on last digit
        if (index === 3 && text) {
            inputs.current[index]?.blur();
            // Check immediately
            const enteredOtp = newOtp.join('');
            if (enteredOtp === generatedOtp) {
                handleConfirmParams(newOtp.join(''));
            }
        }
    };

    const handleConfirmParams = async (currentOtpString?: string) => {
        const enteredOtp = currentOtpString || otp.join('');
        if (enteredOtp !== generatedOtp) {
            Alert.alert('Error', 'Incorrect OTP code.');
            return;
        }
        await startPaymentProcess();
    };

    const handleConfirm = () => handleConfirmParams();

    const startPaymentProcess = async () => {

        // Fake network delay
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);

            // Determine bonus based on bank (Mock Logic)
            let bonus = '0.00';
            let bonusPartner = '';

            if (bankName.includes('Kapital')) { // Using includes for loose matching
                if (merchant.toLowerCase().includes('cinema')) { bonus = (amount * 0.1).toFixed(2); bonusPartner = 'CinemaPlus'; }
                else if (merchant.toLowerCase().includes('wolt')) { bonus = (amount * 0.05).toFixed(2); bonusPartner = 'Wolt'; }
                else { bonus = (amount * 0.01).toFixed(2); }
            } else if (bankName.includes('ABB')) {
                if (merchant.toLowerCase().includes('bolt')) { bonus = (amount * 0.05).toFixed(2); bonusPartner = 'Bolt'; }
                else { bonus = (amount * 0.01).toFixed(2); }
            }

            // Persist Bonus with card name
            if (parseFloat(bonus) > 0) {
                DatabaseService.recordBonus(bonusPartner || 'General', parseFloat(bonus), bankName);
            }

            // Redirect back after success animation
            setTimeout(() => {
                navigation.navigate('Main', {
                    screen: 'Chat',
                    params: {
                        paymentSuccess: true,
                        transactionDetails: {
                            amount,
                            merchant,
                            bonus,
                            bonusPartner
                        }
                    }
                });
            }, 2000);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <View style={styles.successContainer}>
                <Animated.View entering={ZoomIn} style={styles.successIcon}>
                    <ShieldCheck size={80} color={COLORS.success} />
                </Animated.View>
                <Text style={styles.successTitle}>Payment Successful!</Text>
                <Text style={styles.successAmount}>{amount} AZN</Text>
                <Text style={styles.successMerchant}>to {merchant}</Text>
                <ActivityIndicator size="small" color={COLORS.textSecondary} style={{ marginTop: 20 }} />
                <Text style={styles.redirectText}>Redirecting to Chat...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={styles.gradient}
            >
                {/* Header mimicking 3D Secure */}
                <View style={styles.header}>
                    <View style={styles.bankLogo}>
                        <Text style={styles.bankName}>{bankName} Secure</Text>
                    </View>
                    <View style={styles.secureBadge}>
                        <Lock size={14} color="#FFF" />
                        <Text style={styles.secureText}>Verified by Visa</Text>
                    </View>
                </View>

                {/* Card Content */}
                <Animated.View entering={SlideInDown.delay(200)} style={styles.card}>
                    <View style={styles.merchantRow}>
                        <View style={styles.iconBg}>
                            <CreditCard size={24} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text style={styles.label}>Merchant</Text>
                            <Text style={styles.value}>{merchant}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.label}>Amount</Text>
                            <Text style={styles.amountValue}>{amount} AZN</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.otpLabel}>Enter One-Time Password (OTP)</Text>
                    <Text style={styles.otpSubLabel}>
                        Code sent to +994 50 *** ** 12
                    </Text>

                    {/* FAKE OTP DISPLAY FOR USER CONVENIENCE */}
                    <View style={styles.fakeSmsNotification}>
                        <Text style={styles.smsText}>💬 SMS: Your code is <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>{generatedOtp}</Text></Text>
                    </View>

                    <View style={styles.otpInputContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => { inputs.current[index] = el; }}
                                style={styles.otpInput}
                                keyboardType="numeric"
                                maxLength={1}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                placeholder="-"
                                placeholderTextColor="#555"
                            />
                        ))}
                    </View>

                    <Text style={styles.timer}>Expiries in 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</Text>

                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                                <ArrowRight size={20} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1, padding: SPACING.lg, justifyContent: 'center' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xxl,
        marginTop: SPACING.xxl
    },
    bankLogo: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#fff',
        borderRadius: 4
    },
    bankName: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16
    },
    secureText: {
        color: '#fff',
        fontSize: 12
    },

    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: '#333',
    },
    merchantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.lg
    },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    label: { color: COLORS.textSecondary, fontSize: 12 },
    value: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
    amountValue: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },

    divider: { height: 1, backgroundColor: '#333', marginBottom: SPACING.lg },

    otpLabel: { color: COLORS.text, fontSize: 16, marginBottom: 4, textAlign: 'center' },
    otpSubLabel: { color: COLORS.textSecondary, fontSize: 12, marginBottom: SPACING.lg, textAlign: 'center' },

    fakeSmsNotification: {
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        padding: 10,
        borderRadius: 8,
        marginBottom: SPACING.lg,
        alignItems: 'center'
    },
    smsText: { color: COLORS.success, fontSize: 14 },

    otpInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: SPACING.lg
    },
    otpInput: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#2C2C2E',
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#444'
    },

    timer: { color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.xl },

    confirmButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md
    },
    confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    cancelButton: { alignItems: 'center' },
    cancelText: { color: COLORS.textSecondary },

    successContainer: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center'
    },
    successIcon: { marginBottom: SPACING.xl },
    successTitle: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    successAmount: { color: COLORS.text, fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
    successMerchant: { color: COLORS.textSecondary, fontSize: 18 },
    redirectText: { color: COLORS.textMuted, fontSize: 14, marginTop: 8 }

});

export default PSPScreen;
