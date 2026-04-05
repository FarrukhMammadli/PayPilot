// Card Carousel - Optimized with better performance
import React, { useRef, useCallback, useMemo, memo } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    ViewToken,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    withSpring,
} from 'react-native-reanimated';
import { Card } from '../types';
import { BankCard } from './BankCard';
import { SPACING, COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = SPACING.lg;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

interface CardCarouselProps {
    cards: Card[];
    onCardChange?: (index: number) => void;
}

// Memoized indicator component
const Indicator = memo<{ isActive: boolean }>(({ isActive }) => {
    const animatedStyle = useAnimatedStyle(() => ({
        width: withSpring(isActive ? 24 : 8, { damping: 15, stiffness: 150 }),
        backgroundColor: withSpring(
            isActive ? COLORS.primary : COLORS.glassBorder,
            { damping: 15, stiffness: 150 }
        ),
    }));

    return <Animated.View style={[styles.indicator, animatedStyle]} />;
});

Indicator.displayName = 'Indicator';

export const CardCarousel = memo<CardCarouselProps>(({ cards, onCardChange }) => {
    const flatListRef = useRef<FlatList<Card>>(null);
    const activeIndex = useSharedValue(0);
    const [visibleIndex, setVisibleIndex] = React.useState(0);

    // Memoized viewability config
    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 50,
    }), []);

    // Optimized viewability callback
    const onViewableItemsChanged = useCallback(({ viewableItems }: {
        viewableItems: ViewToken[];
        changed: ViewToken[];
    }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            const index = viewableItems[0].index;
            activeIndex.value = index;
            setVisibleIndex(index);
            onCardChange?.(index);
        }
    }, [onCardChange, activeIndex]);

    // Memoized scroll handler for performance
    const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / SNAP_INTERVAL);
        if (index >= 0 && index < cards.length) {
            activeIndex.value = index;
        }
    }, [cards.length, activeIndex]);

    // Memoized render item
    const renderCard = useCallback(({ item, index }: { item: Card; index: number }) => (
        <View style={styles.cardContainer}>
            <BankCard card={item} index={index} />
        </View>
    ), []);

    // Memoized key extractor
    const keyExtractor = useCallback((item: Card) => item.id, []);

    // Memoized getItemLayout for better scroll performance
    const getItemLayout = useCallback((_: any, index: number) => ({
        length: SNAP_INTERVAL,
        offset: SNAP_INTERVAL * index,
        index,
    }), []);

    // Memoized viewability config ref
    const viewabilityConfigCallbackPairs = useRef([
        { viewabilityConfig, onViewableItemsChanged },
    ]);

    if (cards.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={cards}
                renderItem={renderCard}
                keyExtractor={keyExtractor}
                horizontal
                pagingEnabled={false}
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={styles.contentContainer}
                onScroll={onScroll}
                scrollEventThrottle={16}
                getItemLayout={getItemLayout}
                viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                removeClippedSubviews
                maxToRenderPerBatch={3}
                windowSize={3}
                initialNumToRender={2}
            />

            {/* Page indicators */}
            {cards.length > 1 && (
                <View style={styles.indicators}>
                    {cards.map((_, index) => (
                        <Indicator key={index} isActive={index === visibleIndex} />
                    ))}
                </View>
            )}
        </View>
    );
});

CardCarousel.displayName = 'CardCarousel';

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.md,
    },
    contentContainer: {
        paddingHorizontal: (width - CARD_WIDTH) / 2,
    },
    cardContainer: {
        marginRight: CARD_SPACING,
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    indicator: {
        height: 8,
        borderRadius: 4,
    },
});
