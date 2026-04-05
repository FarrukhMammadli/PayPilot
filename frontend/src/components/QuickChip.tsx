// Quick Action Chip for chat suggestions
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants/theme';

interface QuickChipProps {
    label: string;
    onPress: () => void;
}

export const QuickChip: React.FC<QuickChipProps> = ({ label, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: `${COLORS.primary}15`,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: `${COLORS.primary}30`,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
        color: COLORS.primary,
    },
});
