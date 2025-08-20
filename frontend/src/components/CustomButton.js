import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  View,
} from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT, ANIMATIONS, VARIANTS } from '../constants/theme';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left', // 'left' | 'right'
  gradient = false,
  animated = true,
  rippleEffect = true,
  hapticFeedback = true,
  ...props
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [rippleAnim] = useState(new Animated.Value(0));
  const [isPressed, setIsPressed] = useState(false);
  // Animation handlers
  const handlePressIn = () => {
    setIsPressed(true);
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        rippleEffect && Animated.timing(rippleAnim, {
          toValue: 1,
          duration: ANIMATIONS.timing.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        rippleEffect && Animated.timing(rippleAnim, {
          toValue: 0,
          duration: ANIMATIONS.timing.normal,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePress = () => {
    if (onPress && !disabled && !loading) {
      onPress();
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Variant styles
    switch (variant) {
      case VARIANTS.button.primary:
        baseStyle.push(gradient ? styles.primaryGradientButton : styles.primaryButton);
        break;
      case VARIANTS.button.secondary:
        baseStyle.push(gradient ? styles.secondaryGradientButton : styles.secondaryButton);
        break;
      case VARIANTS.button.tertiary:
        baseStyle.push(styles.tertiaryButton);
        break;
      case VARIANTS.button.outline:
        baseStyle.push(styles.outlineButton);
        break;
      case VARIANTS.button.ghost:
        baseStyle.push(styles.ghostButton);
        break;
      case VARIANTS.button.danger:
        baseStyle.push(styles.dangerButton);
        break;
      case VARIANTS.button.success:
        baseStyle.push(styles.successButton);
        break;
      default:
        baseStyle.push(styles.primaryButton);
    }
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'medium':
        baseStyle.push(styles.mediumButton);
        break;
      case 'large':
        baseStyle.push(styles.largeButton);
        break;
    }
    
    // State styles
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidthButton);
    }
    
    return baseStyle;
  };
  
  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];
    
    // Variant text styles
    switch (variant) {
      case VARIANTS.button.primary:
        baseStyle.push(styles.primaryButtonText);
        break;
      case VARIANTS.button.secondary:
        baseStyle.push(styles.secondaryButtonText);
        break;
      case VARIANTS.button.tertiary:
        baseStyle.push(styles.tertiaryButtonText);
        break;
      case VARIANTS.button.outline:
        baseStyle.push(styles.outlineButtonText);
        break;
      case VARIANTS.button.ghost:
        baseStyle.push(styles.ghostButtonText);
        break;
      case VARIANTS.button.danger:
        baseStyle.push(styles.dangerButtonText);
        break;
      case VARIANTS.button.success:
        baseStyle.push(styles.successButtonText);
        break;
    }
    
    // Size text styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButtonText);
        break;
      case 'medium':
        baseStyle.push(styles.mediumButtonText);
        break;
      case 'large':
        baseStyle.push(styles.largeButtonText);
        break;
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledButtonText);
    }
    
    return baseStyle;
  };

  const getGradientColors = () => {
    switch (variant) {
      case VARIANTS.button.primary:
        return COLORS.gradientPrimary;
      case VARIANTS.button.secondary:
        return COLORS.gradientSecondary;
      case VARIANTS.button.success:
        return COLORS.gradientSuccess;
      default:
        return COLORS.gradientPrimary;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            color={variant === 'primary' || variant === 'secondary' || variant === 'success' || variant === 'danger' ? COLORS.white : COLORS.primary} 
            size={size === 'small' ? 'small' : 'small'}
          />
          {title && (
            <Text style={[...getTextStyle(), styles.loadingText, textStyle]}>
              {title}
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <View style={[styles.iconContainer, styles.iconLeft]}>
            {icon}
          </View>
        )}
        
        {title && (
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        )}
        
        {icon && iconPosition === 'right' && (
          <View style={[styles.iconContainer, styles.iconRight]}>
            {icon}
          </View>
        )}
      </View>
    );
  };

  const buttonContent = (
    <Animated.View 
      style={[
        animated ? { transform: [{ scale: scaleAnim }] } : {},
        styles.buttonWrapper
      ]}
    >
      {gradient && !disabled ? (
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[...getButtonStyle(), { backgroundColor: 'transparent' }]}
        >
          {renderContent()}
          
          {/* Ripple effect */}
          {rippleEffect && (
            <Animated.View
              style={[
                styles.ripple,
                {
                  opacity: rippleAnim,
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
        </LinearGradient>
      ) : (
        <View style={[...getButtonStyle(), style]}>
          {renderContent()}
          
          {/* Ripple effect */}
          {rippleEffect && (
            <Animated.View
              style={[
                styles.ripple,
                {
                  opacity: rippleAnim,
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
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

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[{ overflow: 'hidden' }, !gradient && style]}
      {...props}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base button styles
  button: {
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },

  buttonWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },

  loadingText: {
    marginLeft: SPACING.sm,
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconLeft: {
    marginRight: SPACING.sm,
  },

  iconRight: {
    marginLeft: SPACING.sm,
  },

  // Ripple effect
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.ripple,
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },

  // Variant styles
  primaryButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.light,
  },

  primaryGradientButton: {
    ...SHADOWS.medium,
  },

  secondaryButton: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.light,
  },

  secondaryGradientButton: {
    ...SHADOWS.medium,
  },

  tertiaryButton: {
    backgroundColor: COLORS.backgroundSecondary,
    ...SHADOWS.subtle,
  },

  outlineButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },

  ghostButton: {
    backgroundColor: 'transparent',
    ...SHADOWS.none,
  },

  dangerButton: {
    backgroundColor: COLORS.error,
    ...SHADOWS.light,
  },

  successButton: {
    backgroundColor: COLORS.success,
    ...SHADOWS.light,
  },

  // Size styles
  smallButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: LAYOUT.buttonMinHeight - 8,
    borderRadius: BORDER_RADIUS.sm,
  },

  mediumButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: LAYOUT.buttonMinHeight,
    borderRadius: BORDER_RADIUS.md,
  },

  largeButton: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    minHeight: LAYOUT.buttonMinHeight + 12,
    borderRadius: BORDER_RADIUS.lg,
  },

  // State styles
  disabledButton: {
    opacity: 0.5,
    ...SHADOWS.none,
  },

  fullWidthButton: {
    width: '100%',
    alignSelf: 'stretch',
  },

  // Base text styles
  buttonText: {
    fontWeight: FONTS.weightSemiBold,
    textAlign: 'center',
    lineHeight: undefined, // Let the font determine line height
  },

  // Variant text styles
  primaryButtonText: {
    color: COLORS.white,
  },

  secondaryButtonText: {
    color: COLORS.white,
  },

  tertiaryButtonText: {
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },

  outlineButtonText: {
    color: COLORS.primary,
    fontWeight: FONTS.weightSemiBold,
  },

  ghostButtonText: {
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },

  dangerButtonText: {
    color: COLORS.white,
  },

  successButtonText: {
    color: COLORS.white,
  },

  // Size text styles
  smallButtonText: {
    fontSize: FONTS.sm,
  },

  mediumButtonText: {
    fontSize: FONTS.button,
  },

  largeButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
  },

  // Disabled text style
  disabledButtonText: {
    opacity: 0.8,
  },
});

export default CustomButton;
