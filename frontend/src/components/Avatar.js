import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

import { COLORS, LAYOUT, BORDER_RADIUS, SHADOWS, FONTS } from '../constants/theme';

import Text from './Text';

const Avatar = ({
  source,
  size = 'md',
  name,
  showName = false,
  onPress,
  badge,
  badgeColor = COLORS.success,
  verified = false,
  online = false,
  style,
  imageStyle,
  ...props
}) => {
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSize = () => {
    switch (size) {
      case 'xs':
        return LAYOUT.avatarSize.xs;
      case 'sm':
        return LAYOUT.avatarSize.sm;
      case 'lg':
        return LAYOUT.avatarSize.lg;
      case 'xl':
        return LAYOUT.avatarSize.xl;
      default:
        return LAYOUT.avatarSize.md;
    }
  };

  const fontSize = {
    xs: FONTS.caption,
    sm: FONTS.body2,
    md: FONTS.body1,
    lg: FONTS.h4,
    xl: FONTS.h3,
  }[size];

  const avatarSize = getSize();

  const renderContent = () => (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
      {source ? (
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={[
            styles.image,
            { width: avatarSize, height: avatarSize },
            imageStyle,
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: avatarSize,
              height: avatarSize,
              backgroundColor: COLORS.primaryLight,
            },
          ]}
        >
          <Text
            variant="body1"
            style={{ fontSize, color: COLORS.white }}
            weight="medium"
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {/* Online Status Badge */}
      {online && (
        <View
          style={[
            styles.onlineBadge,
            { backgroundColor: COLORS.success },
          ]}
        />
      )}

      {/* Verified Badge */}
      {verified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedIcon}>✓</Text>
        </View>
      )}

      {/* Custom Badge */}
      {badge && (
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeColor },
          ]}
        >
          {typeof badge === 'string' ? (
            <Text
              variant="caption"
              style={styles.badgeText}
              weight="medium"
            >
              {badge}
            </Text>
          ) : (
            badge
          )}
        </View>
      )}
    </View>
  );

  const content = renderContent();

  if (showName) {
    return (
      <View style={styles.wrapper}>
        {onPress ? (
          <TouchableOpacity onPress={onPress} {...props}>
            {content}
          </TouchableOpacity>
        ) : (
          content
        )}
        <Text
          variant="body2"
          style={styles.name}
          numberOfLines={1}
          weight="medium"
        >
          {name}
        </Text>
      </View>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} {...props}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.avatar,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  name: {
    marginTop: 4,
    color: COLORS.textPrimary,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: '10%',
    right: '10%',
    width: '20%',
    height: '20%',
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  verifiedIcon: {
    color: COLORS.white,
    fontSize: FONTS.caption,
    fontWeight: FONTS.weightBold,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONTS.overline,
  },
});

export default Avatar;
