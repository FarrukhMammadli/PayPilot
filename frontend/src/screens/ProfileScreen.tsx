// ProfileScreen - matching SwiftUI ProfileView
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import {
    Settings,
    CheckCircle,
    HelpCircle,
    MessageCircle,
    ChevronRight,
    LogOut,
    Camera,
} from 'lucide-react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppContext, useAppAuth } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getStrings } from '../services/LocalizationManager';
import { DatabaseService } from '../services/DatabaseService';
import { supabase } from '../lib/supabase';

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const { language, updateUserProfile } = useAppContext();
    const { user, signOut } = useAuth();
    const strings = getStrings(language);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState('User');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('+994 50 XXX XX XX');
    const [cardCount, setCardCount] = useState(0);
    const [txCount, setTxCount] = useState(0);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    // Handle profile image selection
    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İcazə lazımdır', 'Şəkil seçmək üçün galereyaya giriş icazəsi lazımdır');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setProfileImage(result.assets[0].uri);
            // Optionally save to Supabase user metadata
            try {
                await supabase.auth.updateUser({
                    data: { avatar_url: result.assets[0].uri }
                });
            } catch (error) {
                console.error('Error saving avatar:', error);
            }
        }
    };

    useEffect(() => {
        // Load user info from Supabase
        if (user) {
            setEmail(user.email || '');
            const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
            setName(fullName);
            // Load saved avatar if exists
            if (user.user_metadata?.avatar_url) {
                setProfileImage(user.user_metadata.avatar_url);
            }
            // Sync with AppContext if different
            updateUserProfile({ name: fullName, email: user.email || '' });
        }
        // Load stats
        const loadStats = async () => {
            try {
                const cards = await DatabaseService.getCards();
                const txs = await DatabaseService.getTransactions();
                setCardCount(cards.length);
                setTxCount(txs.length);
            } catch (e) {
                console.error(e);
            }
        };
        loadStats();
    }, [user]);

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: name }
            });
            if (error) throw error;

            updateUserProfile({ name });
            setIsEditing(false);
            Alert.alert('Uğurlu', 'Məlumatlar yadda saxlanıldı!');
        } catch (error: any) {
            Alert.alert('Xəta', error.message || 'Məlumatlar yadda saxlanıla bilmədi');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Çıxış',
            'Hesabdan çıxmaq istəyirsiniz?',
            [
                { text: 'Ləğv et', style: 'cancel' },
                { text: 'Çıxış', style: 'destructive', onPress: signOut },
            ]
        );
    };

    const stats = [
        { value: cardCount.toString(), label: strings.cards },
        { value: txCount.toString(), label: strings.transactions },
        { value: '5', label: strings.saved, color: COLORS.success },
    ];

    return (
        <LinearGradient
            colors={[COLORS.background, COLORS.backgroundLight]}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => navigation.navigate('Settings' as never)}
                    >
                        <Settings size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
                        {profileImage ? (
                            <Image
                                source={{ uri: profileImage }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.success]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.avatar}
                            >
                                <Text style={styles.avatarText}>{name.charAt(0)}</Text>
                            </LinearGradient>
                        )}
                        {/* Camera overlay */}
                        <View style={styles.cameraOverlay}>
                            <Camera size={16} color={COLORS.text} />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.userName}>{name}</Text>

                    {/* Verification Badge */}
                    <View style={styles.badge}>
                        <CheckCircle size={14} color={COLORS.success} />
                        <Text style={styles.badgeText}>{strings.verifiedAccount}</Text>
                    </View>

                    <Text style={styles.kycText}>{strings.kycPassed}</Text>
                </View>

                {/* Personal Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{strings.personalInformation}</Text>
                        {!isEditing && (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <Text style={styles.editButton}>{strings.edit}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <InfoRow
                        label={strings.fullName}
                        value={name}
                        isEditing={isEditing}
                        onChangeText={setName}
                    />
                    <View style={styles.divider} />
                    <InfoRow
                        label={strings.emailAddress}
                        value={email}
                        isEditing={isEditing}
                        onChangeText={setEmail}
                    />
                    <View style={styles.divider} />
                    <InfoRow
                        label={strings.phoneNumber}
                        value={phone}
                        isEditing={isEditing}
                        onChangeText={setPhone}
                    />

                    {isEditing && (
                        <View style={styles.editButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setIsEditing(false)}
                            >
                                <Text style={styles.cancelButtonText}>{strings.cancel}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, isSaving && { opacity: 0.5 }]}
                                onPress={handleSaveChanges}
                                disabled={isSaving}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isSaving ? '...' : strings.saveChanges}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Support */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{strings.support}</Text>

                    <TouchableOpacity style={styles.supportRow}>
                        <View style={[styles.supportIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                            <HelpCircle size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.supportInfo}>
                            <Text style={styles.supportTitle}>{strings.helpCenter}</Text>
                            <Text style={styles.supportSubtitle}>{strings.faqsAndGuides}</Text>
                        </View>
                        <ChevronRight size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.supportRow}>
                        <View style={[styles.supportIcon, { backgroundColor: `${COLORS.success}20` }]}>
                            <MessageCircle size={20} color={COLORS.success} />
                        </View>
                        <View style={styles.supportInfo}>
                            <Text style={styles.supportTitle}>{strings.liveChat}</Text>
                            <Text style={styles.supportSubtitle}>{strings.chatWithSupport}</Text>
                        </View>
                        <ChevronRight size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <Text style={[styles.statValue, stat.color && { color: stat.color }]}>
                                {stat.value}
                            </Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <LogOut size={20} color={COLORS.error} />
                    <Text style={styles.signOutText}>Çıxış</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </LinearGradient>
    );
};

const InfoRow: React.FC<{
    label: string;
    value: string;
    isEditing: boolean;
    onChangeText: (text: string) => void;
}> = ({ label, value, isEditing, onChangeText }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing ? (
            <TextInput
                style={styles.infoInput}
                value={value}
                onChangeText={onChangeText}
            />
        ) : (
            <Text style={styles.infoValue}>{value}</Text>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: SPACING.xxxl * 2,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.glass,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Avatar
    avatarSection: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: SPACING.md,
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: SPACING.md,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    userName: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: `${COLORS.success}20`,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
    badgeText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.success,
    },
    kycText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
    },

    // Card
    card: {
        marginHorizontal: SPACING.xl,
        padding: SPACING.xl,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        marginBottom: SPACING.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    cardTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    editButton: {
        fontSize: FONT_SIZE.md,
        color: COLORS.primary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.glassBorder,
        marginVertical: SPACING.md,
    },

    // Info Row
    infoRow: {
        gap: SPACING.sm,
    },
    infoLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },
    infoValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    infoInput: {
        backgroundColor: COLORS.glassLight,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        color: COLORS.text,
        fontSize: FONT_SIZE.md,
    },

    // Edit Buttons
    editButtons: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.xl,
    },
    cancelButton: {
        flex: 1,
        padding: SPACING.md,
        backgroundColor: COLORS.glassLight,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: COLORS.text,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        padding: SPACING.md,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    saveButtonText: {
        color: COLORS.text,
        fontWeight: '600',
    },

    // Support
    supportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    supportIcon: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    supportInfo: {
        flex: 1,
    },
    supportTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    supportSubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
    },

    // Stats
    statsContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingHorizontal: SPACING.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: SPACING.lg,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },

    // Sign Out
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        marginHorizontal: SPACING.xl,
        marginTop: SPACING.xl,
        padding: SPACING.lg,
        backgroundColor: `${COLORS.error}15`,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: `${COLORS.error}30`,
    },
    signOutText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.error,
    },
});

export default ProfileScreen;
