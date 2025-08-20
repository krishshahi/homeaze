import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import BookingsAPI from '../services/bookingsApi';
import { useAppDispatch } from '../store/hooks';

const ProviderBookingDetailsScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const dispatch = useAppDispatch();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const loadBookingDetails = async () => {
    try {
      console.log('📋 Loading booking details for:', bookingId);
      setLoading(true);
      
      const response = await BookingsAPI.getBookingById(bookingId);
      console.log('✅ Booking details loaded:', response);
      
      setBooking(response.booking || response);
      
    } catch (error) {
      console.error('❌ Error loading booking details:', error);
      // Use mock data as fallback
      setBooking(mockBookingDetail);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      console.log('🔄 Updating booking status:', { bookingId, newStatus });
      
      await BookingsAPI.updateBookingStatus(bookingId, newStatus);
      
      setBooking(prev => ({ 
        ...prev, 
        status: newStatus, 
        updatedAt: new Date().toISOString() 
      }));
      
      Alert.alert('Success', `Booking has been ${newStatus}`);
      
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const handleCallCustomer = () => {
    const phoneNumber = booking?.customerPhone || booking?.customer?.phone;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Error', 'Customer phone number not available');
    }
  };

  const handleMessageCustomer = () => {
    const phoneNumber = booking?.customerPhone || booking?.customer?.phone;
    if (phoneNumber) {
      Linking.openURL(`sms:${phoneNumber}`);
    } else {
      Alert.alert('Error', 'Customer phone number not available');
    }
  };

  const handleGetDirections = () => {
    const address = booking?.location || booking?.address;
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
    } else {
      Alert.alert('Error', 'Location not available');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'confirmed': return COLORS.info;
      case 'in-progress': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'in-progress': return '🔄';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const renderStatusActions = () => {
    if (!booking) return null;

    const actions = [];
    
    if (booking.status === 'pending') {
      actions.push(
        <TouchableOpacity
          key="confirm"
          style={[styles.actionButton, styles.confirmButton]}
          onPress={() => handleStatusUpdate('confirmed')}
        >
          <Text style={styles.confirmButtonText}>✅ Accept Booking</Text>
        </TouchableOpacity>
      );
      actions.push(
        <TouchableOpacity
          key="decline"
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleStatusUpdate('cancelled')}
        >
          <Text style={styles.declineButtonText}>❌ Decline Booking</Text>
        </TouchableOpacity>
      );
    } else if (booking.status === 'confirmed') {
      actions.push(
        <TouchableOpacity
          key="start"
          style={[styles.actionButton, styles.startButton]}
          onPress={() => handleStatusUpdate('in-progress')}
        >
          <Text style={styles.startButtonText}>🚀 Start Job</Text>
        </TouchableOpacity>
      );
    } else if (booking.status === 'in-progress') {
      actions.push(
        <TouchableOpacity
          key="complete"
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleStatusUpdate('completed')}
        >
          <Text style={styles.completeButtonText}>🎉 Mark Complete</Text>
        </TouchableOpacity>
      );
    }
    
    return actions;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Service Info */}
        <View style={styles.section}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceIcon}>{booking.serviceIcon || '🏠'}</Text>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>{booking.serviceTitle}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                <Text style={styles.statusIcon}>{getStatusIcon(booking.status)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Customer Information</Text>
          <View style={styles.customerCard}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{booking.customerName || 'Customer'}</Text>
              {booking.customerEmail && (
                <Text style={styles.customerDetail}>📧 {booking.customerEmail}</Text>
              )}
              {booking.customerPhone && (
                <Text style={styles.customerDetail}>📞 {booking.customerPhone}</Text>
              )}
            </View>
            <View style={styles.customerActions}>
              <TouchableOpacity style={styles.customerActionButton} onPress={handleCallCustomer}>
                <Text style={styles.customerActionIcon}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.customerActionButton} onPress={handleMessageCustomer}>
                <Text style={styles.customerActionIcon}>💬</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Schedule Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Schedule</Text>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleIcon}>📅</Text>
              <View>
                <Text style={styles.scheduleLabel}>Date</Text>
                <Text style={styles.scheduleValue}>
                  {new Date(booking.scheduledDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <View style={styles.scheduleRow}>
              <Text style={styles.scheduleIcon}>⏰</Text>
              <View>
                <Text style={styles.scheduleLabel}>Time</Text>
                <Text style={styles.scheduleValue}>{booking.scheduledTime || 'TBD'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>{booking.location || booking.address}</Text>
            </View>
            <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
              <Text style={styles.directionsButtonText}>🧭 Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Details */}
        {booking.serviceDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Service Details</Text>
            <View style={styles.detailsCard}>
              <Text style={styles.serviceDescription}>{booking.serviceDescription}</Text>
            </View>
          </View>
        )}

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Special Instructions</Text>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsText}>{booking.specialInstructions}</Text>
            </View>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Pricing</Text>
          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Service Cost</Text>
              <Text style={styles.pricingValue}>${booking.serviceCost || booking.totalCost}</Text>
            </View>
            {booking.platformFee && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Platform Fee</Text>
                <Text style={styles.pricingValue}>-${booking.platformFee}</Text>
              </View>
            )}
            <View style={[styles.pricingRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Your Earnings</Text>
              <Text style={styles.totalValue}>
                ${booking.providerEarnings || (booking.totalCost - (booking.platformFee || 0))}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Actions */}
        {renderStatusActions().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Actions</Text>
            <View style={styles.actionsContainer}>
              {renderStatusActions()}
            </View>
          </View>
        )}

        {/* Booking Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Booking Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Booking ID: #{booking.id}</Text>
            <Text style={styles.infoText}>
              Created: {new Date(booking.createdAt || Date.now()).toLocaleString()}
            </Text>
            {booking.updatedAt && (
              <Text style={styles.infoText}>
                Updated: {new Date(booking.updatedAt).toLocaleString()}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Mock data for fallback
const mockBookingDetail = {
  id: '1',
  serviceTitle: 'House Cleaning',
  serviceIcon: '🧹',
  serviceDescription: 'Deep cleaning of 3-bedroom apartment including kitchen and bathrooms',
  customerName: 'Sarah Johnson',
  customerEmail: 'sarah.johnson@email.com',
  customerPhone: '+1-555-123-4567',
  status: 'confirmed',
  scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  scheduledTime: '10:00 AM - 2:00 PM',
  location: '123 Main St, Apt 4B, New York, NY 10001',
  totalCost: 120,
  serviceCost: 120,
  platformFee: 12,
  providerEarnings: 108,
  specialInstructions: 'Please use eco-friendly cleaning products. Keys will be left under the mat.',
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 60,
  },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONTS.md,
    color: COLORS.error,
  },

  // Content
  scrollContent: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Service Header
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 48,
    marginRight: SPACING.lg,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    fontSize: FONTS.sm,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightSemiBold,
  },

  // Customer Info
  customerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  customerDetail: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  customerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  customerActionButton: {
    backgroundColor: COLORS.primary + '20',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  customerActionIcon: {
    fontSize: FONTS.lg,
  },

  // Schedule
  scheduleCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scheduleIcon: {
    fontSize: FONTS.lg,
    marginRight: SPACING.md,
    width: 30,
  },
  scheduleLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  scheduleValue: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
  },

  // Location
  locationCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  locationInfo: {
    marginBottom: SPACING.md,
  },
  locationText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  directionsButton: {
    backgroundColor: COLORS.primary + '20',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  directionsButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },

  // Details
  detailsCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  serviceDescription: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  // Instructions
  instructionsCard: {
    backgroundColor: COLORS.warning + '10',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  instructionsText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  // Pricing
  pricingCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pricingLabel: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  pricingValue: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },

  // Actions
  actionsContainer: {
    gap: SPACING.sm,
  },
  actionButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.success + '20',
  },
  confirmButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.success,
  },
  declineButton: {
    backgroundColor: COLORS.error + '20',
  },
  declineButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.error,
  },
  startButton: {
    backgroundColor: COLORS.primary + '20',
  },
  startButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  completeButton: {
    backgroundColor: COLORS.success + '20',
  },
  completeButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.success,
  },

  // Info
  infoCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  infoText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
});

export default ProviderBookingDetailsScreen;
