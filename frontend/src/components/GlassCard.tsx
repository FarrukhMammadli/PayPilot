// GlassCard component - Glassmorphism card matching SwiftUI style
import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface GlassCardProps {
    children: ReactNode;
    style?: ViewStyle;
    intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    intensity = 40,
}) => {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint="dark" style={styles.blur}>
                <View style={styles.content}>{children}</View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    blur: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: SPACING.xl,
        backgroundColor: COLORS.glass,
    },
});
