// SettingsScreen - matching SwiftUI SettingsView
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Shield,
    Scan,
    Lock,
    Smartphone,
    Bell,
    BellRing,
    Calendar,
    Moon,
    Palette,
    Globe,
    ChevronRight,
    LogOut,
    Check,
} from 'lucide-react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getStrings } from '../services/LocalizationManager';
import { Language } from '../types';

const SettingsScreen: React.FC = () => {
    const { language, setLanguage, setIsLoggedIn } = useAppContext();
    const strings = getStrings(language);

    const [faceIdEnabled, setFaceIdEnabled] = useState(true);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
    const [transactionAlerts, setTransactionAlerts] = useState(true);
    const [billReminders, setBillReminders] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [showLanguagePicker, setShowLanguagePicker] = useState(false);

    const languages: { code: Language; name: string; flag: string }[] = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'az', name: 'Azərbaycanca', flag: '🇦🇿' },
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
                    <Text style={styles.title}>{strings.settings}</Text>
                    <Text style={styles.subtitle}>{strings.managePreferences}</Text>
                </View>

                {/* Security */}
                <SettingsSection title={strings.security} icon={Shield}>
                    <ToggleRow
                        icon={Scan}
                        label={strings.faceIdTouchId}
                        description={strings.useBiometric}
                        value={faceIdEnabled}
                        onValueChange={setFaceIdEnabled}
                    />
                    <Divider />
                    <NavigationRow icon={Lock} label={strings.changePinCode} />
                    <Divider />
                    <ToggleRow
                        icon={Smartphone}
                        label={strings.twoFactorAuth}
                        description={strings.extraSecurity}
                        value={twoFactorEnabled}
                        onValueChange={setTwoFactorEnabled}
                    />
                </SettingsSection>

                {/* Notifications */}
                <SettingsSection title={strings.notifications} icon={Bell}>
                    <ToggleRow
                        icon={BellRing}
                        label={strings.transactionAlerts}
                        description={strings.getNotifiedTransactions}
                        value={transactionAlerts}
                        onValueChange={setTransactionAlerts}
                    />
                    <Divider />
                    <ToggleRow
                        icon={Calendar}
                        label={strings.billReminders}
                        description={strings.neverMissPayment}
                        value={billReminders}
                        onValueChange={setBillReminders}
                    />
                </SettingsSection>

                {/* Appearance */}
                <SettingsSection title={strings.appearance} icon={Palette}>
                    <ToggleRow
                        icon={Moon}
                        label={strings.darkMode}
                        description={strings.useDarkTheme}
                        value={darkMode}
                        onValueChange={setDarkMode}
                    />
                    <Divider />
                    <NavigationRow icon={Palette} label={strings.appIcon} />
                </SettingsSection>

                {/* Language */}
                <SettingsSection title={strings.language} icon={Globe}>
                    <TouchableOpacity
                        style={styles.languageRow}
                        onPress={() => setShowLanguagePicker(true)}
                    >
                        <View style={styles.rowIcon}>
                            <Globe size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.rowLabel}>{strings.selectLanguage}</Text>
                            <Text style={styles.rowDescription}>
                                {languages.find(l => l.code === language)?.flag}{' '}
                                {languages.find(l => l.code === language)?.name}
                            </Text>
                        </View>
                        <ChevronRight size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </SettingsSection>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appName}>CardAssistant</Text>
                    <Text style={styles.version}>{strings.version} 1.0.0</Text>
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => setIsLoggedIn(false)}
                >
                    <LogOut size={20} color={COLORS.error} />
                    <Text style={styles.logoutText}>{strings.logout}</Text>
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>

            {/* Language Picker Modal */}
            <Modal visible={showLanguagePicker} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={[COLORS.background, COLORS.backgroundLight]}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{strings.selectLanguage}</Text>
                            <TouchableOpacity onPress={() => setShowLanguagePicker(false)}>
                                <Text style={styles.doneButton}>{strings.done}</Text>
                            </TouchableOpacity>
                        </View>

                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageOption,
                                    language === lang.code && styles.languageOptionActive,
                                ]}
                                onPress={() => {
                                    setLanguage(lang.code);
                                    setShowLanguagePicker(false);
                                }}
                            >
                                <Text style={styles.languageFlag}>{lang.flag}</Text>
                                <Text style={styles.languageName}>{lang.name}</Text>
                                {language === lang.code && (
                                    <Check size={24} color={COLORS.success} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </LinearGradient>
                </View>
            </Modal>
        </LinearGradient>
    );
};

// Components
const SettingsSection: React.FC<{
    title: string;
    icon: any;
    children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Icon size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>{children}</View>
    </View>
);

const ToggleRow: React.FC<{
    icon: any;
    label: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}> = ({ icon: Icon, label, description, value, onValueChange }) => (
    <View style={styles.row}>
        <View style={styles.rowIcon}>
            <Icon size={20} color={COLORS.primary} />
        </View>
        <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowDescription}>{description}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: COLORS.textMuted, true: COLORS.success }}
            thumbColor={COLORS.text}
        />
    </View>
);

const NavigationRow: React.FC<{ icon: any; label: string }> = ({
    icon: Icon,
    label,
}) => (
    <TouchableOpacity style={styles.row}>
        <View style={styles.rowIcon}>
            <Icon size={20} color={COLORS.primary} />
        </View>
        <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <ChevronRight size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
);

const Divider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.xl,
    },

    // Header
    header: {
        marginBottom: SPACING.xxl,
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

    // Section
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    sectionContent: {
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        padding: SPACING.lg,
    },

    // Row
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    rowIcon: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: `${COLORS.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    rowContent: {
        flex: 1,
    },
    rowLabel: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    rowDescription: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.glassBorder,
        marginVertical: SPACING.sm,
    },

    // App Info
    appInfo: {
        alignItems: 'center',
        marginVertical: SPACING.xxl,
    },
    appName: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
    },
    version: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
    },

    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        padding: SPACING.lg,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: `${COLORS.error}30`,
    },
    logoutText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.error,
    },

    // Modal
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
        padding: SPACING.xl,
        paddingBottom: SPACING.xxxl * 2,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    doneButton: {
        fontSize: FONT_SIZE.md,
        color: COLORS.primary,
        fontWeight: '600',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: COLORS.glass,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
    },
    languageOptionActive: {
        borderWidth: 2,
        borderColor: `${COLORS.success}50`,
        backgroundColor: `${COLORS.success}10`,
    },
    languageFlag: {
        fontSize: 32,
        marginRight: SPACING.md,
    },
    languageName: {
        flex: 1,
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
});

export default SettingsScreen;
