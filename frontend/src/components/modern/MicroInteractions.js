import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Vibration,
  Platform,
} from 'react-native';
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import theme from '../../constants/modernTheme';

// Haptic Feedback Helper
const triggerHaptic = (type = 'light') => {
  if (Platform.OS === 'ios') {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        Haptics.selectionAsync();
    }
  } else {
    // Android fallback
    Vibration.vibrate(50);
  }
};

// Press Animation Hook
export const usePressAnimation = (
  scaleValue = 0.95,
  duration = 100,
  withHaptic = true
) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    if (withHaptic) triggerHaptic('light');
    
    Animated.timing(scaleAnim, {
      toValue: scaleValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return {
    animatedStyle: {
      transform: [{ scale: scaleAnim }],
    },
    handlers: {
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
    },
    isPressed,
  };
};

// Ripple Effect Component
export const RippleEffect = ({ 
  children, 
  onPress, 
  style, 
  rippleColor = theme.colors.primary[500] + '30',
  rippleSize = 200,
  disabled = false,
}) => {
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });

  const startRipple = (event) => {
    if (disabled) return;

    const { locationX, locationY } = event.nativeEvent;
    setRipplePosition({ x: locationX, y: locationY });

    rippleAnim.setValue(0);
    rippleOpacity.setValue(0.5);

    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    triggerHaptic('light');
    onPress && onPress();
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, rippleSize],
  });

  return (
    <TouchableWithoutFeedback onPress={startRipple} disabled={disabled}>
      <View style={[styles.rippleContainer, style]}>
        {children}
        <Animated.View
          style={[
            styles.ripple,
            {
              backgroundColor: rippleColor,
              left: ripplePosition.x - rippleSize / 2,
              top: ripplePosition.y - rippleSize / 2,
              width: rippleSize,
              height: rippleSize,
              borderRadius: rippleSize / 2,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
            },
          ]}
          pointerEvents="none"
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

// Floating Action Button with Micro-interactions
export const FloatingActionButton = ({
  onPress,
  icon = 'add',
  size = 56,
  backgroundColor = theme.colors.primary[500],
  iconColor = theme.colors.text.inverse,
  style,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();

    triggerHaptic('medium');
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const shadowElevation = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 16],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={style}
    >
      <Animated.View
        style={[
          styles.fab,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: disabled ? theme.colors.neutral[300] : backgroundColor,
            transform: [{ scale: scaleAnim }],
            elevation: shadowElevation,
            shadowOpacity: shadowAnim,
          },
        ]}
      >
        <Ionicons 
          name={icon} 
          size={size * 0.4} 
          color={disabled ? theme.colors.neutral[500] : iconColor} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Swipe to Action Component
export const SwipeToAction = ({
  children,
  rightActions = [],
  leftActions = [],
  actionThreshold = 80,
  onSwipeStart,
  onSwipeEnd,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isActionTriggered, setIsActionTriggered] = useState(false);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const handleStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      
      if (Math.abs(translationX) > actionThreshold && !isActionTriggered) {
        setIsActionTriggered(true);
        triggerHaptic('success');
        
        // Trigger appropriate action
        if (translationX > 0 && leftActions.length > 0) {
          leftActions[0].onPress();
        } else if (translationX < 0 && rightActions.length > 0) {
          rightActions[0].onPress();
        }
      }

      // Animate back to center
      Animated.spring(translateX, {
        toValue: 0,
        tension: 300,
        friction: 30,
        useNativeDriver: false,
      }).start(() => {
        setIsActionTriggered(false);
      });

      onSwipeEnd && onSwipeEnd();
    }
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <View style={[styles.actionContainer, styles.leftActions]}>
          {leftActions.map((action, index) => (
            <View key={index} style={[styles.action, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={24} color={theme.colors.text.inverse} />
            </View>
          ))}
        </View>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <View style={[styles.actionContainer, styles.rightActions]}>
          {rightActions.map((action, index) => (
            <View key={index} style={[styles.action, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={24} color={theme.colors.text.inverse} />
            </View>
          ))}
        </View>
      )}

      {/* Main Content */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.swipeContent,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// Pull to Refresh Component
export const PullToRefresh = ({
  children,
  onRefresh,
  refreshing = false,
  refreshThreshold = 80,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const refreshProgress = useRef(new Animated.Value(0)).current;
  const [isPulling, setIsPulling] = useState(false);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: false }
  );

  const handleStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY: translation } = event.nativeEvent;
      
      if (translation > refreshThreshold && !refreshing) {
        triggerHaptic('success');
        onRefresh && onRefresh();
      }

      Animated.spring(translateY, {
        toValue: 0,
        tension: 300,
        friction: 30,
        useNativeDriver: false,
      }).start();

      setIsPulling(false);
    } else if (event.nativeEvent.state === State.ACTIVE) {
      setIsPulling(true);
    }
  };

  useEffect(() => {
    if (refreshing) {
      Animated.timing(refreshProgress, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(refreshProgress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [refreshing]);

  const pullIndicatorOpacity = translateY.interpolate({
    inputRange: [0, refreshThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const pullIndicatorRotation = translateY.interpolate({
    inputRange: [0, refreshThreshold],
    outputRange: ['0deg', '180deg'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.pullToRefreshContainer}>
      <Animated.View
        style={[
          styles.pullIndicator,
          {
            opacity: pullIndicatorOpacity,
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ rotate: pullIndicatorRotation }],
          }}
        >
          <Ionicons 
            name="chevron-down" 
            size={24} 
            color={theme.colors.primary[500]} 
          />
        </Animated.View>
      </Animated.View>

      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetY={[10, 10]}
      >
        <Animated.View
          style={[
            styles.pullContent,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// Interactive Rating Component
export const InteractiveRating = ({
  rating = 0,
  maxRating = 5,
  onRatingChange,
  size = 24,
  activeColor = theme.colors.warning[500],
  inactiveColor = theme.colors.neutral[300],
  allowHalfRating = true,
  disabled = false,
}) => {
  const [currentRating, setCurrentRating] = useState(rating);
  const scaleAnimations = useRef(
    Array.from({ length: maxRating }, () => new Animated.Value(1))
  ).current;

  const animateStar = (index) => {
    Animated.sequence([
      Animated.timing(scaleAnimations[index], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (index) => {
    if (disabled) return;

    const newRating = index + 1;
    setCurrentRating(newRating);
    animateStar(index);
    triggerHaptic('light');
    onRatingChange && onRatingChange(newRating);
  };

  const renderStar = (index) => {
    const isFilled = index < currentRating;
    const isHalfFilled = allowHalfRating && index === Math.floor(currentRating) && currentRating % 1 !== 0;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handlePress(index)}
        disabled={disabled}
        style={styles.starContainer}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnimations[index] }],
          }}
        >
          <Ionicons
            name={isFilled || isHalfFilled ? 'star' : 'star-outline'}
            size={size}
            color={isFilled || isHalfFilled ? activeColor : inactiveColor}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.ratingContainer}>
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
    </View>
  );
};

// Long Press Menu Component
export const LongPressMenu = ({
  children,
  menuItems = [],
  onMenuItemPress,
  hapticFeedback = true,
}) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;

  const handleLongPress = () => {
    if (hapticFeedback) triggerHaptic('medium');
    
    setIsMenuVisible(true);
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(menuOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideMenu = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(menuOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuVisible(false);
    });
  };

  const handleMenuItemPress = (item, index) => {
    hideMenu();
    onMenuItemPress && onMenuItemPress(item, index);
  };

  return (
    <View style={styles.longPressContainer}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          {children}
        </Animated.View>
      </TouchableOpacity>

      {isMenuVisible && (
        <>
          <TouchableWithoutFeedback onPress={hideMenu}>
            <View style={styles.menuOverlay} />
          </TouchableWithoutFeedback>
          
          <Animated.View
            style={[
              styles.menu,
              {
                opacity: menuOpacity,
              },
            ]}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleMenuItemPress(item, index)}
                style={styles.menuItem}
              >
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={item.color || theme.colors.text.primary} 
                />
                <Text style={[styles.menuItemText, { color: item.color || theme.colors.text.primary }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Ripple Effect
  rippleContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  
  ripple: {
    position: 'absolute',
    backgroundColor: theme.colors.primary[500] + '30',
  },

  // Floating Action Button
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // Swipe to Action
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
  },

  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  leftActions: {
    left: 0,
  },

  rightActions: {
    right: 0,
  },

  action: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  swipeContent: {
    backgroundColor: theme.colors.surface.primary,
    zIndex: 1,
  },

  // Pull to Refresh
  pullToRefreshContainer: {
    flex: 1,
    position: 'relative',
  },

  pullIndicator: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  pullContent: {
    flex: 1,
  },

  // Interactive Rating
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  starContainer: {
    padding: theme.spacing[1],
  },

  // Long Press Menu
  longPressContainer: {
    position: 'relative',
  },

  menuOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 998,
  },

  menu: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[2],
    ...theme.shadows.lg,
    zIndex: 999,
    minWidth: 150,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
  },

  menuItemText: {
    ...theme.typography.styles.body2,
    marginLeft: theme.spacing[3],
  },
});

export { triggerHaptic };

export default {
  RippleEffect,
  FloatingActionButton,
  SwipeToAction,
  PullToRefresh,
  InteractiveRating,
  LongPressMenu,
  usePressAnimation,
  triggerHaptic,
};
