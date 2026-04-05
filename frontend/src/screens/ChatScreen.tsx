// ChatScreen - Optimized AI Assistant with improved NLP
import React, { useState, useRef, useMemo, useCallback, memo, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Mic, Send, Sparkles, Square } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { ChatMessage, MessageType, Card } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { useAppContext } from '../context/AppContext';
import { getStrings } from '../services/LocalizationManager';
import { QUICK_ACTIONS_EN, QUICK_ACTIONS_AZ } from '../constants/mockData';
import { QuickChip } from '../components/QuickChip';
import { ChatBubble } from '../components/ChatBubble';
import { Alert } from 'react-native';
import { AIService, AIChatMessage, AIResponse } from '../services/AIService';

// Helper function to convert file URI to base64 without expo-file-system
const uriToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            // Remove data URL prefix (e.g., "data:audio/m4a;base64,")
            const base64Data = base64.split(',')[1] || base64;
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Initial welcome message generator
const getWelcomeMessage = (language: 'en' | 'az'): ChatMessage => ({
    id: 'welcome',
    text: language === 'az'
        ? 'Salam! Mən sizin AI bank köməkçinizəm. 💳\n\nNümunə əmrlər:\n• "ABB kartından işıq haqqı 25 AZN ödə"\n• "Azercell 10 AZN artır"\n• "Balansımı göstər"'
        : 'Hello! I am your AI banking assistant. 💳\n\nExample commands:\n• "Pay electricity bill 25 AZN from ABB"\n• "Top up Azercell 10 AZN"\n• "Show my balance"',
    isUser: false,
    date: new Date(),
    messageType: { type: 'text' },
});

// Memoized Quick Chip
const MemoizedQuickChip = memo(QuickChip);

const ChatScreen: React.FC = () => {
    const { language } = useAppContext();
    const strings = useMemo(() => getStrings(language), [language]);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const quickActions = useMemo(
        () => (language === 'az' ? QUICK_ACTIONS_AZ : QUICK_ACTIONS_EN),
        [language]
    );

    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);
    const [input, setInput] = useState('');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => [
        getWelcomeMessage(language),
    ]);
    const [cards, setCards] = useState<Card[]>([]);

    const getChatHistory = useCallback(() => {
        const history = messages
            .slice(-6) // Last 6 messages for context
            .map(m => ({
                role: m.isUser ? 'user' : 'model' as 'user' | 'model',
                parts: [{ text: m.text || (m.messageType?.type === 'confirmation' ? (m.text || 'Ödənişi təsdiqləyək?') : '') }]
            }))
            .filter(h => h.parts[0].text.length > 0);

        // Gemini requires first message to be from 'user', skip leading 'model' messages
        const firstUserIndex = history.findIndex(h => h.role === 'user');
        return firstUserIndex > 0 ? history.slice(firstUserIndex) : (firstUserIndex === 0 ? history : []);
    }, [messages]);

    const scrollToBottom = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const processedPaymentRef = useRef<string | null>(null);

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await DatabaseService.getCards();
                setCards(data);
            } catch (error) {
                console.error('Error loading cards for NLP:', error);
            }
        };
        loadInitialData();
    }, []);

    // Setup audio permissions
    useEffect(() => {
        const setupAudio = async () => {
            try {
                await Audio.requestPermissionsAsync();
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
            } catch (error) {
                console.error('Audio setup error:', error);
            }
        };
        setupAudio();
    }, []);

    // Handle Keyboard visibility for dynamic margin
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const keyboardShowListener = Keyboard.addListener(
            showEvent,
            () => setKeyboardVisible(true)
        );
        const keyboardHideListener = Keyboard.addListener(
            hideEvent,
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardHideListener.remove();
            keyboardShowListener.remove();
        };
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        const timer = setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 150);
        return () => clearTimeout(timer);
    }, [messages]);

    // Initial Proactive Greeting
    useEffect(() => {
        if (messages.length === 0 && !isProcessing) {
            const firstGreeting: ChatMessage = {
                id: 'proactive-1',
                text: language === 'az'
                    ? "Salam! ✨ Sənin maliyyə dostun buradadır. 😊 Bu gün sənə necə kömək edə bilərəm? Ödənişlərin var, yoxsa sadəcə büdcəni planlayaq? 🚀"
                    : "Hello! ✨ Your financial friend is here. 😊 How can I help you today? Have payments to make, or should we plan your budget? 🚀",
                isUser: false,
                date: new Date(),
                messageType: { type: 'text' }
            };
            setMessages([firstGreeting]);
        }
    }, []);

    // Handle Deep Linking Query
    useEffect(() => {
        if (route.params?.query) {
            setInput(route.params.query);
            // Optionally auto-send:
            // handleSend(); 
        }
    }, [route.params?.query]);

    // Handle Payment Success Return from PSP
    useEffect(() => {
        if (route.params?.paymentSuccess) {
            const { amount, merchant, bonus, bonusPartner } = route.params.transactionDetails || {};

            // Prevent duplicate messages with unique key
            const paymentKey = `${amount}-${merchant}-${Date.now()}`;
            if (processedPaymentRef.current === paymentKey) return;
            processedPaymentRef.current = paymentKey;

            // Show Receipt
            const receiptMessage: ChatMessage = {
                id: Date.now().toString(),
                text: '',
                isUser: false,
                date: new Date(),
                messageType: {
                    type: 'receipt',
                    amount: parseFloat(amount),
                    merchant: merchant,
                },
            };
            setMessages(prev => [...prev, receiptMessage]);

            // Show Bonus (if any)
            if (parseFloat(bonus) > 0) {
                setTimeout(() => {
                    const bonusMsg: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        text: language === 'az'
                            ? `🎉 Təbriklər! ${bonusPartner} ilə ödənişdən ${bonus} AZN bonus qazandınız!`
                            : `🎉 Congratulations! You earned ${bonus} AZN bonus from ${bonusPartner}!`,
                        isUser: false,
                        date: new Date(),
                        messageType: { type: 'text' }
                    };
                    setMessages(prev => [...prev, bonusMsg]);
                }, 800);
            }

            // Refresh cards
            DatabaseService.getCards().then(setCards);

            // Clear params immediately
            navigation.setParams({ paymentSuccess: undefined, transactionDetails: undefined });
        }
    }, [route.params?.paymentSuccess]);

    // Handle voice recording
    const handleMicPress = useCallback(async () => {
        if (isProcessing) return;

        if (isRecording) {
            // Stop recording
            try {
                setIsRecording(false);
                const recording = recordingRef.current;
                if (!recording) return;

                // Get duration before unloading
                const status = await recording.getStatusAsync();
                const duration = Math.floor(status.durationMillis / 1000);

                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                recordingRef.current = null;

                if (uri) {
                    setIsProcessing(true);

                    // Add user "voice" message with audio type
                    const userMessage: ChatMessage = {
                        id: Date.now().toString(),
                        text: '',
                        isUser: true,
                        date: new Date(),
                        messageType: {
                            type: 'audio',
                            duration: duration,
                            uri: uri
                        },
                    };
                    setMessages(prev => [...prev, userMessage]);

                    // Read audio file as base64 (using fetch+blob instead of expo-file-system)
                    const base64Audio = await uriToBase64(uri);
                    console.log('Audio base64 length:', base64Audio.length);

                    // Gemini accepts audio/mp4 for m4a files
                    const mimeType = 'audio/mp4';

                    // Send to AI with history
                    const history = getChatHistory();
                    const aiResponse = await AIService.chatWithAudio(base64Audio, mimeType, history);

                    const responseMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        text: aiResponse.type === 'message' ? aiResponse.text : aiResponse.confirmation_text || '',
                        isUser: false,
                        date: new Date(),
                        messageType: aiResponse.type === 'payment_request'
                            ? {
                                type: 'confirmation',
                                amount: aiResponse.amount,
                                merchant: aiResponse.merchant,
                                bankName: aiResponse.card_hint || 'ABB',
                                cardHint: aiResponse.card_hint
                            }
                            : { type: 'text' },
                    };
                    setMessages(prev => [...prev, responseMessage]);
                    setIsProcessing(false);
                }
            } catch (error) {
                console.error('Stop recording error:', error);
                setIsRecording(false);
                setIsProcessing(false);
                Alert.alert('Xəta', 'Səs yazılması uğursuz oldu');
            }
        } else {
            // Start recording
            try {
                const { status } = await Audio.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('İcazə lazımdır', 'Səs yazmaq üçün mikrofon icazəsi lazımdır');
                    return;
                }

                const recording = new Audio.Recording();
                await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
                await recording.startAsync();
                recordingRef.current = recording;
                setIsRecording(true);
            } catch (error) {
                console.error('Start recording error:', error);
                Alert.alert('Xəta', 'Mikrofonu işə salmaq mümkün olmadı');
            }
        }
    }, [isRecording, isProcessing]);

    // Handle send message
    const handleSend = useCallback(async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isProcessing) return;

        Keyboard.dismiss();
        setIsProcessing(true);

        // Add user message locally for immediate feedback
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: trimmedInput,
            isUser: true,
            date: new Date(),
            messageType: { type: 'text' },
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Immediate scroll
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 50);

        try {
            // Persist User Message
            DatabaseService.saveChatMessage(trimmedInput, false);

            // Fetch Real AI Response from Edge Function with history context
            const history = getChatHistory();
            const aiResponse: AIResponse = await AIService.chat(trimmedInput, history);

            const responseId = Date.now().toString();
            const date = new Date();
            let finalResponse: ChatMessage;

            if (aiResponse.type === 'payment_request') {
                finalResponse = {
                    id: responseId,
                    text: aiResponse.confirmation_text || '',
                    isUser: false,
                    date,
                    messageType: {
                        type: 'confirmation',
                        amount: aiResponse.amount,
                        merchant: aiResponse.merchant,
                        bankName: aiResponse.card_hint || (cards[0]?.bankName || 'ABB'),
                        cardHint: aiResponse.card_hint,
                    }
                };
            } else {
                finalResponse = {
                    id: responseId,
                    text: aiResponse.text,
                    isUser: false,
                    date,
                    messageType: { type: 'text' }
                };
            }

            setMessages(prev => [...prev, finalResponse]);

            // Persist Bot Message
            if (finalResponse.text) {
                DatabaseService.saveChatMessage(finalResponse.text, true);
            }

        } catch (error: any) {
            console.error('Chat error:', error);
            // Fallback to local logic or error message
            const errorMsg: ChatMessage = {
                id: Date.now().toString(),
                text: language === 'az' ? 'Xidmət müvəqqəti əlçatmazdır.' : 'Service temporarily unavailable.',
                isUser: false,
                date: new Date(),
                messageType: { type: 'text' }
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsProcessing(false);
            // Scroll to bottom
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [input, isProcessing, language, cards]);

    // Handle payment confirmation - Redirect to PSP
    const handleConfirm = useCallback(async (amount: number, merchant: string, bankName: string) => {
        // Find card ID for the bank (logic check only)
        const selectedCard = cards.find(c => c.bankName === bankName) || cards[0];
        if (!selectedCard) {
            Alert.alert('Error', 'No card available');
            return;
        }

        // Navigate to Mock PSP Screen
        navigation.navigate('PSP', {
            amount,
            merchant,
            bankName
        });

    }, [cards, navigation]);

    // Handle quick action
    const handleQuickAction = useCallback((action: string) => {
        const cleanedAction = action.replace(/[^\w\s\u0080-\uFFFF]/gi, '').trim();
        setInput(cleanedAction);
        inputRef.current?.focus();
    }, []);

    // Memoized message render
    const renderMessage = useCallback((message: ChatMessage) => {
        const messageType = message.messageType;
        return (
            <Animated.View key={message.id} entering={FadeIn.duration(300)}>
                <ChatBubble
                    message={message}
                    onConfirm={
                        messageType.type === 'confirmation'
                            ? () => handleConfirm(
                                (messageType as { type: 'confirmation'; amount: number; merchant: string, bankName: string }).amount,
                                (messageType as { type: 'confirmation'; amount: number; merchant: string, bankName: string }).merchant,
                                (messageType as { type: 'confirmation'; amount: number; merchant: string, bankName: string }).bankName
                            )
                            : undefined
                    }
                    confirmTitle={strings.confirmPayment}
                    payNowTitle={strings.payNow}
                    successTitle={strings.paymentSuccess}
                />
            </Animated.View>
        );
    }, [handleConfirm, strings]);

    return (
        <LinearGradient
            colors={[COLORS.background, COLORS.backgroundLight]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <Animated.View entering={FadeInUp} style={styles.header}>
                    <View style={styles.headerContent}>
                        <Sparkles size={24} color={COLORS.primary} />
                        <Text style={styles.headerTitle}>{strings.aiAssistant}</Text>
                    </View>
                </Animated.View>

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {messages.map(renderMessage)}
                    {isProcessing && (
                        <View style={styles.typingIndicator}>
                            <Text style={styles.typingText}>...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View style={[
                    styles.inputContainer,
                    { marginBottom: isKeyboardVisible ? (Platform.OS === 'ios' ? 0 : SPACING.md) : 90 }
                ]}>
                    <BlurView
                        intensity={Platform.OS === 'ios' ? 80 : 100}
                        tint="dark"
                        style={styles.inputBlur}
                    >
                        {/* Quick Chips */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.chipsContainer}
                            contentContainerStyle={styles.chipsContent}
                        >
                            {quickActions.map((action, index) => (
                                <MemoizedQuickChip
                                    key={index}
                                    label={action}
                                    onPress={() => handleQuickAction(action)}
                                />
                            ))}
                        </ScrollView>

                        {/* Text Input */}
                        <View style={styles.inputRow}>
                            <TextInput
                                ref={inputRef}
                                style={styles.input}
                                placeholder={strings.typeCommand}
                                placeholderTextColor={COLORS.textMuted}
                                value={input}
                                onChangeText={setInput}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                                editable={!isProcessing}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, isProcessing && styles.sendButtonDisabled]}
                                onPress={input ? handleSend : handleMicPress}
                                activeOpacity={0.7}
                                disabled={isProcessing}
                            >
                                {input ? (
                                    <LinearGradient
                                        colors={[COLORS.primary, '#7C3AED']}
                                        style={styles.sendGradient}
                                    >
                                        <Send size={20} color={COLORS.text} />
                                    </LinearGradient>
                                ) : isRecording ? (
                                    <View style={[styles.micButton, { backgroundColor: '#FF3B30' }]}>
                                        <Square size={20} color={COLORS.text} />
                                    </View>
                                ) : (
                                    <View style={styles.micButton}>
                                        <Mic size={20} color={COLORS.text} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </View>
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

    // Header
    header: {
        paddingTop: Platform.OS === 'ios' ? SPACING.xxxl * 2 : SPACING.xxxl * 1.5,
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '600',
        color: COLORS.text,
    },

    // Messages
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.lg, // Reduced padding since input is no longer absolute
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    typingText: {
        fontSize: FONT_SIZE.xxl,
        color: COLORS.primary,
        letterSpacing: 4,
    },

    // Input - Now Flex based, not absolute
    inputContainer: {
        marginBottom: 90, // Clear the floating tab bar
        marginHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        backgroundColor: COLORS.glass,
    },
    inputBlur: {
        padding: SPACING.md,
    },
    chipsContainer: {
        marginBottom: SPACING.md,
    },
    chipsContent: {
        gap: SPACING.sm,
        paddingHorizontal: SPACING.xs,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)', // Slightly darker for contrast
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        color: COLORS.text,
        fontSize: FONT_SIZE.md,
        maxHeight: 100, // Limit height for multiple lines
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    micButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
});

export default ChatScreen;
