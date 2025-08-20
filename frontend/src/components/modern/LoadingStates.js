import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import theme from '../../constants/modernTheme';

const { width } = Dimensions.get('window');

// Skeleton Loader Component
export const SkeletonLoader = ({ 
  width: skeletonWidth = '100%', 
  height = 16, 
  borderRadius = theme.borderRadius.sm,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [typeof skeletonWidth === 'string' ? -200 : -skeletonWidth, typeof skeletonWidth === 'string' ? 200 : skeletonWidth],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: skeletonWidth,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerTranslate }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            theme.colors.neutral[200] + '40',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
};

// Service Card Skeleton
export const ServiceCardSkeleton = () => (
  <View style={styles.serviceCardSkeleton}>
    <SkeletonLoader width="100%" height={120} borderRadius={theme.borderRadius.lg} />
    <View style={styles.serviceCardContent}>
      <SkeletonLoader width="80%" height={16} />
      <SkeletonLoader width="100%" height={12} style={{ marginTop: theme.spacing[2] }} />
      <SkeletonLoader width="60%" height={12} style={{ marginTop: theme.spacing[1] }} />
      <View style={styles.serviceCardFooter}>
        <SkeletonLoader width={60} height={12} />
        <SkeletonLoader width={40} height={16} />
      </View>
    </View>
  </View>
);

// List Item Skeleton
export const ListItemSkeleton = () => (
  <View style={styles.listItemSkeleton}>
    <SkeletonLoader width={60} height={60} borderRadius={theme.borderRadius.lg} />
    <View style={styles.listItemContent}>
      <SkeletonLoader width="70%" height={16} />
      <SkeletonLoader width="100%" height={12} style={{ marginTop: theme.spacing[2] }} />
      <SkeletonLoader width="40%" height={12} style={{ marginTop: theme.spacing[1] }} />
    </View>
  </View>
);

// Pulsing Loader
export const PulsingLoader = ({ 
  size = 40, 
  color = theme.colors.primary[500],
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.pulsingLoader,
        {
          width: size,
          height: size,
          backgroundColor: color + '20',
          transform: [{ scale: pulseAnim }],
        },
        style,
      ]}
    >
      <View
        style={[
          styles.pulsingInner,
          {
            width: size * 0.6,
            height: size * 0.6,
            backgroundColor: color,
          },
        ]}
      />
    </Animated.View>
  );
};

// Spinning Loader
export const SpinningLoader = ({ 
  size = 24, 
  color = theme.colors.primary[500],
  style,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ rotate: spin }],
        },
        style,
      ]}
    >
      <Ionicons name="sync-outline" size={size} color={color} />
    </Animated.View>
  );
};

// Loading Overlay
export const LoadingOverlay = ({ 
  visible = false, 
  message = 'Loading...', 
  transparent = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.duration.fast,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: theme.animations.duration.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.loadingOverlay,
        {
          opacity: fadeAnim,
          backgroundColor: transparent 
            ? 'transparent' 
            : theme.colors.overlay.dark,
        },
      ]}
    >
      <View style={styles.loadingContainer}>
        <PulsingLoader size={60} />
        <Text style={styles.loadingMessage}>{message}</Text>
      </View>
    </Animated.View>
  );
};

// Bounce Animation Hook
export const useBounceAnimation = (trigger = false) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trigger, bounceAnim]);

  return { transform: [{ scale: bounceAnim }] };
};

// Fade Animation Hook
export const useFadeAnimation = (visible = true, duration = 300) => {
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [visible, duration, fadeAnim]);

  return { opacity: fadeAnim };
};

// Slide Animation Hook
export const useSlideAnimation = (visible = true, direction = 'up', distance = 50) => {
  const slideAnim = useRef(new Animated.Value(visible ? 0 : distance)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : distance,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [visible, distance, slideAnim]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return { transform: [{ translateY: slideAnim }] };
      case 'down':
        return { transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }] };
      case 'left':
        return { transform: [{ translateX: slideAnim }] };
      case 'right':
        return { transform: [{ translateX: slideAnim.interpolate({
          inputRange: [0, distance],
          outputRange: [0, -distance],
        }) }] };
      default:
        return { transform: [{ translateY: slideAnim }] };
    }
  };

  return getTransform();
};

// Scale Animation Hook
export const useScaleAnimation = (visible = true, scale = 1) => {
  const scaleAnim = useRef(new Animated.Value(visible ? scale : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: visible ? scale : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [visible, scale, scaleAnim]);

  return { transform: [{ scale: scaleAnim }] };
};

// Success Animation Component
export const SuccessAnimation = ({ visible = false, message = 'Success!' }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.animations.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: theme.animations.duration.fast,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: theme.animations.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.successOverlay,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={32} color={theme.colors.text.inverse} />
        </View>
        <Text style={styles.successMessage}>{message}</Text>
      </View>
    </Animated.View>
  );
};

// Error Animation Component
export const ErrorAnimation = ({ visible = false, message = 'Something went wrong!' }) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.animations.duration.fast,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: theme.animations.duration.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, shakeAnim, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.errorContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      <View style={styles.errorIcon}>
        <Ionicons name="alert-circle" size={24} color={theme.colors.error[500]} />
      </View>
      <Text style={styles.errorMessage}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Skeleton Styles
  skeleton: {
    backgroundColor: theme.colors.neutral[200],
    overflow: 'hidden',
  },
  
  shimmer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  
  shimmerGradient: {
    flex: 1,
  },

  // Service Card Skeleton
  serviceCardSkeleton: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
    ...theme.shadows.sm,
  },

  serviceCardContent: {
    marginTop: theme.spacing[3],
  },

  serviceCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing[4],
  },

  // List Item Skeleton
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    ...theme.shadows.sm,
  },

  listItemContent: {
    flex: 1,
    marginLeft: theme.spacing[4],
  },

  // Pulsing Loader
  pulsingLoader: {
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pulsingInner: {
    borderRadius: theme.borderRadius.full,
  },

  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  loadingContainer: {
    alignItems: 'center',
    padding: theme.spacing[8],
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.xl,
  },

  loadingMessage: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[4],
    textAlign: 'center',
  },

  // Success Animation
  successOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -75 }],
    zIndex: 9999,
  },

  successContainer: {
    width: 150,
    height: 150,
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.xl,
  },

  successIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },

  successMessage: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semiBold,
    textAlign: 'center',
  },

  // Error Animation
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error[50],
    borderColor: theme.colors.error[200],
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    margin: theme.spacing[4],
  },

  errorIcon: {
    marginRight: theme.spacing[3],
  },

  errorMessage: {
    ...theme.typography.styles.body2,
    color: theme.colors.error[700],
    flex: 1,
  },
});

export default {
  SkeletonLoader,
  ServiceCardSkeleton,
  ListItemSkeleton,
  PulsingLoader,
  SpinningLoader,
  LoadingOverlay,
  SuccessAnimation,
  ErrorAnimation,
  useBounceAnimation,
  useFadeAnimation,
  useSlideAnimation,
  useScaleAnimation,
};
