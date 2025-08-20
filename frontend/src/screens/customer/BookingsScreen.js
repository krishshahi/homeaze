import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserBookings, updateBooking, cancelBooking } from '../../store/slices/bookingSlice';
import { 
  formatBookingForDisplay,
  getStatusColor,
  getStatusText,
  normalizeBookingStatus,
  cancelBookingWithConfirmation,
  canCancelBooking,
  canRescheduleBooking,
  canReviewBooking
} from '../../utils/bookingHelpers';

const BookingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled'
  const [refreshing, setRefreshing] = useState(false);

  // Get data from Redux store
  const { bookings, loading, error } = useSelector((state) => state.booking);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Normalize booking data for consistent display using helper
  const normalizeBooking = (booking) => {
    const formatted = formatBookingForDisplay(booking);
    
    // Extract location string from booking data
    let locationText = '';
    if (formatted.location) {
      if (typeof formatted.location === 'string') {
        locationText = formatted.location;
      } else if (formatted.location.address) {
        // Handle object location format from our booking creation
        if (typeof formatted.location.address === 'string') {
          locationText = formatted.location.address;
        } else if (formatted.location.address.street) {
          // Build address string from components
          const addr = formatted.location.address;
          locationText = [addr.street, addr.city, addr.state]
            .filter(Boolean)
            .join(', ');
        }
      }
    }
    
    return {
      ...formatted,
      service: formatted.serviceTitle,
      provider: formatted.providerName,
      date: formatted.scheduledDate ? new Date(formatted.scheduledDate).toLocaleDateString() : 'Date TBD',
      time: formatted.scheduledDate ? new Date(formatted.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBD',
      status: formatted.normalizedStatus,
      originalStatus: formatted.status,
      price: formatted.totalCost ? `$${formatted.totalCost}` : 'Price TBD',
      image: formatted.serviceIcon,
      location: locationText,
    };
  };

  // Filter bookings by selected tab
  const filteredBookings = bookings
    .map(normalizeBooking)
    .filter(booking => booking.status === selectedTab);

  // Use helper functions for status handling
  const getBookingStatusColor = (status) => {
    // Map normalized status to original status for color
    const statusMap = {
      'upcoming': 'pending',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    return getStatusColor(statusMap[status] || status);
  };

  const getBookingStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      console.log('📅 Fetching user bookings...');
      dispatch(fetchUserBookings());
    }
  }, [dispatch, isAuthenticated]);

  const onRefresh = async () => {
    if (!isAuthenticated) return;
    
    setRefreshing(true);
    try {
      await dispatch(fetchUserBookings()).unwrap();
    } catch (error) {
      console.error('Error refreshing bookings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBookingAction = async (booking, action) => {
    try {
      switch (action) {
        case 'cancel':
          // Use the booking helper for cancellation
          if (canCancelBooking({ status: booking.originalStatus, scheduledDate: booking.date })) {
            await cancelBookingWithConfirmation(
              booking.id,
              'Cancelled by customer',
              { showNotification: true }
            );
          } else {
            Alert.alert(
              'Cannot Cancel',
              'This booking cannot be cancelled. It may be too close to the scheduled time or already in progress.'
            );
          }
          break;
          
        case 'reschedule':
          if (canRescheduleBooking({ status: booking.originalStatus, scheduledDate: booking.date })) {
            Alert.alert('Reschedule', 'Rescheduling feature coming soon!');
          } else {
            Alert.alert(
              'Cannot Reschedule',
              'This booking cannot be rescheduled. It may be too close to the scheduled time.'
            );
          }
          break;
          
        case 'review':
          if (canReviewBooking({ status: booking.originalStatus, hasReview: booking.hasReview })) {
            navigation.navigate('Reviews', { bookingId: booking.id });
          } else {
            Alert.alert('Cannot Review', 'This booking cannot be reviewed yet.');
          }
          break;
          
        default:
          // Navigate to booking details
          navigation.navigate('BookingDetails', { booking });
      }
    } catch (error) {
      console.error('Booking action error:', error);
    }
  };

  const renderBookingCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => handleBookingAction(item, 'details')}
    >
      <View style={styles.bookingContent}>
        <View style={styles.bookingImage}>
          <Text style={styles.bookingEmoji}>{item.image}</Text>
        </View>
        
        <View style={styles.bookingDetails}>
          <Text style={styles.serviceName}>{item.service}</Text>
          <Text style={styles.providerName}>{item.provider}</Text>
          {item.location ? (
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          ) : null}
          
          <View style={styles.bookingMeta}>
            <View style={styles.dateTime}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.dateText}>{item.date}</Text>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            
            <View style={styles.bookingFooter}>
              <Text style={[styles.status, { color: getBookingStatusColor(item.status) }]}>
                {getBookingStatusText(item.status)}
              </Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Action buttons for different booking states */}
      {item.status === 'upcoming' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleBookingAction(item, 'cancel')}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rescheduleButton]}
            onPress={() => handleBookingAction(item, 'reschedule')}
          >
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {item.status === 'completed' && !item.hasReview && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.reviewButton]}
            onPress={() => handleBookingAction(item, 'review')}
          >
            <Ionicons name="star-outline" size={16} color="#F59E0B" />
            <Text style={styles.reviewButtonText}>Leave Review</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No {selectedTab} bookings</Text>
      <Text style={styles.emptySubtitle}>
        {selectedTab === 'upcoming' 
          ? 'Book a service to see your upcoming appointments'
          : `You don't have any ${selectedTab} bookings yet`
        }
      </Text>
      {selectedTab === 'upcoming' && (
        <TouchableOpacity 
          style={styles.bookServiceButton}
          onPress={() => navigation.navigate('Services')}
        >
          <Text style={styles.bookServiceText}>Book Service</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Bookings</Text>
            <Text style={styles.headerSubtitle}>Manage your service appointments</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['upcoming', 'completed', 'cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && styles.activeTab
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            <View style={styles.bookingCount}>
              <Text style={[
                styles.countText,
                selectedTab === tab && styles.activeCountText
              ]}>
                {bookings.map(normalizeBooking).filter(b => b.status === tab).length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        ) : filteredBookings.length > 0 ? (
          <FlatList
            data={filteredBookings}
            renderItem={renderBookingCard}
            keyExtractor={(item) => item.id}
            style={styles.bookingsList}
            contentContainerStyle={styles.bookingsContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
                tintColor="#3B82F6"
              />
            }
          />
        ) : (
          renderEmptyState()
        )}
        
        {error && (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  headerSafeArea: {
    backgroundColor: '#3B82F6',
  },
  
  header: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  
  headerContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  activeTabText: {
    color: '#FFFFFF',
  },
  
  bookingCount: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  
  countText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 'bold',
  },
  
  activeCountText: {
    color: '#3B82F6',
  },
  
  content: {
    flex: 1,
  },
  
  bookingsList: {
    flex: 1,
    paddingTop: 16,
  },
  
  bookingsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  bookingContent: {
    flexDirection: 'row',
    gap: 12,
  },
  
  bookingImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  bookingEmoji: {
    fontSize: 24,
  },
  
  bookingDetails: {
    flex: 1,
  },
  
  serviceName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  providerName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  
  bookingMeta: {
    gap: 8,
  },
  
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  price: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  emptyTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  
  bookServiceButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  bookServiceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Action buttons styles
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  
  rescheduleButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  
  rescheduleButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  
  reviewButton: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  
  reviewButtonText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Loading and error states
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  
  errorState: {
    padding: 20,
    alignItems: 'center',
  },
  
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
});

export default BookingsScreen;
