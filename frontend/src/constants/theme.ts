// Theme constants for CardAssistant React Native App
// Matching the SwiftUI "Midnight Glass" design

export const COLORS = {
    // Base colors
    background: '#0B0F19',
    backgroundLight: '#161B29',

    // Primary palette
    primary: '#0057FF',
    primaryDark: '#004E92',
    primaryLight: '#3D7BFF',

    // Status colors
    success: '#00E676',
    error: '#FF5252',
    warning: '#FFB800',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',

    // Glass effect colors
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassLight: 'rgba(255, 255, 255, 0.08)',

    // Card gradients
    cardABB: ['#004E92', '#000428'],
    cardKapital: ['#C0392B', '#8E44AD'],
    cardLeo: ['#2C3E50', '#4CA1AF'],

    // Other
    tabBarBg: 'rgba(11, 15, 25, 0.9)',
} as const;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
} as const;

export const FONT_SIZE = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    display: 36,
    hero: 42,
} as const;

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
} as const;

export const SHADOWS = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    button: {
        shadowColor: '#0057FF',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
} as const;
