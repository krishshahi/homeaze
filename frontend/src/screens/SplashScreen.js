import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

import Text from '../components/Text';
import { COLORS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  // Animations
  const logoScale = new Animated.Value(0);
  const logoOpacity = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);

  useEffect(() => {
    // Start animation sequence
    Animated.sequence([
      // Logo animation
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Text animation
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Finish splash screen
      setTimeout(() => {
        onFinish?.();
      }, 500);
    });
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      style={styles.container}
    >
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logo}>
          <Text variant="h1" color={COLORS.white} weight="bold">
            H
          </Text>
        </View>
      </Animated.View>

      {/* App Name & Tagline */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
          },
        ]}
      >
        <Text
          variant="h1"
          color={COLORS.white}
          weight="bold"
          style={styles.appName}
        >
          HOMEAZE
        </Text>
        <Text
          variant="body1"
          color={COLORS.white}
          style={styles.tagline}
        >
          Your Ultimate Home Solution
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: FONTS.h1 * 1.2,
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    opacity: 0.9,
  },
});

export default SplashScreen;
