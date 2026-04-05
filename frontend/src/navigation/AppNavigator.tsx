// Navigation structure for CardAssistant - Optimized with memo and loading
import React, { memo, useMemo } from 'react';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/theme';
import { RootStackParamList, MainTabParamList } from '../types';
import { useAppContext } from '../context/AppContext';
import { CustomTabBar } from '../components/CustomTabBar';
import { getStrings } from '../services/LocalizationManager';

// Lazy load screens for better performance
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import WalletScreen from '../screens/WalletScreen';
import ChatScreen from '../screens/ChatScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PSPScreen from '../screens/PSPScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Memoized dark theme
const DarkTheme: Theme = {
    dark: true,
    colors: {
        background: COLORS.background,
        card: COLORS.backgroundLight,
        text: COLORS.text,
        primary: COLORS.primary,
        border: COLORS.glassBorder,
        notification: COLORS.error,
    },
};

// Memoized Main Tabs
const MainTabs = memo(() => {
    return (
        <Tab.Navigator
            initialRouteName="Chat"
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                lazy: true,
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Wallet" component={WalletScreen} />
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Insights" component={InsightsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
});

MainTabs.displayName = 'MainTabs';

export const AppNavigator: React.FC = () => {
    const { isLoggedIn, language } = useAppContext();
    const strings = useMemo(() => getStrings(language), [language]);

    // Memoized screen options
    const screenOptions = useMemo(() => ({
        headerShown: false,
        animation: 'fade' as const,
        contentStyle: { backgroundColor: COLORS.background },
    }), []);

    const settingsOptions = useMemo(() => ({
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerTitle: strings.settings,
        animation: 'slide_from_right' as const,
        headerShadowVisible: false,
    }), [strings.settings]);

    const linking = {
        prefixes: ['cardassistant://'],
        config: {
            screens: {
                Main: {
                    screens: {
                        Chat: 'chat',
                        Home: 'home',
                        Wallet: 'wallet',
                    },
                },
            },
        },
    };

    return (
        // @ts-ignore - Linking config types are complex with nested navigators
        <NavigationContainer theme={DarkTheme} linking={linking}>
            <Stack.Navigator screenOptions={screenOptions}>
                {!isLoggedIn ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />

                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={settingsOptions}
                        />
                        <Stack.Screen
                            name="PSP"
                            component={PSPScreen}
                            options={{ headerShown: false, presentation: 'fullScreenModal' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
});
