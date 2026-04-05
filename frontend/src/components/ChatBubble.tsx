// Chat Bubble components for AI assistant - Optimized with memoization
import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { CheckCircle, Sparkles, Clock, Play, Pause } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { ChatMessage } from '../types';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { formatCurrency } from '../services/LocalizationManager';

interface ChatBubbleProps {
    message: ChatMessage;
    onConfirm?: () => void;
    confirmTitle?: string;
    payNowTitle?: string;
    successTitle?: string;
}

export const ChatBubble = memo<ChatBubbleProps>(({
    message,
    onConfirm,
    confirmTitle = 'Confirm Payment',
    payNowTitle = 'Pay Now',
    successTitle = 'Payment Success',
}) => {
    if (message.isUser) {
        if (message.messageType.type === 'audio') {
            return <AudioBubble
                duration={message.messageType.duration}
                uri={message.messageType.uri}
                isUser={true}
            />;
        }
        return <UserBubble text={message.messageType.type === 'text' ? message.text : ''} />;
    }

    const messageType = message.messageType;

    switch (messageType.type) {
        case 'text':
            return <BotTextBubble text={message.text} />;
        case 'confirmation':
            return (
                <ConfirmationBubble
                    amount={messageType.amount}
                    merchant={messageType.merchant}
                    bankName={messageType.bankName}
                    cardHint={messageType.cardHint}
                    onConfirm={onConfirm}
                    confirmTitle={confirmTitle}
                    payNowTitle={payNowTitle}
                />
            );
        case 'receipt':
            return (
                <ReceiptBubble
                    amount={messageType.amount}
                    merchant={messageType.merchant}
                    successTitle={successTitle}
                />
            );
        case 'audio':
            return <AudioBubble duration={messageType.duration} uri={messageType.uri || ''} />;
        default:
            return <BotTextBubble text={message.text} />;
    }
});

ChatBubble.displayName = 'ChatBubble';

// User message bubble - Memoized
const UserBubble = memo<{ text: string }>(({ text }) => (
    <Animated.View entering={FadeInRight.duration(300)} style={styles.userContainer}>
        <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userBubble}
        >
            <Text style={styles.userText}>{text}</Text>
        </LinearGradient>
    </Animated.View>
));

UserBubble.displayName = 'UserBubble';

// Bot text bubble - Memoized
const BotTextBubble = memo<{ text: string }>(({ text }) => (
    <Animated.View entering={FadeInLeft.duration(300)} style={styles.botContainer}>
        <View style={styles.avatarContainer}>
            <Sparkles size={18} color={COLORS.primary} />
        </View>
        <View style={styles.botBubble}>
            <Text style={styles.botText}>{text}</Text>
        </View>
    </Animated.View>
));

BotTextBubble.displayName = 'BotTextBubble';

// Audio message bubble - Memoized
const AudioBubble = memo<{ duration: number; uri?: string; isUser?: boolean }>(({ duration, uri, isUser }) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [sound, setSound] = React.useState<Audio.Sound | null>(null);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync().catch(() => { });
            }
        };
    }, [sound]);

    const handlePlayPause = async () => {
        if (!uri) return;

        try {
            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    // Reset position if at end
                    const status = await sound.getStatusAsync();
                    if (status.isLoaded && status.durationMillis && status.positionMillis >= status.durationMillis) {
                        await sound.setPositionAsync(0);
                    }
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                // First time playing
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true }
                );

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded) {
                        if (status.didJustFinish) {
                            setIsPlaying(false);
                        }
                    }
                });

                setSound(newSound);
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
        }
    };

    const formattedDuration = useMemo(() => {
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, [duration]);

    const containerStyle = isUser ? styles.userContainer : styles.botContainer;
    const bubbleStyle = isUser ? [styles.audioBubble, { backgroundColor: COLORS.primary, borderWidth: 0 }] : styles.audioBubble;
    const barColor = isUser ? '#FFFFFF' : (isPlaying ? COLORS.primary : COLORS.textSecondary);
    const textColor = isUser ? '#FFFFFF' : COLORS.textSecondary;

    return (
        <Animated.View entering={isUser ? FadeInRight.duration(300) : FadeInLeft.duration(300)} style={containerStyle}>
            {!isUser && (
                <View style={styles.avatarContainer}>
                    <Sparkles size={18} color={COLORS.primary} />
                </View>
            )}
            <TouchableOpacity onPress={handlePlayPause} activeOpacity={0.7}>
                <View style={bubbleStyle}>
                    <View style={styles.audioWaveform}>
                        <View style={[styles.playButton, isPlaying && styles.pauseButton, isUser && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <View style={[styles.playIcon, isPlaying && styles.pauseIcon, isUser && { borderLeftColor: '#FFF' }, isPlaying && isUser && { backgroundColor: '#FFF' }]} />
                        </View>
                        <View style={styles.waveformBars}>
                            {[...Array(8)].map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.audioBar,
                                        {
                                            height: 8 + Math.random() * 12,
                                            backgroundColor: barColor
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                    <View style={styles.audioDuration}>
                        <Clock size={12} color={textColor} />
                        <Text style={[styles.audioDurationText, { color: textColor }]}>
                            {isPlaying ? 'Playing...' : formattedDuration}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

AudioBubble.displayName = 'AudioBubble';

// Confirmation card bubble - Memoized
interface ConfirmationProps {
    amount: number;
    merchant: string;
    bankName: string;
    cardHint?: string;
    onConfirm?: () => void;
    confirmTitle: string;
    payNowTitle: string;
}

const ConfirmationBubble = memo<ConfirmationProps>(({
    amount,
    merchant,
    bankName,
    cardHint,
    onConfirm,
    confirmTitle,
    payNowTitle,
}) => {
    const formattedAmount = useMemo(() => formatCurrency(amount), [amount]);
    const isRecommended = useMemo(() => {
        if (!cardHint) return false;
        // Check if bankName roughly matches cardHint (e.g. "Kapital" in "Kapital Bank")
        return bankName.toLowerCase().includes(cardHint.toLowerCase()) ||
            cardHint.toLowerCase().includes(bankName.toLowerCase());
    }, [bankName, cardHint]);

    return (
        <Animated.View entering={FadeInLeft.duration(300)} style={styles.botContainer}>
            <View style={styles.avatarContainer}>
                <Sparkles size={18} color={COLORS.primary} />
            </View>
            <View style={styles.confirmCard}>
                <View style={styles.confirmHeader}>
                    <Text style={styles.confirmTitle}>{confirmTitle}</Text>
                    {isRecommended && (
                        <View style={styles.recommendedBadge}>
                            <Sparkles size={12} color="#FFF" />
                            <Text style={styles.recommendedText}>Tövsiyə olunur</Text>
                        </View>
                    )}
                </View>
                <View style={styles.divider} />

                <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>To:</Text>
                    <Text style={styles.confirmValue}>{merchant}</Text>
                </View>
                <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>From:</Text>
                    <Text style={styles.confirmValue}>{bankName}</Text>
                </View>
                <View style={styles.confirmRow}>
                    <Text style={styles.confirmLabel}>Amount:</Text>
                    <Text style={[styles.confirmValue, styles.confirmAmount]}>
                        {formattedAmount}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={onConfirm}
                    activeOpacity={0.8}
                    accessibilityLabel={payNowTitle}
                    accessibilityRole="button"
                >
                    <Text style={styles.confirmButtonText}>{payNowTitle}</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
});

ConfirmationBubble.displayName = 'ConfirmationBubble';

// Receipt bubble - Memoized
interface ReceiptProps {
    amount: number;
    merchant: string;
    successTitle: string;
}

const ReceiptBubble = memo<ReceiptProps>(({ amount, merchant, successTitle }) => {
    const formattedAmount = useMemo(() => formatCurrency(amount), [amount]);
    const timestamp = useMemo(() => {
        const now = new Date();
        return now.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
    }, []);

    return (
        <Animated.View entering={FadeInLeft.duration(300)} style={styles.botContainer}>
            <View style={styles.avatarContainer}>
                <Sparkles size={18} color={COLORS.primary} />
            </View>
            <View style={styles.receiptCard}>
                <Animated.View style={styles.successIcon}>
                    <CheckCircle size={48} color={COLORS.success} />
                </Animated.View>
                <Text style={styles.receiptTitle}>{successTitle}</Text>
                <Text style={styles.receiptAmount}>{formattedAmount}</Text>
                <Text style={styles.receiptMerchant}>paid to {merchant}</Text>
                <Text style={styles.receiptTimestamp}>{timestamp}</Text>
            </View>
        </Animated.View>
    );
});

ReceiptBubble.displayName = 'ReceiptBubble';

const styles = StyleSheet.create({
    userContainer: {
        alignItems: 'flex-end',
        marginVertical: SPACING.xs,
    },
    userBubble: {
        maxWidth: '80%',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: SPACING.xs,
    },
    userText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.lg, // Increased from md
        lineHeight: FONT_SIZE.lg * 1.4,
    },
    botContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: SPACING.xs,
        gap: SPACING.sm,
    },
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${COLORS.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botBubble: {
        maxWidth: '75%',
        padding: SPACING.md,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.xl,
        borderBottomLeftRadius: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    botText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.lg, // Increased from md
        lineHeight: FONT_SIZE.lg * 1.5,
    },

    // Audio Bubble
    audioBubble: {
        maxWidth: '60%',
        padding: SPACING.md,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.xl,
        borderBottomLeftRadius: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    audioWaveform: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginBottom: SPACING.xs,
    },
    audioBar: {
        width: 3,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    audioDuration: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    audioDurationText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
    },

    // Confirmation Card
    confirmCard: {
        flex: 1,
        marginRight: SPACING.xxl,
        padding: SPACING.lg,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    confirmHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    confirmTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    recommendedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    recommendedText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.glassBorder,
        marginVertical: SPACING.sm,
    },
    confirmRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: SPACING.xs,
    },
    confirmLabel: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZE.md,
    },
    confirmValue: {
        color: COLORS.text,
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
    },
    confirmAmount: {
        color: COLORS.primary,
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.md,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    confirmButtonText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
    },

    // Receipt Card
    receiptCard: {
        flex: 1,
        marginRight: SPACING.xxl,
        padding: SPACING.xl,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: `${COLORS.success}30`,
        alignItems: 'center',
    },
    successIcon: {
        marginBottom: SPACING.sm,
    },
    receiptTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.success,
        marginTop: SPACING.sm,
    },
    receiptAmount: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.xs,
    },
    receiptMerchant: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    receiptTimestamp: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        marginTop: SPACING.md,
    },

    // Improved Audio Styles
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    pauseButton: {
        backgroundColor: COLORS.text,
    },
    playIcon: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 0,
        borderBottomWidth: 7,
        borderTopWidth: 7,
        borderLeftColor: COLORS.text,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
        marginLeft: 2,
    },
    pauseIcon: {
        width: 10,
        height: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    waveformBars: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        height: 24,
    },
});
