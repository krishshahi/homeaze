import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT, ANIMATIONS } from '../constants/theme';

const { width } = Dimensions.get('window');

const ServiceCard = ({
  title,
  icon,
  image,
  description,
  rating,
  reviewCount = 0,
  startingPrice,
  originalPrice,
  discount,
  provider,
  duration,
  availability,
  tags = [],
  onPress,
  onFavoritePress,
  onSharePress,
  style,
  featured = false,
  variant = 'default', // 'default', 'compact', 'horizontal', 'featured'
  isFavorite = false,
  isUnavailable = false,
  showActions = true,
  animated = true,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(1));
  // Animation handlers
  const handlePressIn = () => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: ANIMATIONS.timing.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATIONS.timing.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePress = () => {
    if (onPress && !isUnavailable) {
      onPress();
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={i} style={styles.starFilled}>★</Text>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Text key="half" style={styles.starHalf}>★</Text>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Text key={`empty-${i}`} style={styles.starEmpty}>★</Text>
      );
    }

    return stars;
  };

  const containerStyle = [
    styles.container,
    variant === 'compact' && styles.compactContainer,
    variant === 'horizontal' && styles.horizontalContainer,
    featured && styles.featuredContainer,
    isUnavailable && styles.unavailableContainer,
    style,
  ];

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
        animated ? {} : { transform: [{ scale: 1 }], opacity: 1 },
      ]}
    >
      <TouchableOpacity
        style={containerStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={isUnavailable}
      >
        {/* Background Gradient for Featured */}
        {featured && (
          <LinearGradient
            colors={COLORS.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredGradient}
          />
        )}

        {/* Badges */}
        <View style={styles.badgeContainer}>
          {featured && (
            <View style={[styles.badge, styles.featuredBadge]}>
              <Text style={styles.featuredBadgeText}>✨ Popular</Text>
            </View>
          )}
          {discount && (
            <View style={[styles.badge, styles.discountBadge]}>
              <Text style={styles.discountBadgeText}>{discount}% OFF</Text>
            </View>
          )}
          {isUnavailable && (
            <View style={[styles.badge, styles.unavailableBadge]}>
              <Text style={styles.unavailableBadgeText}>Unavailable</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, isFavorite && styles.favoriteActive]}
              onPress={onFavoritePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.actionIcon, isFavorite && styles.favoriteIcon]}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
            {onSharePress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onSharePress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.actionIcon}>📤</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Service Image/Icon */}
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.serviceImage} />
          ) : (
            <LinearGradient
              colors={featured ? ['#FFFFFF40', '#FFFFFF60'] : COLORS.gradientNeutral}
              style={styles.iconContainer}
            >
              <Text style={[styles.icon, featured && styles.featuredIcon]}>{icon}</Text>
            </LinearGradient>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={[styles.title, featured && styles.featuredTitle]} numberOfLines={1}>
            {title}
          </Text>

          {provider && (
            <Text style={[styles.provider, featured && styles.featuredProvider]} numberOfLines={1}>
              by {provider.name}
            </Text>
          )}

          {description && variant !== 'compact' && (
            <Text style={[styles.description, featured && styles.featuredDescription]} numberOfLines={2}>
              {description}
            </Text>
          )}

          {/* Tags */}
          {tags.length > 0 && variant !== 'compact' && (
            <View style={styles.tagsContainer}>
              {tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom section */}
          <View style={styles.bottomContainer}>
            {/* Rating */}
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderRatingStars(rating)}
              </View>
              <Text style={[styles.ratingText, featured && styles.featuredRatingText]}>
                {rating.toFixed(1)}
              </Text>
              {reviewCount > 0 && (
                <Text style={[styles.reviewCount, featured && styles.featuredReviewCount]}>
                  ({reviewCount})
                </Text>
              )}
            </View>

            {/* Duration & Availability */}
            {(duration || availability) && variant !== 'compact' && (
              <View style={styles.metaContainer}>
                {duration && (
                  <Text style={[styles.metaText, featured && styles.featuredMetaText]}>
                    ⏱️ {duration}
                  </Text>
                )}
                {availability && (
                  <Text style={[styles.metaText, featured && styles.featuredMetaText]}>
                    📅 {availability}
                  </Text>
                )}
              </View>
            )}

            {/* Price */}
            <View style={styles.priceContainer}>
              {originalPrice && discount && (
                <Text style={[styles.originalPrice, featured && styles.featuredOriginalPrice]}>
                  ${originalPrice}
                </Text>
              )}
              <View style={styles.currentPriceContainer}>
                <Text style={[styles.priceLabel, featured && styles.featuredPriceLabel]}>From</Text>
                <Text style={[styles.price, featured && styles.featuredPrice]}>
                  ${startingPrice}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Unavailable overlay */}
        {isUnavailable && <View style={styles.unavailableOverlay} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Horizontal service card variant
export const ServiceCardHorizontal = ({
  title,
  icon,
  description,
  rating,
  startingPrice,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.horizontalContainer, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.horizontalIconContainer}>
        <Text style={styles.horizontalIcon}>{icon}</Text>
      </View>

      <View style={styles.horizontalContent}>
        <Text style={styles.horizontalTitle}>{title}</Text>
        {description && (
          <Text style={styles.horizontalDescription} numberOfLines={1}>
            {description}
          </Text>
        )}
        
        <View style={styles.horizontalBottomContainer}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.rating}>{rating}</Text>
          </View>
          <Text style={styles.price}>From ${startingPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base container styles
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    width: (width - SPACING.lg * 3) / 2,
    minHeight: LAYOUT.cardMinHeight,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.medium,
  },

  compactContainer: {
    padding: SPACING.sm,
    minHeight: 100,
  },

  horizontalContainer: {
    width: '100%',
    flexDirection: 'row',
    padding: SPACING.lg,
    minHeight: 80,
  },

  featuredContainer: {
    ...SHADOWS.heavy,
    borderWidth: 0,
    transform: [{ scale: 1.02 }],
  },

  unavailableContainer: {
    opacity: 0.7,
  },

  // Featured gradient background
  featuredGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },

  // Badge container and badges
  badgeContainer: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },

  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },

  featuredBadge: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.light,
  },

  discountBadge: {
    backgroundColor: COLORS.error,
    ...SHADOWS.light,
  },

  unavailableBadge: {
    backgroundColor: COLORS.grayDark,
  },

  featuredBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },

  discountBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },

  unavailableBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },

  // Action buttons
  actionsContainer: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'column',
    gap: SPACING.xs,
    zIndex: 10,
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },

  favoriteActive: {
    backgroundColor: COLORS.errorLight,
  },

  actionIcon: {
    fontSize: 14,
  },

  favoriteIcon: {
    fontSize: 16,
  },

  // Image and icon container
  imageContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },

  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },

  icon: {
    fontSize: LAYOUT.iconSize.xl,
  },

  featuredIcon: {
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Content container
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: FONTS.md * FONTS.lineHeightTight,
  },

  featuredTitle: {
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  provider: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    fontStyle: 'italic',
  },

  featuredProvider: {
    color: COLORS.grayLight,
  },

  description: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sm * FONTS.lineHeightNormal,
    marginBottom: SPACING.sm,
  },

  featuredDescription: {
    color: COLORS.grayLight,
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },

  tag: {
    backgroundColor: COLORS.primaryUltraLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.xs,
  },

  tagText: {
    fontSize: FONTS.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },

  // Bottom container
  bottomContainer: {
    marginTop: 'auto',
  },

  // Rating
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },

  starsContainer: {
    flexDirection: 'row',
    marginRight: SPACING.xs,
  },

  starFilled: {
    fontSize: FONTS.sm,
    color: COLORS.warning,
  },

  starHalf: {
    fontSize: FONTS.sm,
    color: COLORS.warningLight,
  },

  starEmpty: {
    fontSize: FONTS.sm,
    color: COLORS.borderLight,
  },

  ratingText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },

  featuredRatingText: {
    color: COLORS.white,
  },

  reviewCount: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },

  featuredReviewCount: {
    color: COLORS.grayLight,
  },

  // Meta information
  metaContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },

  metaText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },

  featuredMetaText: {
    color: COLORS.grayLight,
  },

  // Pricing
  priceContainer: {
    alignItems: 'flex-end',
  },

  originalPrice: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginBottom: SPACING.xxs,
  },

  featuredOriginalPrice: {
    color: COLORS.grayLight,
  },

  currentPriceContainer: {
    alignItems: 'flex-end',
  },

  priceLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xxs,
  },

  featuredPriceLabel: {
    color: COLORS.grayLight,
  },

  price: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },

  featuredPrice: {
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Unavailable overlay
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.backgroundOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Legacy horizontal styles (maintaining backward compatibility)
  horizontalIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },

  horizontalIcon: {
    fontSize: 28,
  },

  horizontalContent: {
    flex: 1,
  },

  horizontalTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },

  horizontalDescription: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },

  horizontalBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Legacy styles for backward compatibility
  ratingIcon: {
    fontSize: FONTS.sm,
    marginRight: SPACING.xs,
  },

  rating: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
});

export default ServiceCard;
