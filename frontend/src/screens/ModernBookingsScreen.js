import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import theme from '../constants/modernTheme';
import ModernButton from '../components/modern/ModernButton';
import ModernCard from '../components/modern/ModernCard';
import ModernInput from '../components/modern/ModernInput';
import { LoadingOverlay, ServiceCardSkeleton } from '../components/modern/LoadingStates';
import { SwipeToAction, FloatingActionButton } from '../components/modern/MicroInteractions';
import { fetchUserBookings, updateBookingStatus } from '../store/slices/bookingSlice';

const ModernBookingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector(state => state.booking);
  const { user } = useSelector(state => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'pending', label: 'Pending', icon: 'time' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
    { key: 'in-progress', label: 'In Progress', icon: 'refresh' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-done' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
  ];

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserBookings(user.id));
    }
  }, [dispatch, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await dispatch(fetchUserBookings(user.id));
    }
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId) => {
    dispatch(updateBookingStatus({ bookingId, status: 'cancelled' }));
  };

  const handleRescheduleBooking = (booking) => {
    navigation.navigate('BookingForm', { 
      booking, 
      mode: 'reschedule' 
    });
  };

  const filteredBookings = bookings?.filter(booking => {
    if (!booking) return false;
    
    const matchesFilter = selectedFilter === 'all' || booking.status === selectedFilter;
    const matchesSearch = !searchQuery || 
      booking.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }) || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return theme.colors.warning[500];
      case 'confirmed': return theme.colors.primary[500];
      case 'in-progress': return theme.colors.info[500];
      case 'completed': return theme.colors.success[500];
      case 'cancelled': return theme.colors.error[500];
      default: return theme.colors.neutral[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time';
      case 'confirmed': return 'checkmark-circle';
      case 'in-progress': return 'refresh';
      case 'completed': return 'checkmark-done';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderBookingCard = (booking) => {
    const swipeActions = [];

    if (booking.status === 'pending' || booking.status === 'confirmed') {
      swipeActions.push({
        icon: 'calendar',
        color: theme.colors.primary[500],
        onPress: () => handleRescheduleBooking(booking),
      });
      swipeActions.push({
        icon: 'close',
        color: theme.colors.error[500],
        onPress: () => handleCancelBooking(booking.id),
      });
    }

    return (
      <SwipeToAction
        key={booking.id}
        rightActions={swipeActions}
        actionThreshold={60}
      >
        <ModernCard style={styles.bookingCard} variant="elevated">
          <TouchableOpacity
            onPress={() => navigation.navigate('ServiceDetails', { serviceId: booking.service?.id })}
            style={styles.bookingContent}
          >
            {/* Header */}
            <View style={styles.bookingHeader}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{booking.service?.name}</Text>
                <Text style={styles.providerName}>{booking.provider?.name}</Text>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                <Ionicons 
                  name={getStatusIcon(booking.status)} 
                  size={14} 
                  color={getStatusColor(booking.status)} 
                />
                <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color={theme.colors.text.secondary} />
                <Text style={styles.detailText}>
                  {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
                <Text style={styles.detailText}>{booking.scheduledTime}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="cash" size={16} color={theme.colors.text.secondary} />
                <Text style={styles.detailText}>${booking.totalCost}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.bookingActions}>
              <ModernButton
                title="View Details"
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate('ServiceDetails', { serviceId: booking.service?.id })}
                style={styles.actionButton}
              />
              
              <ModernButton
                title="Chat"
                variant="ghost"
                size="sm"
                icon="chatbubble"
                onPress={() => navigation.navigate('Chat', { 
                  providerId: booking.provider?.id,
                  bookingId: booking.id 
                })}
                style={styles.actionButton}
              />
            </View>
          </TouchableOpacity>
        </ModernCard>
      </SwipeToAction>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={theme.colors.text.tertiary} />
      <Text style={styles.emptyTitle}>No bookings found</Text>
      <Text style={styles.emptyMessage}>
        {selectedFilter === 'all' 
          ? "You haven't made any bookings yet. Explore our services to get started!"
          : `No ${selectedFilter} bookings found. Try a different filter.`
        }
      </Text>
      
      {selectedFilter === 'all' && (
        <ModernButton
          title="Browse Services"
          onPress={() => navigation.navigate('Services')}
          style={styles.browseButton}
        />
      )}
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {filterOptions.map((option) => (
        <TouchableOpacity
          key={option.key}
          onPress={() => setSelectedFilter(option.key)}
          style={[
            styles.filterChip,
            selectedFilter === option.key && styles.filterChipActive,
          ]}
        >
          <Ionicons
            name={option.icon}
            size={16}
            color={selectedFilter === option.key ? theme.colors.text.inverse : theme.colors.text.secondary}
          />
          <Text
            style={[
              styles.filterChipText,
              selectedFilter === option.key && styles.filterChipTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading && !refreshing && (!bookings || bookings.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Bookings</Text>
        </View>
        
        <View style={styles.content}>
          {renderFilterChips()}
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')}
            style={styles.headerButton}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <ModernInput
          placeholder="Search bookings..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          style={styles.searchInput}
        />
      </View>

      {/* Filter Chips */}
      {renderFilterChips()}

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map(renderBookingCard)
        ) : (
          renderEmptyState()
        )}
        
        {/* Spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => navigation.navigate('Services')}
        icon="add"
        style={styles.fab}
      />

      {/* Loading Overlay */}
      <LoadingOverlay visible={loading && !refreshing} message="Loading bookings..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },

  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.bold,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    padding: theme.spacing[2],
    marginLeft: theme.spacing[2],
  },

  searchContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },

  searchInput: {
    marginBottom: 0,
  },

  filterContainer: {
    paddingLeft: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },

  filterContent: {
    paddingRight: theme.spacing[4],
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.secondary,
    marginRight: theme.spacing[2],
  },

  filterChipActive: {
    backgroundColor: theme.colors.primary[500],
  },

  filterChipText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[1],
    fontWeight: theme.typography.weight.medium,
  },

  filterChipTextActive: {
    color: theme.colors.text.inverse,
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
  },

  bookingCard: {
    marginBottom: theme.spacing[4],
  },

  bookingContent: {
    padding: theme.spacing[4],
  },

  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },

  serviceInfo: {
    flex: 1,
    marginRight: theme.spacing[3],
  },

  serviceName: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semiBold,
    marginBottom: theme.spacing[1],
  },

  providerName: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },

  statusText: {
    ...theme.typography.styles.caption,
    fontWeight: theme.typography.weight.medium,
    marginLeft: theme.spacing[1],
  },

  bookingDetails: {
    marginBottom: theme.spacing[4],
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },

  detailText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[2],
  },

  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  actionButton: {
    marginLeft: theme.spacing[2],
    minWidth: 80,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[12],
    paddingHorizontal: theme.spacing[6],
  },

  emptyTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },

  emptyMessage: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.spacing[6],
    marginBottom: theme.spacing[6],
  },

  browseButton: {
    minWidth: 180,
  },

  fab: {
    position: 'absolute',
    bottom: theme.spacing[6],
    right: theme.spacing[6],
  },
});

export default ModernBookingsScreen;
