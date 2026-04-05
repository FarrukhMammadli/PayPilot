// LoginScreen - matching SwiftUI WelcomeView + BiometricLoginView
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Scan, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getStrings } from '../services/LocalizationManager';
import { supabase } from '../lib/supabase';

type ScreenState = 'welcome' | 'login' | 'biometric';

const LoginScreen: React.FC = () => {
    const { language, setIsLoggedIn } = useAppContext();
    const strings = getStrings(language);

    const [screenState, setScreenState] = useState<ScreenState>('welcome');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [biometricSuccess, setBiometricSuccess] = useState(false);

    // Animation values
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Biometric animation
    useEffect(() => {
        if (screenState === 'biometric') {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                { iterations: 1 }
            ).start(() => {
                setBiometricSuccess(true);
                Animated.spring(scaleAnim, {
                    toValue: 1.2,
                    friction: 3,
                    useNativeDriver: true,
                }).start(() => {
                    setTimeout(() => setIsLoggedIn(true), 800);
                });
            });
        }
    }, [screenState]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const handleLogin = async () => {
        if (!email || !password) return;

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // On success, show biometric animation for "Identity Verification" feel
            setScreenState('biometric');
        } catch (error: any) {
            Alert.alert("Login Error", error.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password) return;

        setIsLoading(true);
        try {
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: email.split('@')[0], // placeholder
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                setScreenState('biometric');
            } else {
                Alert.alert("Verification required", "Check your email for confirmation!");
            }
        } catch (error: any) {
            Alert.alert("Registration Error", error.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    // Welcome Screen
    if (screenState === 'welcome') {
        return (
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.container}
            >
                <View style={styles.welcomeContent}>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoGlow} />
                        <View style={styles.logoIcon}>
                            <CreditCard size={60} color={COLORS.primary} />
                        </View>
                    </View>

                    <Text style={styles.appName}>CardAssistant</Text>
                    <Text style={styles.tagline}>{strings.onePromptAllPayments}</Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton, SHADOWS.button]}
                        onPress={() => setScreenState('login')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>{strings.logIn}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={handleSignUp}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonTextSecondary}>{strings.createAccount}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    // Biometric Screen
    if (screenState === 'biometric') {
        return (
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.container}
            >
                <View style={styles.biometricContent}>
                    <Animated.View
                        style={[
                            styles.biometricIcon,
                            {
                                transform: [{ rotate }, { scale: scaleAnim }],
                            },
                        ]}
                    >
                        {biometricSuccess ? (
                            <CheckCircle size={80} color={COLORS.success} />
                        ) : (
                            <Scan size={80} color={COLORS.text} />
                        )}
                    </Animated.View>

                    <Text
                        style={[
                            styles.biometricText,
                            biometricSuccess && { color: COLORS.success },
                        ]}
                    >
                        {biometricSuccess ? strings.identityVerified : strings.verifyingIdentity}
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    // Login Screen
    return (
        <LinearGradient
            colors={[COLORS.background, COLORS.backgroundLight]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.loginContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.loginHeader}>
                        <View style={styles.avatarContainer}>
                            <CreditCard size={40} color={COLORS.primary} />
                        </View>
                        <Text style={styles.welcomeBack}>{strings.welcomeBack}</Text>
                        <Text style={styles.signInText}>{strings.signIn}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{strings.email}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="demo@app.com"
                                placeholderTextColor={COLORS.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>{strings.password}</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="••••••••"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} color={COLORS.textSecondary} />
                                    ) : (
                                        <Eye size={20} color={COLORS.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton, styles.loginButton]}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>
                            {isLoading ? '...' : strings.logIn}
                        </Text>
                    </TouchableOpacity>

                    {/* Demo Hint */}
                    <View style={styles.demoHint}>
                        <Text style={styles.demoTitle}>{strings.demoAccess}</Text>
                        <Text style={styles.demoText}>{strings.demoEmail}</Text>
                        <Text style={styles.demoText}>{strings.demoPassword}</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },

    // Welcome
    welcomeContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        position: 'relative',
        marginBottom: SPACING.xl,
    },
    logoGlow: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: `${COLORS.primary}20`,
        top: -35,
        left: -35,
    },
    logoIcon: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appName: {
        fontSize: FONT_SIZE.display,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    tagline: {
        fontSize: FONT_SIZE.xl,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
    },
    buttonContainer: {
        paddingHorizontal: SPACING.xxxl,
        paddingBottom: SPACING.xxxl * 2,
        gap: SPACING.md,
    },
    button: {
        paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: COLORS.glass,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    buttonText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
    },
    buttonTextSecondary: {
        color: COLORS.text,
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
    },

    // Biometric
    biometricContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    biometricIcon: {
        marginBottom: SPACING.xl,
    },
    biometricText: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },

    // Login
    loginContent: {
        flexGrow: 1,
        padding: SPACING.xxxl,
        justifyContent: 'center',
    },
    loginHeader: {
        alignItems: 'center',
        marginBottom: SPACING.xxxl,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${COLORS.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    welcomeBack: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    signInText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    form: {
        gap: SPACING.lg,
        marginBottom: SPACING.xl,
    },
    inputContainer: {
        gap: SPACING.sm,
    },
    inputLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    input: {
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.lg,
        color: COLORS.text,
        fontSize: FONT_SIZE.md,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeButton: {
        position: 'absolute',
        right: SPACING.lg,
        top: '50%',
        marginTop: -10,
    },
    loginButton: {
        marginBottom: SPACING.xl,
    },
    demoHint: {
        alignItems: 'center',
        gap: SPACING.xs,
    },
    demoTitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    demoText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
    },
});

export default LoginScreen;
