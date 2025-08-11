// BookingCard Component - Display Booking Information with Actions
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const BookingCard = ({
  booking,
  userRole = 'customer', // 'customer' | 'provider'
  onPress,
  onStatusChange,
  onMessagePress,
  onCallPress,
  onCancelPress,
  onReschedulePress,
  onCompletePress,
  onViewDetailsPress,
  onTrackPress,
  showActions = true,
  showProvider = true,
  showCustomer = true,
  compact = false,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Get booking status configuration
  const getBookingStatusConfig = (status) => {
    const configs = {
      pending: {
        color: COLORS.warning,
        backgroundColor: COLORS.warning + '20',
        icon: '⏳',
        label: 'Pending',
        description: 'Waiting for confirmation'
      },
      confirmed: {
        color: COLORS.primary,
        backgroundColor: COLORS.primary + '20',
        icon: '✅',
        label: 'Confirmed',
        description: 'Booking confirmed'
      },
      in_progress: {
        color: COLORS.info,
        backgroundColor: COLORS.info + '20',
        icon: '🔄',
        label: 'In Progress',
        description: 'Service is ongoing'
      },
      completed: {
        color: COLORS.success,
        backgroundColor: COLORS.success + '20',
        icon: '✅',
        label: 'Completed',
        description: 'Service completed'
      },
      cancelled: {
        color: COLORS.error,
        backgroundColor: COLORS.error + '20',
        icon: '❌',
        label: 'Cancelled',
        description: 'Booking cancelled'
      },
      rescheduled: {
        color: COLORS.secondary,
        backgroundColor: COLORS.secondary + '20',
        icon: '📅',
        label: 'Rescheduled',
        description: 'Date/time changed'
      },
      no_show: {
        color: COLORS.error,
        backgroundColor: COLORS.error + '10',
        icon: '❌',
        label: 'No Show',
        description: 'Service not attended'
      }
    };
    
    return configs[status] || configs.pending;
  };

  // Format date and time
  const formatDateTime = (dateString, showTime = true) => {
    if (!dateString) return 'Not scheduled';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Format date
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    let dateText;
    if (isToday) {
      dateText = 'Today';
    } else if (isTomorrow) {
      dateText = 'Tomorrow';
    } else {
      dateText = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
    
    // Add time if requested
    if (showTime) {
      const timeText = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${dateText} at ${timeText}`;
    }
    
    return dateText;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Get time until booking
  const getTimeUntilBooking = () => {
    if (!booking.scheduledDate) return null;
    
    const scheduledTime = new Date(booking.scheduledDate);
    const now = new Date();
    const diffMs = scheduledTime - now;
    
    if (diffMs <= 0) return null;
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours < 1) {
      return `in ${diffMinutes} minutes`;
    } else if (diffHours < 24) {
      return `in ${diffHours} hours`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  };

  // Handle action with loading state
  const handleActionWithLoading = async (action, callback) => {
    if (!callback) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [action]: true }));
      await callback(booking);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      Alert.alert('Error', `Failed to ${action}. Please try again.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  // Handle call press
  const handleCall = () => {
    const contact = userRole === 'customer' ? booking.provider : booking.customer;
    const phone = contact?.phone || contact?.contact?.phone;
    
    if (phone) {
      Alert.alert(
        'Call Contact',
        `Would you like to call ${contact.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => Linking.openURL(`tel:${phone}`) }
        ]
      );
    } else {
      Alert.alert('Phone Not Available', 'Phone number is not available for this contact.');
    }
  };

  // Handle cancel with confirmation
  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => handleActionWithLoading('cancel', onCancelPress)
        }
      ]
    );
  };

  const statusConfig = getBookingStatusConfig(booking.status);
  const timeUntil = getTimeUntilBooking();
  const displayContact = userRole === 'customer' ? booking.provider : booking.customer;

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compactContainer, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Service Icon/Image */}
            <View style={styles.serviceIconContainer}>
              {booking.service?.image ? (
                <Image source={{ uri: booking.service.image }} style={styles.serviceIcon} />
              ) : (
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primary + 'CC']}
                  style={styles.serviceIconFallback}
                >
                  <Text style={styles.serviceIconText}>
                    {booking.service?.icon || '🔧'}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* Booking Info */}
            <View style={styles.bookingInfo}>
              <Text style={styles.serviceTitle} numberOfLines={1}>
                {booking.service?.title || booking.title || 'Service Booking'}
              </Text>
              
              <Text style={styles.bookingId} numberOfLines={1}>
                #{booking.id || booking.bookingNumber}
              </Text>
              
              {/* Time information */}
              <Text style={styles.scheduleText}>
                📅 {formatDateTime(booking.scheduledDate)}
              </Text>
              
              {timeUntil && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                <Text style={styles.timeUntilText}>
                  ⏰ {timeUntil}
                </Text>
              )}
            </View>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
            <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        {((showProvider && userRole === 'customer') || (showCustomer && userRole === 'provider')) && displayContact && (
          <View style={styles.contactSection}>
            <View style={styles.contactInfo}>
              <View style={styles.contactAvatar}>
                {displayContact.avatar ? (
                  <Image source={{ uri: displayContact.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>
                      {displayContact.name?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>
                  {userRole === 'customer' ? 'Provider: ' : 'Customer: '}
                  {displayContact.name}
                </Text>
                {displayContact.rating && (
                  <Text style={styles.contactRating}>
                    ⭐ {displayContact.rating.toFixed(1)} ({displayContact.reviewCount || 0} reviews)
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Expandable Details */}
        {!compact && (
          <>
            {/* Quick Details */}
            <View style={styles.quickDetails}>
              {booking.location && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText} numberOfLines={1}>
                    {booking.location.address}
                  </Text>
                </View>
              )}
              
              {booking.estimatedDuration && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>⏱️</Text>
                  <Text style={styles.detailText}>
                    {booking.estimatedDuration}
                  </Text>
                </View>
              )}
              
              {booking.pricing?.totalAmount && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>💰</Text>
                  <Text style={[styles.detailText, styles.priceText]}>
                    {formatCurrency(booking.pricing.totalAmount)}
                  </Text>
                </View>
              )}
            </View>

            {/* Expandable Section */}
            {booking.description && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setIsExpanded(!isExpanded)}
              >
                <Text style={styles.expandButtonText}>
                  {isExpanded ? 'Less Details ↑' : 'More Details ↓'}
                </Text>
              </TouchableOpacity>
            )}

            {isExpanded && (
              <View style={styles.expandedDetails}>
                {booking.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionTitle}>Description:</Text>
                    <Text style={styles.descriptionText}>{booking.description}</Text>
                  </View>
                )}
                
                {booking.notes && booking.notes.length > 0 && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesTitle}>Notes:</Text>
                    {booking.notes.map((note, index) => (
                      <Text key={index} style={styles.noteText}>• {note}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {/* Actions */}
        {showActions && (
          <View style={styles.actionsContainer}>
            {/* Primary Actions */}
            <View style={styles.primaryActions}>
              {/* Message */}
              <TouchableOpacity
                style={[styles.actionButton, styles.messageButton]}
                onPress={() => onMessagePress && onMessagePress(booking)}
                disabled={actionLoading.message}
              >
                <Text style={styles.messageButtonText}>💬</Text>
              </TouchableOpacity>

              {/* Call */}
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={() => onCallPress ? onCallPress(booking) : handleCall()}
                disabled={actionLoading.call}
              >
                <Text style={styles.callButtonText}>📞</Text>
              </TouchableOpacity>

              {/* Status-specific actions */}
              {booking.status === 'pending' && userRole === 'provider' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={() => handleActionWithLoading('confirm', () => onStatusChange && onStatusChange(booking, 'confirmed'))}
                  disabled={actionLoading.confirm}
                >
                  <Text style={styles.confirmButtonText}>✅ Confirm</Text>
                </TouchableOpacity>
              )}

              {booking.status === 'confirmed' && userRole === 'provider' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.startButton]}
                  onPress={() => handleActionWithLoading('start', () => onStatusChange && onStatusChange(booking, 'in_progress'))}
                  disabled={actionLoading.start}
                >
                  <Text style={styles.startButtonText}>▶️ Start</Text>
                </TouchableOpacity>
              )}

              {booking.status === 'in_progress' && userRole === 'provider' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => handleActionWithLoading('complete', onCompletePress)}
                  disabled={actionLoading.complete}
                >
                  <Text style={styles.completeButtonText}>✅ Complete</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Secondary Actions */}
            <View style={styles.secondaryActions}>
              {booking.status === 'pending' || booking.status === 'confirmed' ? (
                <>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => onReschedulePress && onReschedulePress(booking)}
                  >
                    <Text style={styles.secondaryButtonText}>📅 Reschedule</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleCancel}
                  >
                    <Text style={[styles.secondaryButtonText, { color: COLORS.error }]}>❌ Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : booking.status === 'in_progress' && onTrackPress ? (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => onTrackPress(booking)}
                >
                  <Text style={styles.secondaryButtonText}>📍 Track</Text>
                </TouchableOpacity>
              ) : null}
              
              {onViewDetailsPress && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => onViewDetailsPress(booking)}
                >
                  <Text style={styles.secondaryButtonText}>👁️ Details</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Urgent Badge for Soon Bookings */}
        {timeUntil && timeUntil.includes('minutes') && booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>🚨 SOON</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  compactContainer: {
    marginVertical: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
    position: 'relative',
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
    marginRight: SPACING.md,
  },
  serviceIconContainer: {
    marginRight: SPACING.md,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  serviceIconFallback: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIconText: {
    fontSize: 24,
  },
  bookingInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  bookingId: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  scheduleText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timeUntilText: {
    fontSize: FONTS.sm,
    color: COLORS.info,
    fontWeight: FONTS.weightMedium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  statusIcon: {
    fontSize: 16,
  },
  statusText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
  },
  contactSection: {
    marginBottom: SPACING.md,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundSecondary,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  contactRating: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  quickDetails: {
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: SPACING.sm,
    width: 20,
  },
  detailText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  priceText: {
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  expandButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  expandButtonText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },
  expandedDetails: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  descriptionContainer: {
    marginBottom: SPACING.sm,
  },
  descriptionTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  descriptionText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sm * 1.4,
  },
  notesContainer: {
    marginBottom: SPACING.sm,
  },
  notesTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  noteText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  actionsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  primaryActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  actionButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    flex: 1,
  },
  messageButton: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  messageButtonText: {
    fontSize: 16,
  },
  callButton: {
    backgroundColor: COLORS.success + '10',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  callButtonText: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
  startButton: {
    backgroundColor: COLORS.info,
  },
  startButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  completeButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  secondaryButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
  },
  secondaryButtonText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weightMedium,
  },
  urgentBadge: {
    position: 'absolute',
    top: -8,
    right: SPACING.md,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  urgentText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
});

export default BookingCard;
