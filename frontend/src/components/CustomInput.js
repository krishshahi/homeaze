import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT, ANIMATIONS } from '../constants/theme';

const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  error,
  helperText,
  success,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  required = false,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  showClearButton = true,
  variant = 'outlined', // 'outlined', 'filled', 'underlined'
  size = 'medium', // 'small', 'medium', 'large'
  animated = true,
  gradient = false,
  maxLength,
  characterCount = false,
  style,
  inputStyle,
  labelStyle,
  containerStyle,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Animation refs
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);

  // Animation effects
  useEffect(() => {
    if (animated) {
      Animated.timing(labelAnim, {
        toValue: isFocused || value ? 1 : 0,
        duration: ANIMATIONS.timing.fast,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, value, animated]);

  useEffect(() => {
    if (animated) {
      Animated.timing(borderAnim, {
        toValue: isFocused ? 1 : 0,
        duration: ANIMATIONS.timing.fast,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, animated]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (animated) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
    onBlur && onBlur(e);
  };

  const handleClear = () => {
    onChangeText && onChangeText('');
    inputRef.current?.focus();
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    switch (variant) {
      case 'filled':
        baseStyle.push(styles.filledContainer);
        break;
      case 'underlined':
        baseStyle.push(styles.underlinedContainer);
        break;
      default:
        baseStyle.push(styles.outlinedContainer);
    }
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallContainer);
        break;
      case 'large':
        baseStyle.push(styles.largeContainer);
        break;
      default:
        baseStyle.push(styles.mediumContainer);
    }
    
    if (isFocused) {
      baseStyle.push(styles.focusedContainer);
    }
    
    if (error) {
      baseStyle.push(styles.errorContainer);
    }
    
    if (success) {
      baseStyle.push(styles.successContainer);
    }
    
    if (!editable) {
      baseStyle.push(styles.disabledContainer);
    }
    
    return baseStyle;
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallInput);
        break;
      case 'large':
        baseStyle.push(styles.largeInput);
        break;
      default:
        baseStyle.push(styles.mediumInput);
    }
    
    if (leftIcon) {
      baseStyle.push(styles.inputWithLeftIcon);
    }
    
    if (rightIcon || showPasswordToggle || (showClearButton && value)) {
      baseStyle.push(styles.inputWithRightIcon);
    }
    
    if (multiline) {
      baseStyle.push(styles.multilineInput);
    }
    
    return baseStyle;
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary],
  });

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [variant === 'filled' ? 24 : 16, variant === 'filled' ? 8 : -8],
  });

  const labelScale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  const inputContent = (
    <Animated.View 
      style={[
        containerStyle,
        animated && { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[getContainerStyle(), style]}>
        {gradient && !error && !success ? (
          <LinearGradient
            colors={[COLORS.primaryUltraLight, COLORS.white]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          />
        ) : null}

        {/* Animated border for outlined variant */}
        {variant === 'outlined' && animated && (
          <Animated.View
            style={[
              styles.animatedBorder,
              {
                borderColor: error ? COLORS.error : success ? COLORS.success : borderColor,
              },
            ]}
          />
        )}

        {/* Floating Label */}
        {label && (
          <Animated.Text
            style={[
              styles.label,
              labelStyle,
              {
                top: animated ? labelTop : (isFocused || value ? (variant === 'filled' ? 8 : -8) : (variant === 'filled' ? 24 : 16)),
                transform: animated ? [{ scale: labelScale }] : [{ scale: isFocused || value ? 0.85 : 1 }],
                color: error 
                  ? COLORS.error 
                  : success 
                  ? COLORS.success 
                  : isFocused 
                  ? COLORS.primary 
                  : COLORS.textMuted,
              },
            ]}
          >
            {label}{required && ' *'}
          </Animated.Text>
        )}

        {/* Input Container */}
        <View style={styles.inputWrapper}>
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              {leftIcon}
            </View>
          )}
          
          <TextInput
            ref={inputRef}
            style={[getInputStyle(), inputStyle]}
            placeholder={!label || (!isFocused && !value) ? placeholder : ''}
            placeholderTextColor={COLORS.textMuted}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            selectionColor={COLORS.primary}
            {...props}
          />
          
          {/* Right Icons */}
          <View style={styles.rightIconsContainer}>
            {showClearButton && value && !showPasswordToggle && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleClear}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
            
            {showPasswordToggle && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={togglePasswordVisibility}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.passwordToggle}>
                  {isPasswordVisible ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            )}
            
            {rightIcon && (
              <View style={styles.rightIconContainer}>
                {rightIcon}
              </View>
            )}
          </View>
        </View>

        {/* Underline for underlined variant */}
        {variant === 'underlined' && (
          <View style={styles.underlineContainer}>
            <View style={styles.underline} />
            <Animated.View
              style={[
                styles.animatedUnderline,
                {
                  backgroundColor: error 
                    ? COLORS.error 
                    : success 
                    ? COLORS.success 
                    : COLORS.primary,
                  transform: [{
                    scaleX: isFocused ? 1 : 0,
                  }],
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Helper Text, Error, Success, Character Count */}
      <View style={styles.bottomContainer}>
        <View style={styles.messageContainer}>
          {error && (
            <Text style={styles.errorText}>⚠️ {error}</Text>
          )}
          {success && !error && (
            <Text style={styles.successText}>✓ {success}</Text>
          )}
          {helperText && !error && !success && (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>
        
        {characterCount && maxLength && (
          <Text style={[
            styles.characterCount,
            value?.length >= maxLength * 0.9 && styles.characterCountWarning,
            value?.length >= maxLength && styles.characterCountError,
          ]}>
            {value?.length || 0}/{maxLength}
          </Text>
        )}
      </View>
    </Animated.View>
  );

  return inputContent;
};

const styles = StyleSheet.create({
  // Base container styles
  container: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.input,
    ...SHADOWS.subtle,
  },

  // Variant styles
  outlinedContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filledContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    borderTopLeftRadius: BORDER_RADIUS.input,
    borderTopRightRadius: BORDER_RADIUS.input,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  underlinedContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderRadius: 0,
    ...SHADOWS.none,
  },

  // Size styles
  smallContainer: {
    minHeight: LAYOUT.inputHeight - 12,
    paddingHorizontal: SPACING.sm,
  },

  mediumContainer: {
    minHeight: LAYOUT.inputHeight,
    paddingHorizontal: SPACING.md,
  },

  largeContainer: {
    minHeight: LAYOUT.inputHeight + 12,
    paddingHorizontal: SPACING.lg,
  },

  // State styles
  focusedContainer: {
    ...SHADOWS.light,
  },

  errorContainer: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight + '10',
  },

  successContainer: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successLight + '10',
  },

  disabledContainer: {
    backgroundColor: COLORS.grayLight,
    opacity: 0.7,
    ...SHADOWS.none,
  },

  // Gradient background
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.input,
  },

  // Animated border
  animatedBorder: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: BORDER_RADIUS.input,
    borderWidth: 2,
  },

  // Floating label
  label: {
    position: 'absolute',
    left: SPACING.md,
    fontSize: FONTS.body2,
    fontWeight: FONTS.weightMedium,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xs,
    zIndex: 1,
  },

  // Input wrapper
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // Input styles
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    paddingVertical: 0, // Remove default padding
  },

  smallInput: {
    fontSize: FONTS.sm,
    paddingVertical: SPACING.sm,
  },

  mediumInput: {
    fontSize: FONTS.body1,
    paddingVertical: SPACING.md,
  },

  largeInput: {
    fontSize: FONTS.lg,
    paddingVertical: SPACING.lg,
  },

  inputWithLeftIcon: {
    marginLeft: SPACING.sm,
  },

  inputWithRightIcon: {
    marginRight: SPACING.sm,
  },

  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },

  // Icon containers
  leftIconContainer: {
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  rightIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon styles
  clearIcon: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    fontWeight: FONTS.weightMedium,
  },

  passwordToggle: {
    fontSize: FONTS.md,
  },

  // Underlined variant
  underlineContainer: {
    position: 'relative',
    height: 2,
    marginTop: SPACING.xs,
  },

  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border,
  },

  animatedUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  // Bottom container
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.sm,
  },

  messageContainer: {
    flex: 1,
  },

  // Message styles
  errorText: {
    fontSize: FONTS.caption,
    color: COLORS.error,
    fontWeight: FONTS.weightMedium,
    lineHeight: FONTS.caption * FONTS.lineHeightNormal,
  },

  successText: {
    fontSize: FONTS.caption,
    color: COLORS.success,
    fontWeight: FONTS.weightMedium,
    lineHeight: FONTS.caption * FONTS.lineHeightNormal,
  },

  helperText: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    lineHeight: FONTS.caption * FONTS.lineHeightNormal,
  },

  // Character count
  characterCount: {
    fontSize: FONTS.caption,
    color: COLORS.textMuted,
    fontWeight: FONTS.weightMedium,
    marginLeft: SPACING.sm,
  },

  characterCountWarning: {
    color: COLORS.warning,
  },

  characterCountError: {
    color: COLORS.error,
  },
});

export default CustomInput;
