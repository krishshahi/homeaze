// QuoteCard Component - Display Quote Information with Actions
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const QuoteCard = ({
  quote,
  userType = 'customer', // 'customer' or 'provider'
  onPress,
  onAccept,
  onReject,
  onUpdate,
  onViewDetails,
  style
}) => {
  const [showActions, setShowActions] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      pending: COLORS.warning,
      accepted: COLORS.success,
      rejected: COLORS.error,
      expired: COLORS.textMuted,
      converted: COLORS.primary,
      draft: COLORS.info
    };
    return statusColors[status] || COLORS.textMuted;
  };

  // Get status text
  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'Pending Review',
      accepted: 'Accepted',
      rejected: 'Rejected',
      expired: 'Expired',
      converted: 'Converted to Booking',
      draft: 'Draft'
    };
    return statusTexts[status] || status;
  };

  // Handle accept quote
  const handleAccept = () => {
    Alert.alert(
      'Accept Quote',
      'Are you sure you want to accept this quote? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: () => onAccept && onAccept(quote.id)
        }
      ]
    );
  };

  // Handle reject quote
  const handleReject = () => {
    Alert.alert(
      'Reject Quote',
      'Are you sure you want to reject this quote?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => onReject && onReject(quote.id)
        }
      ]
    );
  };

  // Calculate time remaining for pending quotes
  const getTimeRemaining = () => {
    if (quote.status !== 'pending' || !quote.expiresAt) return null;
    
    const now = new Date();
    const expiresAt = new Date(quote.expiresAt);
    const diff = expiresAt - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  const timeRemaining = getTimeRemaining();
  const statusColor = getStatusColor(quote.status);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress && onPress(quote)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.serviceTitle} numberOfLines={1}>
              {quote.serviceDetails?.title || 'Service Quote'}
            </Text>
            <Text style={styles.quoteId}>Quote #{quote.quoteNumber || quote.id}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{getStatusText(quote.status)}</Text>
            </View>
          </View>
        </View>

        {/* Quote Details */}
        <View style={styles.content}>
          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total Amount</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(quote.pricing?.totalAmount || 0)}
            </Text>
          </View>

          {/* Service Details */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>📅 Date</Text>
              <Text style={styles.detailValue}>
                {quote.timeline?.preferredStartDate ? 
                  formatDate(quote.timeline.preferredStartDate) : 
                  'To be scheduled'
                }
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>⏱️ Duration</Text>
              <Text style={styles.detailValue}>
                {quote.timeline?.estimatedDuration || 'TBD'}
              </Text>
            </View>
          </View>

          {/* Provider/Customer Info */}
          {userType === 'customer' && quote.provider && (
            <View style={styles.providerInfo}>
              <Text style={styles.providerLabel}>👷 Provider</Text>
              <Text style={styles.providerName}>{quote.provider.businessName}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {quote.provider.rating?.average || 'N/A'}</Text>
                <Text style={styles.reviewCount}>
                  ({quote.provider.rating?.count || 0} reviews)
                </Text>
              </View>
            </View>
          )}

          {userType === 'provider' && quote.customer && (
            <View style={styles.customerInfo}>
              <Text style={styles.customerLabel}>👤 Customer</Text>
              <Text style={styles.customerName}>{quote.customer.name}</Text>
              <Text style={styles.location}>📍 {quote.serviceLocation?.address}</Text>
            </View>
          )}

          {/* Time Remaining */}
          {timeRemaining && quote.status === 'pending' && (
            <View style={styles.timeContainer}>
              <Text style={[
                styles.timeText,
                { color: timeRemaining === 'Expired' ? COLORS.error : COLORS.warning }
              ]}>
                ⏰ {timeRemaining}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {quote.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onViewDetails && onViewDetails(quote)}
            >
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>

            {userType === 'customer' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={handleReject}
                >
                  <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
                    Reject
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={handleAccept}
                >
                  <Text style={[styles.actionButtonText, styles.acceptButtonText]}>
                    Accept
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {userType === 'provider' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.updateButton]}
                onPress={() => onUpdate && onUpdate(quote)}
              >
                <Text style={[styles.actionButtonText, styles.updateButtonText]}>
                  Update
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Accepted/Converted Actions */}
        {(quote.status === 'accepted' || quote.status === 'converted') && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onViewDetails && onViewDetails(quote)}
            >
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>
            
            {quote.status === 'accepted' && userType === 'customer' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => {
                  // Navigate to booking conversion
                  console.log('Convert to booking:', quote.id);
                }}
              >
                <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                  Book Now
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quote Notes */}
        {quote.notes && quote.notes.length > 0 && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>📝 Latest Note</Text>
            <Text style={styles.notesText} numberOfLines={2}>
              {quote.notes[quote.notes.length - 1].content}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  gradient: {
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
    flex: 1,
    marginRight: SPACING.sm,
  },
  serviceTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  quoteId: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  content: {
    marginBottom: SPACING.md,
  },
  priceContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  priceValue: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  providerInfo: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  providerLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  providerName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: FONTS.sm,
    color: COLORS.warning,
    marginRight: SPACING.xs,
  },
  reviewCount: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  customerInfo: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  customerLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  customerName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  location: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  rejectButton: {
    backgroundColor: COLORS.error + '20',
  },
  rejectButtonText: {
    color: COLORS.error,
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  acceptButtonText: {
    color: COLORS.white,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
  },
  updateButtonText: {
    color: COLORS.white,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  notesContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  notesLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  notesText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sm * 1.4,
  },
});

export default QuoteCard;
