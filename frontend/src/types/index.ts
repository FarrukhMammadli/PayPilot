// TypeScript types for CardAssistant

export interface Card {
    id: string;
    userId: string;
    bankName: 'ABB' | 'Kapital' | 'Leo';
    cardNumber: string; // last 4 digits
    balance: number;
    colorTheme?: string;
    expiryDate?: string;
    isFavorite?: boolean;
    createdAt?: string;
}

export interface Transaction {
    id: string;
    userId: string;
    cardId: string;
    amount: number;
    merchantName: string;
    category: TransactionCategory;
    status: 'Success' | 'Pending' | 'Failed';
    createdAt: string;
}

export type TransactionCategory =
    | 'Utilities'
    | 'Food'
    | 'Transport'
    | 'General'
    | 'Shopping'
    | 'Transfer';

export const CategoryIcons: Record<TransactionCategory, string> = {
    Utilities: 'lightbulb',
    Food: 'utensils',
    Transport: 'car',
    Shopping: 'shopping-bag',
    Transfer: 'arrow-left-right',
    General: 'circle-dot',
};

export const CategoryLabels: Record<TransactionCategory, string> = {
    Utilities: 'Utilities',
    Food: 'Food & Dining',
    Transport: 'Transport',
    Shopping: 'Shopping',
    Transfer: 'Transfer',
    General: 'General',
};

export type MessageType =
    | { type: 'text' }
    | { type: 'confirmation'; amount: number; merchant: string; bankName: string; cardHint?: string }
    | { type: 'receipt'; amount: number; merchant: string }
    | { type: 'audio'; duration: number; uri: string };

export interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    date: Date;
    messageType: MessageType;
}

export type Language = 'en' | 'az';

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
}

// Navigation types
export type RootStackParamList = {
    Login: undefined;
    Main: { screen?: keyof MainTabParamList; params?: any };
    Settings: undefined;
    PSP: { amount: number; merchant: string; bankName: string };
};

export type MainTabParamList = {
    Home: undefined;
    Wallet: undefined;
    Chat: undefined;
    Insights: undefined;
    Profile: undefined;
};
