// App Context for global state management with AsyncStorage persistence
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
    ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, UserProfile } from '../types';

// Storage keys
const STORAGE_KEYS = {
    LANGUAGE: '@cardassistant_language',
    IS_LOGGED_IN: '@cardassistant_logged_in',
    USER_PROFILE: '@cardassistant_user_profile',
} as const;

// Default user profile
const DEFAULT_USER: UserProfile = {
    name: 'Orkhan Mammadov',
    email: 'orkhan@example.com',
    phone: '+994 50 123 45 67',
    isVerified: true,
};

interface AppContextType {
    // Language
    language: Language;
    setLanguage: (lang: Language) => void;

    // Auth
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;

    // User Profile
    userProfile: UserProfile;
    updateUserProfile: (profile: Partial<UserProfile>) => void;

    // App State
    isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [isLoggedIn, setIsLoggedInState] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
    const [isLoading, setIsLoading] = useState(true);

    // Load persisted state on mount
    useEffect(() => {
        const loadPersistedState = async () => {
            try {
                const [savedLanguage, savedLoggedIn, savedProfile] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
                    AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
                    AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
                ]);

                if (savedLanguage) {
                    setLanguageState(savedLanguage as Language);
                }
                if (savedLoggedIn) {
                    setIsLoggedInState(savedLoggedIn === 'true');
                }
                if (savedProfile) {
                    setUserProfile(JSON.parse(savedProfile));
                }
            } catch (error) {
                console.error('Error loading persisted state:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPersistedState();
    }, []);

    // Memoized setters with persistence
    const setLanguage = useCallback(async (lang: Language) => {
        setLanguageState(lang);
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
        } catch (error) {
            console.error('Error saving language:', error);
        }
    }, []);

    const setIsLoggedIn = useCallback(async (value: boolean) => {
        setIsLoggedInState(value);
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, String(value));
        } catch (error) {
            console.error('Error saving login state:', error);
        }
    }, []);

    const updateUserProfile = useCallback(async (profile: Partial<UserProfile>) => {
        const updated = { ...userProfile, ...profile };
        setUserProfile(updated);
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    }, [userProfile]);

    // Memoized context value to prevent unnecessary re-renders
    const contextValue = useMemo<AppContextType>(
        () => ({
            language,
            setLanguage,
            isLoggedIn,
            setIsLoggedIn,
            userProfile,
            updateUserProfile,
            isLoading,
        }),
        [language, setLanguage, isLoggedIn, setIsLoggedIn, userProfile, updateUserProfile, isLoading]
    );

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// Utility hook for language-specific operations
export const useLocalization = () => {
    const { language, setLanguage } = useAppContext();
    return { language, setLanguage };
};

// Utility hook for auth operations
export const useAppAuth = () => {
    const { isLoggedIn, setIsLoggedIn, userProfile, updateUserProfile } = useAppContext();
    return { isLoggedIn, setIsLoggedIn, userProfile, updateUserProfile };
};
