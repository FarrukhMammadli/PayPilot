import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// Custom Storage Adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
    },
};
// Hardcoded credentials for reliability (process.env may not work in RN runtime)
const supabaseUrl = 'https://yogtzppngpirrsywsxne.supabase.co';
const supabaseAnonKey = 'sb_publishable_G1MJki54lDdMKDW8Tz--Rg_4ziiBb5G';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Auto-refresh tokens when app comes to foreground
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.refreshSession();
    } else if (state === 'background') {
        supabase.auth.stopAutoRefresh();
    }
});
