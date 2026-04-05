// Main App Entry Point - Enhanced with loading state
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { AppProvider, useAppContext } from './src/context/AppContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS, FONT_SIZE } from './src/constants/theme';

// Loading screen shown while AsyncStorage or Supabase loads
const LoadingScreen: React.FC = () => (
    <LinearGradient
        colors={[COLORS.background, COLORS.backgroundLight]}
        style={styles.loadingContainer}
    >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>CardAssistant</Text>
    </LinearGradient>
);

// App content with loading check
const AppContent: React.FC = () => {
    const { isLoading, setIsLoggedIn } = useAppContext();
    const { session, loading: authLoading } = useAuth();

    // Sync Supabase Auth state with AppContext
    React.useEffect(() => {
        if (!authLoading) {
            setIsLoggedIn(!!session);
        }
    }, [session, authLoading, setIsLoggedIn]);

    if (isLoading || authLoading) {
        return <LoadingScreen />;
    }

    return <AppNavigator />;
};

export default function App() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <AuthProvider>
                <AppProvider>
                    <StatusBar style="light" translucent backgroundColor="transparent" />
                    <AppContent />
                </AppProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    loadingText: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '600',
        color: COLORS.text,
    },
});
