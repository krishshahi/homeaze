import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/modernTheme';

const ModernInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  error,
  helperText,
  leftIcon,
  rightIcon,
  rightIconOnPress,
  secureTextEntry = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  size = 'md',
  variant = 'outline',
  style,
  inputStyle,
  labelStyle,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const focusAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: theme.animations.duration.fast,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, labelAnim]);

  useEffect(() => {
    Animated.timing(borderColorAnim, {
      toValue: error ? 2 : isFocused ? 1 : 0,
      duration: theme.animations.duration.fast,
      useNativeDriver: false,
    }).start();
  }, [isFocused, error, borderColorAnim]);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getSizeStyles = () => {
    const sizeConfig = theme.components.input.sizes[size];
    return {
      paddingVertical: sizeConfig.paddingVertical,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      fontSize: sizeConfig.fontSize,
      minHeight: multiline ? sizeConfig.minHeight * numberOfLines : sizeConfig.minHeight,
    };
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: theme.colors.neutral[50],
          borderWidth: 0,
          borderBottomWidth: 2,
          borderRadius: theme.borderRadius.md,
        };
      case 'underline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderBottomWidth: 1,
          borderRadius: 0,
        };
      case 'outline':
      default:
        return {
          backgroundColor: theme.colors.surface.primary,
          borderWidth: 1,
          borderRadius: theme.borderRadius.lg,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const getBorderColor = () => {
    return borderColorAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [
        theme.colors.border.primary,
        theme.colors.border.focus,
        theme.colors.border.error,
      ],
    });
  };

  const containerStyles = [
    styles.container,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    variantStyles,
    {
      borderColor: getBorderColor(),
    },
    style,
  ];

  const inputStyles = [
    styles.input,
    {
      fontSize: sizeStyles.fontSize,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      minHeight: sizeStyles.minHeight,
      paddingLeft: leftIcon ? sizeStyles.paddingHorizontal + 30 : sizeStyles.paddingHorizontal,
      paddingRight: (rightIcon || secureTextEntry) ? sizeStyles.paddingHorizontal + 30 : sizeStyles.paddingHorizontal,
      textAlignVertical: multiline ? 'top' : 'center',
      opacity: editable ? 1 : 0.6,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.secondary,
    },
    inputStyle,
  ];

  const labelStyles = [
    styles.label,
    {
      color: isFocused ? theme.colors.border.focus : theme.colors.text.secondary,
      fontSize: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [sizeStyles.fontSize, theme.typography.size.sm],
      }),
      transform: [
        {
          translateY: labelAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -8],
          }),
        },
      ],
    },
    labelStyle,
  ];

  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    return (
      <View style={[styles.iconContainer, styles.leftIconContainer]}>
        <Ionicons
          name={leftIcon}
          size={20}
          color={isFocused ? theme.colors.border.focus : theme.colors.text.tertiary}
        />
      </View>
    );
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          style={[styles.iconContainer, styles.rightIconContainer]}
          onPress={togglePasswordVisibility}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.colors.text.tertiary}
          />
        </TouchableOpacity>
      );
    }

    if (!rightIcon) return null;

    return (
      <TouchableOpacity
        style={[styles.iconContainer, styles.rightIconContainer]}
        onPress={rightIconOnPress}
        disabled={!rightIconOnPress}
      >
        <Ionicons
          name={rightIcon}
          size={20}
          color={isFocused ? theme.colors.border.focus : theme.colors.text.tertiary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={containerStyles}>
      {label && (
        <Animated.Text style={labelStyles}>
          {label}
        </Animated.Text>
      )}
      
      <Animated.View style={inputContainerStyles}>
        {renderLeftIcon()}
        
        <TextInput
          {...props}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={!isFocused && !value ? placeholder : ''}
          placeholderTextColor={theme.colors.text.placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          style={inputStyles}
        />
        
        {renderRightIcon()}
      </Animated.View>

      {(error || helperText) && (
        <View style={styles.helpTextContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={theme.colors.error[500]}
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {!error && helperText && (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  label: {
    position: 'absolute',
    left: theme.spacing[4],
    top: theme.spacing[3],
    zIndex: 1,
    backgroundColor: theme.colors.surface.primary,
    paddingHorizontal: theme.spacing[1],
    fontFamily: theme.typography.fonts.secondary,
    fontWeight: theme.typography.weight.medium,
  },
  inputContainer: {
    position: 'relative',
    ...theme.shadows.xs,
  },
  input: {
    flex: 1,
    includeFontPadding: false,
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    zIndex: 1,
  },
  leftIconContainer: {
    left: 0,
  },
  rightIconContainer: {
    right: 0,
  },
  helpTextContainer: {
    marginTop: theme.spacing[1],
    paddingHorizontal: theme.spacing[1],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: theme.spacing[1],
  },
  errorText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.error[500],
    fontFamily: theme.typography.fonts.secondary,
    flex: 1,
  },
  helperText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fonts.secondary,
  },
});

export default ModernInput;
