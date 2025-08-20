// ProviderCard Component - Enhanced Provider Display
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const ProviderCard = ({
  provider,
  onPress,
  onMessagePress,
  onCallPress,
  onFavoritePress,
  onRequestQuote,
  onViewProfile,
  showActions = true,
  showDistance = true,
  showServices = true,
  style,
  variant = 'default' // 'default', 'compact', 'detailed'
}) => {
  const [isFavorite, setIsFavorite] = useState(provider.isFavorite || false);

  // Format distance
  const formatDistance = (distance) => {
    if (!distance) return null;
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return COLORS.success;
    if (rating >= 4.0) return COLORS.warning;
    if (rating >= 3.5) return COLORS.info;
    return COLORS.error;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle favorite toggle
  const handleFavoritePress = () => {
    setIsFavorite(!isFavorite);
    onFavoritePress && onFavoritePress(provider.id, !isFavorite);
  };

  // Handle call press
  const handleCallPress = () => {
    if (provider.contact?.phone) {
      Alert.alert(
        'Call Provider',
        `Would you like to call ${provider.businessName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => onCallPress && onCallPress(provider.contact.phone) }
        ]
      );
    } else {
      Alert.alert('Phone Not Available', 'This provider has not shared their phone number.');
    }
  };

  // Render verification badges
  const renderVerificationBadges = () => {
    if (!provider.verifications) return null;

    const badges = [];
    
    if (provider.verifications.identity) badges.push({ text: '✓ ID', color: COLORS.success });
    if (provider.verifications.background) badges.push({ text: '✓ BG', color: COLORS.primary });
    if (provider.verifications.insurance) badges.push({ text: '✓ INS', color: COLORS.info });
    if (provider.verifications.license) badges.push({ text: '✓ LIC', color: COLORS.warning });
    
    if (badges.length === 0) return null;

    return (
      <View style={styles.verificationBadges}>
        {badges.map((badge, index) => (
          <View key={index} style={[styles.verificationBadge, { backgroundColor: badge.color + '20' }]}>
            <Text style={[styles.verificationText, { color: badge.color }]}>
              {badge.text}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render service tags
  const renderServiceTags = () => {
    if (!showServices || !provider.services || provider.services.length === 0) return null;

    const displayServices = provider.services.slice(0, 3);
    const hasMore = provider.services.length > 3;

    return (
      <View style={styles.serviceTagsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceTags}>
          {displayServices.map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{service.title || service.name}</Text>
            </View>
          ))}
          {hasMore && (
            <View style={[styles.serviceTag, styles.moreServiceTag]}>
              <Text style={styles.moreServiceText}>+{provider.services.length - 3}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  // Render pricing info
  const renderPricingInfo = () => {
    if (!provider.pricing) return null;

    return (
      <View style={styles.pricingContainer}>
        {provider.pricing.hourlyRate && (
          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>Hourly</Text>
            <Text style={styles.pricingValue}>{formatCurrency(provider.pricing.hourlyRate)}/hr</Text>
          </View>
        )}
        {provider.pricing.minimumCharge && (
          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>Minimum</Text>
            <Text style={styles.pricingValue}>{formatCurrency(provider.pricing.minimumCharge)}</Text>
          </View>
        )}
      </View>
    );
  };

  // Render availability
  const renderAvailability = () => {
    if (!provider.availability) return null;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    const todayHours = provider.availability.schedule?.[currentDay];
    const isOpenToday = todayHours && !todayHours.isClosed;
    
    let availabilityText = 'Availability Unknown';
    let availabilityColor = COLORS.textMuted;
    
    if (isOpenToday) {
      const isCurrentlyOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;
      if (isCurrentlyOpen) {
        availabilityText = `Open until ${todayHours.close}`;
        availabilityColor = COLORS.success;
      } else {
        availabilityText = `Opens at ${todayHours.open}`;
        availabilityColor = COLORS.warning;
      }
    } else {
      availabilityText = 'Closed today';
      availabilityColor = COLORS.error;
    }

    return (
      <View style={styles.availabilityContainer}>
        <Text style={[styles.availabilityText, { color: availabilityColor }]}>
          🕒 {availabilityText}
        </Text>
      </View>
    );
  };

  // Render stats
  const renderStats = () => {
    const stats = [];
    
    if (provider.metrics?.totalJobs) {
      stats.push({ label: 'Jobs', value: provider.metrics.totalJobs });
    }
    
    if (provider.metrics?.responseTime) {
      const hours = Math.floor(provider.metrics.responseTime / 60);
      const minutes = provider.metrics.responseTime % 60;
      const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      stats.push({ label: 'Response', value: timeText });
    }
    
    if (provider.metrics?.completionRate) {
      stats.push({ label: 'Success', value: `${provider.metrics.completionRate}%` });
    }

    if (stats.length === 0) return null;

    return (
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render compact version
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.container, styles.compactContainer, style]}
        onPress={() => onPress && onPress(provider)}
        activeOpacity={0.8}
      >
        <View style={styles.compactContent}>
          {/* Avatar */}
          <View style={styles.compactAvatarContainer}>
            {provider.profilePicture ? (
              <Image source={{ uri: provider.profilePicture }} style={styles.compactAvatar} />
            ) : (
              <View style={styles.compactAvatarPlaceholder}>
                <Text style={styles.compactAvatarText}>
                  {provider.businessName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            {provider.isOnline && <View style={styles.onlineIndicator} />}
          </View>

          {/* Info */}
          <View style={styles.compactInfo}>
            <Text style={styles.compactName} numberOfLines={1}>
              {provider.businessName}
            </Text>
            <View style={styles.compactRating}>
              <Text style={styles.compactRatingText}>
                ⭐ {provider.rating?.average?.toFixed(1) || 'N/A'}
              </Text>
              {showDistance && provider.distance && (
                <Text style={styles.compactDistance}>
                  📍 {formatDistance(provider.distance)}
                </Text>
              )}
            </View>
          </View>

          {/* Price */}
          {provider.pricing?.hourlyRate && (
            <View style={styles.compactPrice}>
              <Text style={styles.compactPriceText}>
                {formatCurrency(provider.pricing.hourlyRate)}/hr
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Render default/detailed version
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress && onPress(provider)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {provider.profilePicture ? (
                <Image source={{ uri: provider.profilePicture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {provider.businessName?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              {provider.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            {/* Basic Info */}
            <View style={styles.basicInfo}>
              <Text style={styles.businessName} numberOfLines={1}>
                {provider.businessName}
              </Text>
              <View style={styles.ratingContainer}>
                <View style={styles.rating}>
                  <Text style={[
                    styles.ratingText,
                    { color: getRatingColor(provider.rating?.average || 0) }
                  ]}>
                    ⭐ {provider.rating?.average?.toFixed(1) || 'N/A'}
                  </Text>
                  <Text style={styles.reviewCount}>
                    ({provider.rating?.count || 0})
                  </Text>
                </View>
                {showDistance && provider.distance && (
                  <Text style={styles.distance}>
                    📍 {formatDistance(provider.distance)}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? COLORS.error : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Verification Badges */}
          {renderVerificationBadges()}

          {/* Description */}
          {provider.description && (
            <Text style={styles.description} numberOfLines={2}>
              {provider.description}
            </Text>
          )}

          {/* Service Tags */}
          {renderServiceTags()}

          {/* Pricing Info */}
          {renderPricingInfo()}

          {/* Availability */}
          {renderAvailability()}

          {/* Stats */}
          {variant === 'detailed' && renderStats()}
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.messageButton]}
              onPress={() => onMessagePress && onMessagePress(provider)}
            >
              <Text style={styles.messageButtonText}>
                <MaterialCommunityIcons name="message-text-outline" /> Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={handleCallPress}
            >
              <Text style={styles.callButtonText}>
                <MaterialCommunityIcons name="phone-outline" /> Call
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.quoteButton]}
              onPress={() => onRequestQuote && onRequestQuote(provider)}
            >
              <Text style={styles.quoteButtonText}>
                <MaterialCommunityIcons name="briefcase-outline" /> Quote
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* View Profile Link */}
        <TouchableOpacity
          style={styles.viewProfileButton}
          onPress={() => onViewProfile && onViewProfile(provider)}
        >
          <Text style={styles.viewProfileText}>View Full Profile →</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  compactContainer: {
    marginVertical: SPACING.xs,
  },
  gradient: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  compactAvatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  compactAvatarText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  basicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  compactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  businessName: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  compactName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    marginRight: SPACING.xs,
  },
  compactRatingText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightMedium,
    color: COLORS.warning,
  },
  reviewCount: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  distance: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  compactDistance: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  content: {
    marginBottom: SPACING.md,
  },
  verificationBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  verificationBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  verificationText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightMedium,
  },
  description: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sm * FONTS.lineHeightNormal,
    marginBottom: SPACING.sm,
  },
  serviceTagsContainer: {
    marginBottom: SPACING.sm,
  },
  serviceTags: {
    flexDirection: 'row',
  },
  serviceTag: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.xs,
  },
  serviceTagText: {
    fontSize: FONTS.xs,
    color: COLORS.textPrimary,
  },
  moreServiceTag: {
    backgroundColor: COLORS.primary + '20',
  },
  moreServiceText: {
    fontSize: FONTS.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },
  pricingContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  pricingItem: {
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  pricingValue: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  compactPrice: {
    alignItems: 'flex-end',
  },
  compactPriceText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  availabilityContainer: {
    marginBottom: SPACING.sm,
  },
  availabilityText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButton: {
    backgroundColor: COLORS.primary,
  },
  messageButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
  callButton: {
    backgroundColor: COLORS.success,
  },
  callButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
  quoteButton: {
    backgroundColor: COLORS.warning,
  },
  quoteButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
  viewProfileButton: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewProfileText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },
});

export default ProviderCard;
