import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const BookingConfirmationScreen = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const { bookingId } = route.params || {};
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      
      // Mock booking data
      const mockBooking = {
        id: bookingId || 'BK001',
        confirmationNumber: 'HZ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        serviceName: 'Professional House Cleaning',
        providerName: 'Sarah Johnson',
        providerPhone: '+1 (555) 123-4567',
        providerEmail: 'sarah.johnson@example.com',
        date: '2024-01-20T10:00:00Z',
        duration: '2 hours',
        location: {
          address: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
        },
        totalAmount: 75.00,
        serviceDetails: [
          'Deep cleaning of all rooms',
          'Kitchen and bathroom sanitization',
          'Vacuum and mop all floors',
          'Dust all surfaces and furniture',
        ],
        status: 'confirmed',
        estimatedArrival: '2024-01-20T09:45:00Z',
        specialInstructions: 'Please use eco-friendly cleaning products. Key is under the doormat.',
      };

      setBooking(mockBooking);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error loading booking details:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleContactProvider = () => {
    Alert.alert(
      'Contact Provider',
      'How would you like to contact your service provider?',
      [
        {
          text: 'Call',
          onPress: () => {
            // In real app, would initiate phone call
            Alert.alert('Calling', `Calling ${booking.providerName}...`);
          },
        },
        {
          text: 'Message',
          onPress: () => {
            navigation.navigate('Chat', {
              providerId: booking.providerId,
              providerName: booking.providerName,
              bookingId: booking.id,
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleViewBooking = () => {
    navigation.navigate('BookingsMain');
  };

  const handleRescheduleBooking = () => {
    Alert.alert(
      'Reschedule Booking',
      'This will allow you to change the date and time of your booking.',
      [
        {
          text: 'Continue',
          onPress: () => {
            // In real app, would navigate to reschedule screen
            Alert.alert('Info', 'Reschedule functionality will be implemented here.');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // In real app, would cancel the booking
            Alert.alert('Cancelled', 'Your booking has been cancelled.');
            navigation.navigate('BookingsMain');
          },
        },
        { text: 'Keep Booking', style: 'cancel' },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
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
          style={styles.closeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Confirmed</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Success Message */}
        <View style={styles.successSection}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your service has been successfully booked
          </Text>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmationLabel}>Confirmation Number</Text>
            <Text style={styles.confirmationNumber}>{booking.confirmationNumber}</Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Booking Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service</Text>
            <Text style={styles.detailValue}>{booking.serviceName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(booking.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{formatTime(booking.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{booking.duration}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>
              {booking.location.address}, {booking.location.city}, {booking.location.state} {booking.location.zipCode}
            </Text>
          </View>
        </View>

        {/* Provider Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍🔧 Your Service Provider</Text>
          
          <View style={styles.providerCard}>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{booking.providerName}</Text>
              <Text style={styles.providerContact}>{booking.providerPhone}</Text>
              <Text style={styles.providerEmail}>{booking.providerEmail}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleContactProvider}
            >
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.arrivalInfo}>
            <Text style={styles.arrivalLabel}>Estimated Arrival</Text>
            <Text style={styles.arrivalTime}>{formatTime(booking.estimatedArrival)}</Text>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ What's Included</Text>
          
          {booking.serviceDetails.map((detail, index) => (
            <View key={index} style={styles.serviceDetailItem}>
              <Text style={styles.serviceDetailIcon}>✓</Text>
              <Text style={styles.serviceDetailText}>{detail}</Text>
            </View>
          ))}
        </View>

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Special Instructions</Text>
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsText}>{booking.specialInstructions}</Text>
            </View>
          </View>
        )}

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Payment Summary</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Service Total</Text>
            <Text style={styles.paymentValue}>${booking.totalAmount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Service Fee</Text>
            <Text style={styles.paymentValue}>$3.99</Text>
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tax</Text>
            <Text style={styles.paymentValue}>${(booking.totalAmount * 0.08).toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabelTotal}>Total Paid</Text>
            <Text style={styles.paymentValueTotal}>
              ${(booking.totalAmount + 3.99 + (booking.totalAmount * 0.08)).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleViewBooking}
          >
            <Text style={styles.primaryButtonText}>View My Bookings</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleRescheduleBooking}
            >
              <Text style={styles.secondaryButtonText}>Reschedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.secondaryButton, styles.cancelButton]}
              onPress={handleCancelBooking}
            >
              <Text style={[styles.secondaryButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 What's Next?</Text>
          
          <View style={styles.nextStepItem}>
            <Text style={styles.nextStepIcon}>📅</Text>
            <Text style={styles.nextStepText}>
              You'll receive a reminder 24 hours before your appointment
            </Text>
          </View>
          
          <View style={styles.nextStepItem}>
            <Text style={styles.nextStepIcon}>💬</Text>
            <Text style={styles.nextStepText}>
              Your provider will contact you if there are any changes
            </Text>
          </View>
          
          <View style={styles.nextStepItem}>
            <Text style={styles.nextStepIcon}>⭐</Text>
            <Text style={styles.nextStepText}>
              Don't forget to rate and review after the service
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  closeButton: {
    padding: SPACING.sm,
  },
  closeButtonText: {
    fontSize: FONTS.lg,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },

  // Content
  scrollContent: {
    flex: 1,
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
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONTS.lg,
    color: COLORS.error,
    marginBottom: SPACING.lg,
  },
  errorButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  errorButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },

  // Success Section
  successSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  confirmationBox: {
    backgroundColor: COLORS.success + '10',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  confirmationLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  confirmationNumber: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.success,
  },

  // Sections
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
    marginBottom: SPACING.lg,
  },

  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  detailLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weightMedium,
    flex: 2,
    textAlign: 'right',
  },

  // Provider Card
  providerCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  providerContact: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  providerEmail: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  contactButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },

  // Arrival Info
  arrivalInfo: {
    backgroundColor: COLORS.warning + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrivalLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  arrivalTime: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.warning,
  },

  // Service Details
  serviceDetailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  serviceDetailIcon: {
    fontSize: FONTS.md,
    color: COLORS.success,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  serviceDetailText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 20,
  },

  // Instructions
  instructionsBox: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  instructionsText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  // Payment
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  paymentLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  paymentValue: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
  },
  paymentLabelTotal: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  paymentValueTotal: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },

  // Actions
  actionsSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  primaryButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButton: {
    borderColor: COLORS.error + '40',
    backgroundColor: COLORS.error + '10',
  },
  secondaryButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  cancelButtonText: {
    color: COLORS.error,
  },

  // Next Steps
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  nextStepIcon: {
    fontSize: FONTS.md,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  nextStepText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
});

export default BookingConfirmationScreen;
