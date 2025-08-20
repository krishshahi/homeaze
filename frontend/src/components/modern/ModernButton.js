import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/modernTheme';
import { RippleEffect, usePressAnimation, triggerHaptic } from './MicroInteractions';

const ModernButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  style,
  textStyle,
  withRipple = false,
  withHaptic = true,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled || loading) return;
    if (withHaptic) triggerHaptic('light');
    onPress && onPress();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary[500],
          borderColor: theme.colors.primary[500],
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface.primary,
          borderColor: theme.colors.primary[500],
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.border.primary,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error[500],
          borderColor: theme.colors.error[500],
          borderWidth: 0,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success[500],
          borderColor: theme.colors.success[500],
          borderWidth: 0,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: theme.colors.primary[500],
          borderColor: theme.colors.primary[500],
          borderWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'success':
      case 'gradient':
        return theme.colors.text.inverse;
      case 'secondary':
        return theme.colors.primary[500];
      case 'outline':
      case 'ghost':
        return theme.colors.text.primary;
      default:
        return theme.colors.text.inverse;
    }
  };

  const getSizeStyles = () => {
    const sizeConfig = theme.components.button.sizes[size];
    return {
      paddingVertical: sizeConfig.paddingVertical,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      minHeight: sizeConfig.minHeight,
      fontSize: sizeConfig.fontSize,
      iconSize: sizeConfig.iconSize,
    };
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  const textColor = getTextColor();

  const buttonStyles = [
    styles.button,
    {
      ...variantStyles,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      minHeight: sizeStyles.minHeight,
      opacity: disabled ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      fontSize: sizeStyles.fontSize,
      color: textColor,
      fontWeight: theme.typography.weight.semiBold,
    },
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator 
            size="small" 
            color={textColor} 
            style={styles.loadingIndicator} 
          />
          <Text style={[textStyles, { marginLeft: theme.spacing[2] }]}>
            Loading...
          </Text>
        </View>
      );
    }

    if (children) {
      return children;
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <Ionicons
            name={icon}
            size={sizeStyles.iconSize}
            color={textColor}
            style={[styles.icon, styles.iconLeft]}
          />
        )}
        <Text style={textStyles}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Ionicons
            name={icon}
            size={sizeStyles.iconSize}
            color={textColor}
            style={[styles.icon, styles.iconRight]}
          />
        )}
      </View>
    );
  };

  const ButtonWrapper = ({ children }) => {
    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={theme.colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={buttonStyles}
        >
          {children}
        </LinearGradient>
      );
    }
    return <View style={buttonStyles}>{children}</View>;
  };

  if (withRipple) {
    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <RippleEffect
          onPress={handlePress}
          disabled={disabled || loading}
          style={styles.touchable}
          rippleColor={textColor + '30'}
          {...props}
        >
          <ButtonWrapper>
            {renderContent()}
          </ButtonWrapper>
        </RippleEffect>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={styles.touchable}
        {...props}
      >
        <ButtonWrapper>
          {renderContent()}
        </ButtonWrapper>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  button: {
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...theme.shadows.sm,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: theme.typography.fonts.primary,
    textAlign: 'center',
  },
  icon: {
    // Base icon styles
  },
  iconLeft: {
    marginRight: theme.spacing[2],
  },
  iconRight: {
    marginLeft: theme.spacing[2],
  },
  loadingIndicator: {
    // Loading indicator styles
  },
});

export default ModernButton;
