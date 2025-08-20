import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { COLORS, FONTS, BORDER_RADIUS, SPACING, SHADOWS } from '../constants/theme';

import Text from './Text';

const Badge = ({
  children,
  variant = 'default', // 'default', 'dot', 'status', 'counter', 'chip'
  status = 'default', // 'default', 'success', 'warning', 'error', 'info'
  size = 'medium', // 'small', 'medium', 'large'
  onPress,
  color,
  backgroundColor,
  style,
  contentStyle,
  ...props
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      case 'error':
        return COLORS.error;
      case 'info':
        return COLORS.info;
      default:
        return COLORS.primary;
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return {
          minWidth: 16,
          height: 16,
          fontSize: FONTS.overline,
          padding: SPACING.xxs,
        };
      case 'large':
        return {
          minWidth: 24,
          height: 24,
          fontSize: FONTS.caption,
          padding: SPACING.xs,
        };
      default:
        return {
          minWidth: 20,
          height: 20,
          fontSize: FONTS.caption,
          padding: SPACING.xxs,
        };
    }
  };

  const renderContent = () => {
    const badgeSize = getBadgeSize();
    const statusColor = color || getStatusColor();
    const bgColor = backgroundColor || (variant === 'chip' ? `${statusColor}20` : statusColor);

    const containerStyle = [
      styles.container,
      {
        backgroundColor: bgColor,
        minWidth: badgeSize.minWidth,
        height: badgeSize.height,
        padding: badgeSize.padding,
      },
      variant === 'dot' && styles.dot,
      variant === 'status' && styles.status,
      variant === 'chip' && styles.chip,
      style,
    ];

    if (variant === 'dot' || variant === 'status') {
      return (
        <View style={containerStyle} {...props} />
      );
    }

    return (
      <View style={containerStyle}>
        <Text
          style={[
            styles.text,
            {
              fontSize: badgeSize.fontSize,
              color: variant === 'chip' ? statusColor : COLORS.white,
            },
            contentStyle,
          ]}
          weight="medium"
          numberOfLines={1}
        >
          {children}
        </Text>
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        disabled={variant === 'dot' || variant === 'status'}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.subtle,
  },
  dot: {
    width: 8,
    height: 8,
    minWidth: 8,
    borderRadius: BORDER_RADIUS.round,
    padding: 0,
  },
  status: {
    width: 12,
    height: 12,
    minWidth: 12,
    borderRadius: BORDER_RADIUS.round,
    padding: 0,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  chip: {
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.sm,
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default Badge;
