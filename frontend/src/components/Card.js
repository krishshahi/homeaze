import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';

import { COLORS, BORDER_RADIUS, SHADOWS, SPACING, VARIANTS } from '../constants/theme';

const Card = ({
  children,
  variant = 'default',
  onPress,
  style,
  gradient = false,
  gradientColors,
  elevated = true,
  outlined = false,
  filled = false,
  disabled = false,
  ripple = true,
  contentStyle,
  ...props
}) => {
  const [scaleAnim] = React.useState(new Animated.Value(1));
  const [rippleAnim] = React.useState(new Animated.Value(0));

  const handlePressIn = () => {
    if (onPress) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        ripple && Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        ripple && Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const getCardStyle = () => {
    const baseStyle = [styles.card];

    switch (variant) {
      case VARIANTS.card.elevated:
        baseStyle.push(styles.elevatedCard);
        break;
      case VARIANTS.card.outlined:
        baseStyle.push(styles.outlinedCard);
        break;
      case VARIANTS.card.filled:
        baseStyle.push(styles.filledCard);
        break;
      case VARIANTS.card.gradient:
        baseStyle.push(styles.gradientCard);
        break;
      default:
        baseStyle.push(styles.defaultCard);
    }

    if (elevated && variant !== 'outlined') {
      baseStyle.push(styles.elevatedCard);
    }

    if (outlined) {
      baseStyle.push(styles.outlinedCard);
    }

    if (filled) {
      baseStyle.push(styles.filledCard);
    }

    if (disabled) {
      baseStyle.push(styles.disabledCard);
    }

    return baseStyle;
  };

  const cardContent = (
    <Animated.View
      style={[
        onPress && { transform: [{ scale: scaleAnim }] },
        ...getCardStyle(),
        style,
      ]}
    >
      {gradient ? (
        <LinearGradient
          colors={gradientColors || [COLORS.gradientPrimary[0], COLORS.gradientPrimary[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientBackground, contentStyle]}
        >
          {children}
          {ripple && onPress && (
            <Animated.View
              style={[
                styles.ripple,
                {
                  opacity: rippleAnim,
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
        </LinearGradient>
      ) : (
        <View style={[styles.content, contentStyle]}>
          {children}
          {ripple && onPress && (
            <Animated.View
              style={[
                styles.ripple,
                {
                  opacity: rippleAnim,
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
        </View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        {...props}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.card,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  defaultCard: {
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  elevatedCard: {
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  outlinedCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.none,
  },
  filledCard: {
    backgroundColor: COLORS.backgroundSecondary,
    ...SHADOWS.subtle,
  },
  gradientCard: {
    ...SHADOWS.medium,
  },
  disabledCard: {
    opacity: 0.6,
    ...SHADOWS.none,
  },
  content: {
    padding: SPACING.md,
  },
  gradientBackground: {
    padding: SPACING.md,
  },
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.ripple,
    transform: [{ translateX: -100 }, { translateY: -100 }],
  },
});

export default Card;
