// Custom Glassmorphism Bottom Tab Bar - Optimized
import React, { memo, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Wallet, MessageSquare, PieChart, User } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    interpolateColor,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getStrings } from '../services/LocalizationManager';

const { width } = Dimensions.get('window');

// Icon mapping - use typeof for proper typing
const ICONS: Record<string, typeof Home> = {
    Home,
    Wallet,
    Chat: MessageSquare,
    Insights: PieChart,
    Profile: User,
};

// Tab label keys for localization
const TAB_LABEL_KEYS: Record<string, 'tabHome' | 'tabWallet' | 'tabChat' | 'tabInsights' | 'tabProfile'> = {
    Home: 'tabHome',
    Wallet: 'tabWallet',
    Chat: 'tabChat',
    Insights: 'tabInsights',
    Profile: 'tabProfile',
};

// Memoized Tab Button component
interface TabButtonProps {
    routeName: string;
    routeKey: string;
    label: string;
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
}

const TabButton = memo<TabButtonProps>(({
    routeName,
    routeKey,
    label,
    isFocused,
    onPress,
    onLongPress,
}) => {
    const IconComponent = ICONS[routeName];

    // Animated styles for smooth transitions
    const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: withSpring(
                isFocused ? `${COLORS.primary}20` : 'transparent',
                { damping: 15, stiffness: 150 }
            ),
            transform: [
                {
                    scale: withSpring(isFocused ? 1.05 : 1, { damping: 15, stiffness: 200 }),
                },
            ],
        };
    }, [isFocused]);

    if (!IconComponent) return null;

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={`${label} tab`}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
            activeOpacity={0.7}
        >
            <Animated.View style={[styles.iconContainer, animatedStyle]}>
                <IconComponent
                    size={22}
                    color={isFocused ? COLORS.primary : COLORS.textSecondary}
                    strokeWidth={isFocused ? 2.5 : 1.5}
                />
            </Animated.View>
            <Text style={[
                styles.tabLabel,
                { color: isFocused ? COLORS.primary : COLORS.textSecondary }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
});

TabButton.displayName = 'TabButton';

// Main TabBar component
export const CustomTabBar: React.FC<BottomTabBarProps> = memo(({
    state,
    descriptors,
    navigation,
}) => {
    const { language } = useAppContext();
    const strings = useMemo(() => getStrings(language), [language]);

    // Memoized handlers
    const createPressHandler = useCallback((route: typeof state.routes[0], index: number) => {
        return () => {
            const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
            });

            if (state.index !== index && !event.defaultPrevented) {
                navigation.navigate(route.name);
            }
        };
    }, [navigation, state.index]);

    const createLongPressHandler = useCallback((route: typeof state.routes[0]) => {
        return () => {
            navigation.emit({
                type: 'tabLongPress',
                target: route.key,
            });
        };
    }, [navigation]);

    // Memoized tab items
    const tabItems = useMemo(() => {
        return state.routes.map((route, index) => ({
            route,
            index,
            isFocused: state.index === index,
        }));
    }, [state.routes, state.index]);

    return (
        <View style={styles.container}>
            <BlurView
                intensity={Platform.OS === 'ios' ? 80 : 100}
                tint="dark"
                style={styles.blurContainer}
            >
                <View style={styles.tabContainer}>
                    {tabItems.map(({ route, index, isFocused }) => {
                        const labelKey = TAB_LABEL_KEYS[route.name];
                        const label = labelKey ? strings[labelKey] : route.name;
                        return (
                            <TabButton
                                key={route.key}
                                routeName={route.name}
                                routeKey={route.key}
                                label={label}
                                isFocused={isFocused}
                                onPress={createPressHandler(route, index)}
                                onLongPress={createLongPressHandler(route)}
                            />
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
});

CustomTabBar.displayName = 'CustomTabBar';

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 20,
        left: SPACING.xl,
        right: SPACING.xl,
        height: 70,
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    blurContainer: {
        flex: 1,
        borderRadius: BORDER_RADIUS.xxl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    tabContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.glass,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: FONT_SIZE.xs,
        marginTop: 2,
    },
});
