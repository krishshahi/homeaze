import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const NotificationSystem = ({ 
  notifications, 
  visible, 
  onClose, 
  onAcceptBooking, 
  onRejectBooking,
  onViewBooking 
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Booking Request</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onAccept={() => onAcceptBooking(notification.bookingId)}
                onReject={() => onRejectBooking(notification.bookingId)}
                onView={() => onViewBooking(notification.bookingId)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No new notifications</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const NotificationCard = ({ notification, onAccept, onReject, onView }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_request':
        return 'calendar';
      case 'booking_confirmed':
        return 'checkmark-circle';
      case 'booking_cancelled':
        return 'close-circle';
      case 'payment_received':
        return 'cash';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_request':
        return COLORS.warning;
      case 'booking_confirmed':
        return COLORS.success;
      case 'booking_cancelled':
        return COLORS.error;
      case 'payment_received':
        return COLORS.info;
      default:
        return COLORS.primary;
    }
  };

  return (
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.type) + '20' }]}>
          <Ionicons 
            name={getNotificationIcon(notification.type)} 
            size={24} 
            color={getNotificationColor(notification.type)} 
          />
        </View>
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationTime}>
            {new Date(notification.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.notificationMessage}>{notification.message}</Text>
      
      {notification.bookingDetails && (
        <View style={styles.bookingDetails}>
          <Text style={styles.serviceTitle}>{notification.bookingDetails.serviceTitle}</Text>
          <Text style={styles.customerName}>Customer: {notification.bookingDetails.customerName}</Text>
          <Text style={styles.bookingDate}>
            Date: {new Date(notification.bookingDetails.scheduledDate).toLocaleDateString()}
          </Text>
          <Text style={styles.bookingPrice}>Price: ${notification.bookingDetails.totalCost}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        {notification.type === 'booking_request' && (
          <>
            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity style={styles.viewButton} onPress={onView}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// In-app notification banner component
export const NotificationBanner = ({ notification, onPress, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss && onDismiss();
    }, 5000); // Auto dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible || !notification) return null;

  return (
    <View style={styles.bannerContainer}>
      <TouchableOpacity style={styles.banner} onPress={onPress}>
        <View style={styles.bannerContent}>
          <Ionicons name="notifications" size={20} color={COLORS.white} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{notification.title}</Text>
            <Text style={styles.bannerMessage} numberOfLines={2}>
              {notification.message}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setVisible(false)}>
          <Ionicons name="close" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notificationHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONTS.body2,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  notificationMessage: {
    fontSize: FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  bookingDetails: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  serviceTitle: {
    fontSize: FONTS.body2,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  customerName: {
    fontSize: FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  bookingDate: {
    fontSize: FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  bookingPrice: {
    fontSize: FONTS.body3,
    fontWeight: FONTS.weightMedium,
    color: COLORS.success,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body3,
    fontWeight: FONTS.weightBold,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body3,
    fontWeight: FONTS.weightBold,
  },
  viewButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  viewButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body3,
    fontWeight: FONTS.weightBold,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: FONTS.body2,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  // Banner styles
  bannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 25,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 1000,
  },
  banner: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.medium,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  bannerTitle: {
    fontSize: FONTS.body3,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  bannerMessage: {
    fontSize: FONTS.caption,
    color: COLORS.white + 'CC',
  },
});

export default NotificationSystem;
