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
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppDispatch, useAuth } from '../store/hooks';
import BookingsAPI from '../services/bookingsApi';

const ProviderBookingsScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProviderBookings();
  }, []);

  const loadProviderBookings = async () => {
    try {
      console.log('📅 Loading provider bookings...');
      setLoading(true);
      
      const response = await BookingsAPI.getProviderBookings();
      console.log('✅ Provider bookings loaded:', response);
      
      const bookingsList = Array.isArray(response) ? response : response.bookings || [];
      setBookings(bookingsList);
      
    } catch (error) {
      console.error('❌ Error loading provider bookings:', error);
      // Use mock data as fallback
      setBookings(mockProviderBookings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProviderBookings();
  };

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      console.log('🔄 Updating booking status:', { bookingId, newStatus });
      
      await BookingsAPI.updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus, updatedAt: new Date().toISOString() }
            : booking
        )
      );
      
      Alert.alert('Success', `Booking has been ${newStatus}`);
      
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const tabs = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { key: 'in-progress', label: 'In Progress', count: bookings.filter(b => b.status === 'in-progress').length },
    { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
  ];

  const filteredBookings = bookings.filter(booking => {
    if (selectedTab === 'all') return true;
    return booking.status === selectedTab;
  });

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

  const renderBookingActions = (booking) => {
    const actions = [];
    
    if (booking.status === 'pending') {
      actions.push(
        <TouchableOpacity
          key="confirm"
          style={[styles.actionButton, styles.confirmButton]}
          onPress={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
        >
          <Text style={styles.confirmButtonText}>Accept</Text>
        </TouchableOpacity>
      );
      actions.push(
        <TouchableOpacity
          key="decline"
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleBookingStatusUpdate(booking.id, 'cancelled')}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      );
    } else if (booking.status === 'confirmed') {
      actions.push(
        <TouchableOpacity
          key="start"
          style={[styles.actionButton, styles.startButton]}
          onPress={() => handleBookingStatusUpdate(booking.id, 'in-progress')}
        >
          <Text style={styles.startButtonText}>Start Job</Text>
        </TouchableOpacity>
      );
    } else if (booking.status === 'in-progress') {
      actions.push(
        <TouchableOpacity
          key="complete"
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleBookingStatusUpdate(booking.id, 'completed')}
        >
          <Text style={styles.completeButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      );
    }
    
    return actions;
  };

  const renderBookingCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => navigation.navigate('ProviderBookingDetails', { bookingId: item.id })}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingService}>
          <Text style={styles.bookingServiceIcon}>{item.serviceIcon || '🏠'}</Text>
          <View style={styles.bookingServiceInfo}>
            <Text style={styles.bookingServiceTitle}>{item.serviceTitle}</Text>
            <Text style={styles.customerName}>👤 {item.customerName || 'Customer'}</Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.bookingDetailRow}>
          <Text style={styles.bookingDetailIcon}>📅</Text>
          <Text style={styles.bookingDetailText}>
            {new Date(item.scheduledDate).toLocaleDateString()} at {item.scheduledTime || 'TBD'}
          </Text>
        </View>
        
        <View style={styles.bookingDetailRow}>
          <Text style={styles.bookingDetailIcon}>📍</Text>
          <Text style={styles.bookingDetailText} numberOfLines={1}>
            {item.location || item.address}
          </Text>
        </View>
        
        <View style={styles.bookingDetailRow}>
          <Text style={styles.bookingDetailIcon}>💰</Text>
          <Text style={styles.bookingEarning}>${item.totalCost}</Text>
        </View>
      </View>

      {renderBookingActions(item).length > 0 && (
        <View style={styles.bookingActions}>
          {renderBookingActions(item)}
        </View>
      )}
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>No bookings found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {selectedTab === 'all' 
          ? 'New bookings will appear here when customers book your services.' 
          : `No ${selectedTab} bookings at the moment.`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.selectedTab,
              ]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.selectedTabText,
                ]}
              >
                {tab.label}
              </Text>
              <View style={[
                styles.tabBadge,
                selectedTab === tab.key && styles.selectedTabBadge,
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  selectedTab === tab.key && styles.selectedTabBadgeText,
                ]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bookingsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <EmptyState />
      )}
    </SafeAreaView>
  );
};

// Mock data for fallback
const mockProviderBookings = [
  {
    id: '1',
    serviceTitle: 'House Cleaning',
    serviceIcon: '🧹',
    customerName: 'Sarah Johnson',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    scheduledTime: '10:00 AM',
    totalCost: 120,
    location: '123 Main St, New York, NY',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    serviceTitle: 'Plumbing Repair',
    serviceIcon: '🔧',
    customerName: 'Mike Chen',
    status: 'confirmed',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledTime: '2:00 PM',
    totalCost: 85,
    location: '456 Oak Ave, Brooklyn, NY',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    serviceTitle: 'Garden Maintenance',
    serviceIcon: '🌱',
    customerName: 'Emily Davis',
    status: 'in-progress',
    scheduledDate: new Date().toISOString(),
    scheduledTime: '9:00 AM',
    totalCost: 75,
    location: '789 Pine St, Manhattan, NY',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  refreshButton: {
    padding: SPACING.sm,
  },
  refreshIcon: {
    fontSize: FONTS.lg,
  },
  
  // Tabs
  tabsContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  selectedTab: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  selectedTabText: {
    color: COLORS.primary,
  },
  tabBadge: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  selectedTabBadge: {
    backgroundColor: COLORS.primary,
  },
  tabBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    color: COLORS.textSecondary,
  },
  selectedTabBadgeText: {
    color: COLORS.white,
  },
  
  // Bookings List
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  bookingsList: {
    padding: SPACING.lg,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  
  // Booking Header
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  bookingService: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingServiceIcon: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  bookingServiceInfo: {
    flex: 1,
  },
  bookingServiceTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  customerName: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  statusIcon: {
    fontSize: FONTS.sm,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightSemiBold,
    textTransform: 'capitalize',
  },
  
  // Booking Details
  bookingDetails: {
    marginBottom: SPACING.md,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  bookingDetailIcon: {
    fontSize: FONTS.md,
    marginRight: SPACING.sm,
    width: 20,
  },
  bookingDetailText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  bookingEarning: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  
  // Booking Actions
  bookingActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.success + '20',
  },
  confirmButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.success,
  },
  declineButton: {
    backgroundColor: COLORS.error + '20',
  },
  declineButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.error,
  },
  startButton: {
    backgroundColor: COLORS.primary + '20',
  },
  startButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  completeButton: {
    backgroundColor: COLORS.success + '20',
  },
  completeButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.success,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default ProviderBookingsScreen;
