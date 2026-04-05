// Localization Manager for CardAssistant
// Supports EN and AZ languages - matching SwiftUI LocalizationManager

import { Language } from '../types';

type LocalizedStrings = {
    // General
    appName: string;
    cancel: string;
    save: string;
    edit: string;
    done: string;
    delete: string;
    confirm: string;
    settings: string;
    profile: string;
    logout: string;

    // Home
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    totalBalance: string;
    recentTransactions: string;
    viewAll: string;
    services: string;
    topUp: string;
    send: string;
    request: string;
    more: string;

    // Services
    cinema: string;
    parking: string;
    insurance: string;
    state: string;
    transport: string;
    qrPay: string;
    bonuses: string;
    all: string;

    // Wallet
    myWallet: string;
    cardsLinked: string;
    allCards: string;
    addNewCard: string;
    cardNumber: string;
    expiryDate: string;
    cardHolderName: string;
    scanCard: string;
    tapToAdd: string;
    addCard: string;

    // Chat
    aiAssistant: string;
    typeCommand: string;
    confirmPayment: string;
    payNow: string;
    paymentSuccess: string;

    // Insights
    insights: string;
    weeklySpending: string;
    categoryBreakdown: string;
    details: string;

    // Profile
    personalInformation: string;
    fullName: string;
    emailAddress: string;
    phoneNumber: string;
    verifiedAccount: string;
    kycPassed: string;
    support: string;
    helpCenter: string;
    faqsAndGuides: string;
    liveChat: string;
    chatWithSupport: string;
    cards: string;
    transactions: string;
    saved: string;
    saveChanges: string;

    // Settings
    managePreferences: string;
    security: string;
    faceIdTouchId: string;
    useBiometric: string;
    changePinCode: string;
    twoFactorAuth: string;
    extraSecurity: string;
    notifications: string;
    transactionAlerts: string;
    getNotifiedTransactions: string;
    billReminders: string;
    neverMissPayment: string;
    appearance: string;
    darkMode: string;
    useDarkTheme: string;
    appIcon: string;
    language: string;
    selectLanguage: string;
    version: string;

    // Auth
    welcome: string;
    welcomeBack: string;
    onePromptAllPayments: string;
    logIn: string;
    createAccount: string;
    signIn: string;
    email: string;
    password: string;
    demoAccess: string;
    demoEmail: string;
    demoPassword: string;
    verifyingIdentity: string;
    identityVerified: string;

    // Transaction Detail
    transactionSuccessful: string;
    merchant: string;
    amount: string;
    transactionId: string;
    status: string;
    completed: string;
    receipt: string;

    // Tab Navigation
    tabHome: string;
    tabWallet: string;
    tabChat: string;
    tabInsights: string;
    tabProfile: string;
};

const EN: LocalizedStrings = {
    appName: 'CardAssistant',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    done: 'Done',
    delete: 'Delete',
    confirm: 'Confirm',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Log Out',

    goodMorning: 'Good morning,',
    goodAfternoon: 'Good afternoon,',
    goodEvening: 'Good evening,',
    totalBalance: 'Total Balance',
    recentTransactions: 'Recent Transactions',
    viewAll: 'View All',
    services: 'Services',
    topUp: 'Top Up',
    send: 'Send',
    request: 'Request',
    more: 'More',

    cinema: 'Cinema',
    parking: 'Parking',
    insurance: 'Insurance',
    state: 'State',
    transport: 'Transport',
    qrPay: 'QR Pay',
    bonuses: 'Bonuses',
    all: 'All',

    myWallet: 'My Wallet',
    cardsLinked: 'cards linked',
    allCards: 'ALL CARDS',
    addNewCard: 'Add New Card',
    cardNumber: 'Card Number',
    expiryDate: 'Expiry Date',
    cardHolderName: 'Card Holder Name',
    scanCard: 'Scan Card',
    tapToAdd: 'Tap to Add',
    addCard: 'Add Card',

    aiAssistant: 'AI Assistant',
    typeCommand: 'Type a command...',
    confirmPayment: 'Confirm Payment',
    payNow: 'Pay Now',
    paymentSuccess: 'Payment Success',

    insights: 'Insights',
    weeklySpending: 'Weekly Spending',
    categoryBreakdown: 'Category Breakdown',
    details: 'Details',

    personalInformation: 'Personal Information',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    verifiedAccount: 'Verified Account',
    kycPassed: 'KYC Passed',
    support: 'Support',
    helpCenter: 'Help Center',
    faqsAndGuides: 'FAQs and guides',
    liveChat: 'Live Chat',
    chatWithSupport: 'Chat with our support team',
    cards: 'Cards',
    transactions: 'Transactions',
    saved: 'Saved',
    saveChanges: 'Save Changes',

    managePreferences: 'Manage your preferences',
    security: 'Security',
    faceIdTouchId: 'Face ID / Touch ID',
    useBiometric: 'Use biometric authentication',
    changePinCode: 'Change PIN Code',
    twoFactorAuth: 'Two-Factor Authentication',
    extraSecurity: 'Extra layer of security',
    notifications: 'Notifications',
    transactionAlerts: 'Transaction Alerts',
    getNotifiedTransactions: 'Get notified for all transactions',
    billReminders: 'Bill Reminders',
    neverMissPayment: 'Never miss a payment deadline',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    useDarkTheme: 'Use dark theme',
    appIcon: 'App Icon',
    language: 'Language',
    selectLanguage: 'Select language',
    version: 'Version',

    welcome: 'Welcome',
    welcomeBack: 'Welcome Back',
    onePromptAllPayments: 'One Prompt. All Payments.',
    logIn: 'Log In',
    createAccount: 'Create Account',
    signIn: 'Sign In',
    email: 'Email',
    password: 'Password',
    demoAccess: 'Demo Access',
    demoEmail: 'Email: demo@app.com',
    demoPassword: 'Password: Any 6+ chars',
    verifyingIdentity: 'Verifying Identity...',
    identityVerified: 'Identity Verified',

    transactionSuccessful: 'Transaction Successful',
    merchant: 'Merchant',
    amount: 'Amount',
    transactionId: 'Transaction ID',
    status: 'Status',
    completed: 'Completed',
    receipt: 'Receipt',

    // Tab Navigation
    tabHome: 'Home',
    tabWallet: 'Wallet',
    tabChat: 'Chat',
    tabInsights: 'Insights',
    tabProfile: 'Profile',
};

const AZ: LocalizedStrings = {
    appName: 'CardAssistant',
    cancel: 'Ləğv et',
    save: 'Yadda saxla',
    edit: 'Redaktə et',
    done: 'Hazır',
    delete: 'Sil',
    confirm: 'Təsdiq et',
    settings: 'Tənzimləmələr',
    profile: 'Profil',
    logout: 'Çıxış',

    goodMorning: 'Sabahınız xeyir,',
    goodAfternoon: 'Günortanız xeyir,',
    goodEvening: 'Axşamınız xeyir,',
    totalBalance: 'Ümumi balans',
    recentTransactions: 'Son əməliyyatlar',
    viewAll: 'Hamısına bax',
    services: 'Xidmətlər',
    topUp: 'Artır',
    send: 'Göndər',
    request: 'Tələb et',
    more: 'Digər',

    cinema: 'Kino',
    parking: 'Parkinq',
    insurance: 'Sığorta',
    state: 'Dövlət',
    transport: 'Nəqliyyat',
    qrPay: 'QR Ödəniş',
    bonuses: 'Bonuslar',
    all: 'Hamısı',

    myWallet: 'Cüzdanım',
    cardsLinked: 'kart əlavə edilib',
    allCards: 'BÜTÜN KARTLAR',
    addNewCard: 'Yeni kart əlavə et',
    cardNumber: 'Kart nömrəsi',
    expiryDate: 'Bitmə tarixi',
    cardHolderName: 'Kart sahibinin adı',
    scanCard: 'Kartı skan et',
    tapToAdd: 'Toxunaraq əlavə et',
    addCard: 'Kart əlavə et',

    aiAssistant: 'AI Köməkçi',
    typeCommand: 'Əmr yazın...',
    confirmPayment: 'Ödənişi təsdiq edin',
    payNow: 'İndi ödə',
    paymentSuccess: 'Ödəniş uğurlu oldu',

    insights: 'Analitika',
    weeklySpending: 'Həftəlik xərclər',
    categoryBreakdown: 'Kateqoriyalara görə',
    details: 'Ətraflı',

    personalInformation: 'Şəxsi məlumatlar',
    fullName: 'Ad və soyad',
    emailAddress: 'E-poçt ünvanı',
    phoneNumber: 'Telefon nömrəsi',
    verifiedAccount: 'Təsdiqlənmiş hesab',
    kycPassed: 'KYC keçib',
    support: 'Dəstək',
    helpCenter: 'Yardım mərkəzi',
    faqsAndGuides: 'Suallar və təlimatlar',
    liveChat: 'Canlı söhbət',
    chatWithSupport: 'Dəstək komandası ilə yazışın',
    cards: 'Kartlar',
    transactions: 'Əməliyyatlar',
    saved: 'Saxlanmış',
    saveChanges: 'Dəyişiklikləri saxla',

    managePreferences: 'Seçimlərinizi idarə edin',
    security: 'Təhlükəsizlik',
    faceIdTouchId: 'Face ID / Touch ID',
    useBiometric: 'Biometrik identifikasiya istifadə et',
    changePinCode: 'PIN kodu dəyiş',
    twoFactorAuth: 'İki faktorlu doğrulama',
    extraSecurity: 'Əlavə təhlükəsizlik səviyyəsi',
    notifications: 'Bildirişlər',
    transactionAlerts: 'Əməliyyat bildirişləri',
    getNotifiedTransactions: 'Bütün əməliyyatlar üçün bildiriş al',
    billReminders: 'Ödəniş xatırladıcıları',
    neverMissPayment: 'Heç bir ödəniş vaxtını qaçırma',
    appearance: 'Görünüş',
    darkMode: 'Qaranlıq rejim',
    useDarkTheme: 'Qaranlıq mövzu istifadə et',
    appIcon: 'Tətbiq ikonu',
    language: 'Dil',
    selectLanguage: 'Dil seçin',
    version: 'Versiya',

    welcome: 'Xoş gəlmisiniz',
    welcomeBack: 'Yenidən xoş gəlmisiniz',
    onePromptAllPayments: 'Bir söz. Bütün ödənişlər.',
    logIn: 'Daxil ol',
    createAccount: 'Hesab yarat',
    signIn: 'Giriş',
    email: 'E-poçt',
    password: 'Şifrə',
    demoAccess: 'Demo giriş',
    demoEmail: 'E-poçt: demo@app.com',
    demoPassword: 'Şifrə: 6+ simvol',
    verifyingIdentity: 'Şəxsiyyət yoxlanılır...',
    identityVerified: 'Şəxsiyyət təsdiqləndi',

    transactionSuccessful: 'Əməliyyat uğurla tamamlandı',
    merchant: 'Satıcı',
    amount: 'Məbləğ',
    transactionId: 'Əməliyyat ID',
    status: 'Status',
    completed: 'Tamamlandı',
    receipt: 'Qəbz',

    // Tab Navigation
    tabHome: 'Ana səhifə',
    tabWallet: 'Cüzdan',
    tabChat: 'Söhbət',
    tabInsights: 'Analitika',
    tabProfile: 'Profil',
};

const TRANSLATIONS: Record<Language, LocalizedStrings> = {
    en: EN,
    az: AZ,
};

export const getStrings = (lang: Language): LocalizedStrings => {
    return TRANSLATIONS[lang];
};

export const getGreeting = (lang: Language): string => {
    const hour = new Date().getHours();
    const strings = getStrings(lang);

    if (hour < 12) return strings.goodMorning;
    if (hour < 17) return strings.goodAfternoon;
    return strings.goodEvening;
};

export const formatCurrency = (amount: number): string => {
    return `₼ ${amount.toFixed(2)}`;
};

export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('az-AZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
