import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

import { COLORS, FONTS } from '../constants/theme';

const LoadingSpinner = ({ 
  size = 'large', 
  color = COLORS.primary,
  message = '',
  overlay = true,
  transparent = false 
}) => {
  const containerStyle = [
    overlay ? styles.overlay : styles.inline,
    transparent && styles.transparent
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.spinnerContainer}>
        <ActivityIndicator 
          size={size} 
          color={color}
          style={styles.spinner}
        />
        {message ? (
          <Text style={[styles.message, { color }]}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  transparent: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  spinner: {
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LoadingSpinner;
