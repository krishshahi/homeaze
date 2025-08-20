import { Alert } from 'react-native';
import { store } from '../store';
import { updateBooking, cancelBooking, createNewBooking } from '../store/slices/bookingSlice';
import { addNotification } from '../store/slices/appSlice';

/**
 * Booking status constants
 */
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

/**
 * Get human-readable status text
 */
export const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case BOOKING_STATUSES.PENDING:
      return 'Pending';
    case BOOKING_STATUSES.CONFIRMED:
      return 'Confirmed';
    case BOOKING_STATUSES.IN_PROGRESS:
      return 'In Progress';
    case BOOKING_STATUSES.COMPLETED:
      return 'Completed';
    case BOOKING_STATUSES.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

/**
 * Get status color for UI
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case BOOKING_STATUSES.PENDING:
      return '#F59E0B'; // yellow
    case BOOKING_STATUSES.CONFIRMED:
      return '#3B82F6'; // blue
    case BOOKING_STATUSES.IN_PROGRESS:
      return '#8B5CF6'; // purple
    case BOOKING_STATUSES.COMPLETED:
      return '#10B981'; // green
    case BOOKING_STATUSES.CANCELLED:
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
};

/**
 * Normalize booking status for filtering
 */
export const normalizeBookingStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'confirmed':
    case 'in-progress':
      return 'upcoming';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'upcoming';
  }
};

/**
 * Format booking for display
 */
export const formatBookingForDisplay = (booking) => {
  if (!booking) return null;
  
  return {
    id: booking.id || booking._id,
    serviceTitle: booking.serviceTitle || booking.service?.title || booking.service?.name || 'Service',
    providerName: booking.providerName || booking.provider?.name || booking.provider?.businessName || 'Provider',
    customerName: booking.customerName || booking.customer?.name || 'Customer',
    status: booking.status || 'pending',
    normalizedStatus: normalizeBookingStatus(booking.status),
    scheduledDate: booking.scheduledDate,
    totalCost: booking.totalCost || booking.price || 0,
    location: booking.location || booking.address || '',
    notes: booking.notes || '',
    serviceIcon: booking.serviceIcon || booking.service?.icon || '🏠',
    hasReview: booking.hasReview || false,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData, options = {}) => {
  try {
    console.log('📝 Creating new booking...', bookingData);

    const result = await store.dispatch(createNewBooking(bookingData)).unwrap();

    // Show success notification
    if (options.showNotification !== false) {
      store.dispatch(addNotification({
        title: 'Booking Created',
        message: `Your booking for ${bookingData.serviceTitle || 'the service'} has been created`,
        type: 'success'
      }));
    }

    console.log('✅ Booking created successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    
    if (options.showNotification !== false) {
      store.dispatch(addNotification({
        title: 'Booking Failed',
        message: error.message || 'Failed to create booking',
        type: 'error'
      }));
    }
    
    throw error;
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, newStatus, options = {}) => {
  try {
    console.log('🔄 Updating booking status...', { bookingId, newStatus });

    const result = await store.dispatch(updateBooking({ 
      bookingId, 
      status: newStatus 
    })).unwrap();

    // Show success notification
    if (options.showNotification !== false) {
      store.dispatch(addNotification({
        title: 'Booking Updated',
        message: `Booking status changed to ${getStatusText(newStatus)}`,
        type: 'success'
      }));
    }

    console.log('✅ Booking status updated successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    
    if (options.showNotification !== false) {
      store.dispatch(addNotification({
        title: 'Update Failed',
        message: error.message || 'Failed to update booking',
        type: 'error'
      }));
    }
    
    throw error;
  }
};

/**
 * Cancel booking with confirmation
 */
export const cancelBookingWithConfirmation = (bookingId, reason = 'Cancelled by user', options = {}) => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      'Cancel Booking',
      options.confirmMessage || 'Are you sure you want to cancel this booking?',
      [
        { 
          text: 'No', 
          style: 'cancel',
          onPress: () => resolve(false)
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('❌ Cancelling booking...', { bookingId, reason });

              const result = await store.dispatch(cancelBooking({ 
                bookingId, 
                reason 
              })).unwrap();

              // Show success notification
              if (options.showNotification !== false) {
                store.dispatch(addNotification({
                  title: 'Booking Cancelled',
                  message: 'Your booking has been cancelled successfully',
                  type: 'info'
                }));
              }

              console.log('✅ Booking cancelled successfully:', result);
              resolve(result);

            } catch (error) {
              console.error('❌ Error cancelling booking:', error);
              
              if (options.showNotification !== false) {
                store.dispatch(addNotification({
                  title: 'Cancellation Failed',
                  message: error.message || 'Failed to cancel booking',
                  type: 'error'
                }));
              }
              
              reject(error);
            }
          }
        }
      ]
    );
  });
};

/**
 * Get bookings by status
 */
export const getBookingsByStatus = (status) => {
  const state = store.getState();
  const bookings = state.booking.bookings || [];
  
  if (status === 'upcoming') {
    return bookings.filter(booking => 
      ['pending', 'confirmed', 'in-progress'].includes(booking.status?.toLowerCase())
    );
  }
  
  return bookings.filter(booking => 
    booking.status?.toLowerCase() === status.toLowerCase()
  );
};

/**
 * Get upcoming bookings
 */
export const getUpcomingBookings = () => {
  return getBookingsByStatus('upcoming');
};

/**
 * Get completed bookings
 */
export const getCompletedBookings = () => {
  return getBookingsByStatus('completed');
};

/**
 * Get cancelled bookings
 */
export const getCancelledBookings = () => {
  return getBookingsByStatus('cancelled');
};

/**
 * Check if booking can be cancelled
 */
export const canCancelBooking = (booking) => {
  const status = booking.status?.toLowerCase();
  const scheduledDate = new Date(booking.scheduledDate);
  const now = new Date();
  const hoursDifference = (scheduledDate - now) / (1000 * 60 * 60);
  
  // Can cancel if booking is pending/confirmed and more than 2 hours away
  return (status === 'pending' || status === 'confirmed') && hoursDifference > 2;
};

/**
 * Check if booking can be rescheduled
 */
export const canRescheduleBooking = (booking) => {
  const status = booking.status?.toLowerCase();
  const scheduledDate = new Date(booking.scheduledDate);
  const now = new Date();
  const hoursDifference = (scheduledDate - now) / (1000 * 60 * 60);
  
  // Can reschedule if booking is pending/confirmed and more than 24 hours away
  return (status === 'pending' || status === 'confirmed') && hoursDifference > 24;
};

/**
 * Check if booking can be reviewed
 */
export const canReviewBooking = (booking) => {
  const status = booking.status?.toLowerCase();
  return status === 'completed' && !booking.hasReview;
};

/**
 * Get booking statistics
 */
export const getBookingStats = () => {
  const state = store.getState();
  const bookings = state.booking.bookings || [];
  
  return {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    inProgress: bookings.filter(b => b.status === 'in-progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    upcoming: bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status)).length
  };
};

export default {
  BOOKING_STATUSES,
  getStatusText,
  getStatusColor,
  normalizeBookingStatus,
  formatBookingForDisplay,
  createBooking,
  updateBookingStatus,
  cancelBookingWithConfirmation,
  getBookingsByStatus,
  getUpcomingBookings,
  getCompletedBookings,
  getCancelledBookings,
  canCancelBooking,
  canRescheduleBooking,
  canReviewBooking,
  getBookingStats
};
