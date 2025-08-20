import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../constants/modernTheme';

const ModernCard = ({
  children,
  onPress,
  variant = 'elevated',
  padding = 'md',
  margin,
  gradient,
  borderRadius = 'lg',
  shadow = 'base',
  pressable = false,
  disabled = false,
  style,
  contentStyle,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!pressable && !onPress) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0.8,
        duration: theme.animations.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!pressable && !onPress) return;
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: theme.animations.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: theme.colors.surface.primary,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.surface.secondary,
          borderWidth: 0,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: theme.colors.surface.primary,
          borderWidth: 0,
        };
    }
  };

  const getPaddingStyles = () => {
    if (typeof padding === 'number') {
      return { padding };
    }
    
    const paddingMap = {
      none: 0,
      sm: theme.spacing[3],
      md: theme.spacing[4],
      lg: theme.spacing[6],
      xl: theme.spacing[8],
    };
    
    return { padding: paddingMap[padding] || paddingMap.md };
  };

  const getBorderRadius = () => {
    if (typeof borderRadius === 'number') {
      return borderRadius;
    }
    
    return theme.borderRadius[borderRadius] || theme.borderRadius.lg;
  };

  const getShadowStyles = () => {
    if (variant === 'outlined' || variant === 'filled') {
      return {};
    }
    
    const shadowStyle = theme.shadows[shadow] || theme.shadows.base;
    
    // Animate shadow for press effect
    const animatedShadowOpacity = shadowAnim.interpolate({
      inputRange: [0.8, 1],
      outputRange: [shadowStyle.shadowOpacity * 0.5, shadowStyle.shadowOpacity],
      extrapolate: 'clamp',
    });

    return {
      ...shadowStyle,
      shadowOpacity: animatedShadowOpacity,
    };
  };

  const getMarginStyles = () => {
    if (!margin) return {};
    
    if (typeof margin === 'number') {
      return { margin };
    }
    
    if (typeof margin === 'object') {
      return margin;
    }
    
    const marginMap = {
      xs: theme.spacing[1],
      sm: theme.spacing[2],
      md: theme.spacing[4],
      lg: theme.spacing[6],
      xl: theme.spacing[8],
    };
    
    return { margin: marginMap[margin] || marginMap.md };
  };

  const variantStyles = getVariantStyles();
  const paddingStyles = getPaddingStyles();
  const radiusValue = getBorderRadius();
  const shadowStyles = getShadowStyles();
  const marginStyles = getMarginStyles();

  const cardStyles = [
    styles.card,
    variantStyles,
    paddingStyles,
    marginStyles,
    {
      borderRadius: radiusValue,
      opacity: disabled ? 0.6 : 1,
    },
    shadowStyles,
    style,
  ];

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  const CardContent = ({ children }) => {
    if (gradient) {
      return (
        <LinearGradient
          colors={
            Array.isArray(gradient)
              ? gradient
              : theme.colors.gradients[gradient] || theme.colors.gradients.primary
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            cardStyles,
            contentStyle,
          ]}
        >
          {children}
        </LinearGradient>
      );
    }

    return (
      <Animated.View style={[cardStyles, contentStyle]}>
        {children}
      </Animated.View>
    );
  };

  if (pressable || onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.95}
          style={{ borderRadius: radiusValue }}
          {...props}
        >
          <CardContent>
            {children}
          </CardContent>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <CardContent>
        {children}
      </CardContent>
    </Animated.View>
  );
};

// Additional Card Components
export const CardHeader = ({ children, style, ...props }) => (
  <View style={[styles.cardHeader, style]} {...props}>
    {children}
  </View>
);

export const CardBody = ({ children, style, ...props }) => (
  <View style={[styles.cardBody, style]} {...props}>
    {children}
  </View>
);

export const CardFooter = ({ children, style, ...props }) => (
  <View style={[styles.cardFooter, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  cardHeader: {
    marginBottom: theme.spacing[3],
  },
  cardBody: {
    flex: 1,
  },
  cardFooter: {
    marginTop: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export default ModernCard;
