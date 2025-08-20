import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Platform } from 'react-native';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import BookingsAPI from '../services/bookingsApi';
import ServicesAPI from '../services/servicesApi';
import { useAppDispatch, useAuth, useDashboard } from '../store/hooks';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import Toast from 'react-native-toast-message';

const CustomerDashboardScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    recentBookings: [],
    popularServices: [],
    stats: {
      totalBookings: 0,
      activeBookings: 0,
      completedBookings: 0,
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pull dashboard data from Redux slice as the primary dynamic source
  const dashboard = useDashboard();

  useEffect(() => {
    // Kick off Redux-driven dashboard fetch first
    dispatch(fetchDashboardData())
      .unwrap()
      .catch(() => {
        // ignore error here; we'll still attempt local API fallback below
      })
      .finally(() => {
        // Also run local fallback to populate popular services/recent bookings if dashboard API is limited
        loadDashboardData();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('Loading customer dashboard data...');
      setLoading(true);
      
      // Load multiple API endpoints (fallbacks augment Redux data)
      const [bookingsResponse, servicesResponse] = await Promise.all([
        BookingsAPI.getCustomerBookings().catch(() => ({ bookings: [] })),
        ServicesAPI.getPopularServices().catch(() => ({ services: [] })),
      ]);

      const bookings = Array.isArray(bookingsResponse) ? bookingsResponse : bookingsResponse.bookings || [];
      const services = Array.isArray(servicesResponse) ? servicesResponse : servicesResponse.services || [];

      // Prefer Redux dashboard stats when available; compute lightweight stats as fallback/augment
      const computedStats = {
        totalBookings: bookings.length,
        activeBookings: bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status)).length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
      };

      const stats = {
        totalBookings: dashboard?.stats?.totalBookings ?? computedStats.totalBookings,
        activeBookings: dashboard?.stats?.activeBookings ?? computedStats.activeBookings,
        completedBookings: dashboard?.stats?.completedServices ?? computedStats.completedBookings,
      };

      setDashboardData({
        recentBookings: (dashboard?.recentBookings && dashboard.recentBookings.length > 0)
          ? dashboard.recentBookings.slice(0, 3)
          : bookings.slice(0, 3),
        popularServices: services.slice(0, 4),
        stats,
      });

      console.log('✅ Dashboard data loaded successfully');
      Toast.show({ type: 'success', text1: 'Dashboard updated' });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Toast.show({ type: 'error', text1: 'Failed to refresh dashboard' });
      
      // Fallback to any Redux dashboard data if present; otherwise empty
      setDashboardData({
        recentBookings: (dashboard?.recentBookings || []).slice(0, 3),
        popularServices: [],
        stats: {
          totalBookings: dashboard?.stats?.totalBookings || 0,
          activeBookings: dashboard?.stats?.activeBookings || 0,
          completedBookings: dashboard?.stats?.completedServices || 0,
        },
      });
      // Optional: show success toast
      if (Platform.OS === 'android') {
        // Lightweight success feedback without extra deps
        console.log('Customer dashboard refreshed successfully');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
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

  const getStatusIconName = (status) => {
    switch (status) {
      case 'pending': return 'timer-sand';
      case 'confirmed': return 'check-circle-outline';
      case 'in-progress': return 'progress-clock';
      case 'completed': return 'check-decagram';
      case 'cancelled': return 'close-circle-outline';
      default: return 'clipboard-text-outline';
    }
  };

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{dashboardData.stats.totalBookings}</Text>
        <Text style={styles.statLabel}>Total Bookings</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{dashboardData.stats.activeBookings}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{dashboardData.stats.completedBookings}</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}><MaterialCommunityIcons name="rocket-launch-outline" /> Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Services')}
        >
          <MaterialCommunityIcons name="magnify" size={32} style={{ marginBottom: SPACING.sm }} />
          <Text style={styles.quickActionText}>Browse Services</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Bookings')}
        >
          <MaterialCommunityIcons name="calendar-outline" size={32} style={{ marginBottom: SPACING.sm }} />
          <Text style={styles.quickActionText}>My Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Providers')}
        >
          <MaterialCommunityIcons name="account-group-outline" size={32} style={{ marginBottom: SPACING.sm }} />
          <Text style={styles.quickActionText}>Find Providers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <MaterialCommunityIcons name="cog-outline" size={32} style={{ marginBottom: SPACING.sm }} />
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentBookings = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}><MaterialCommunityIcons name="clipboard-text-outline" /> Recent Bookings</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
          <Text style={styles.sectionAction}>View All</Text>
        </TouchableOpacity>
      </View>

      {dashboardData.recentBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={48} style={styles.emptyStateIcon} />
          <Text style={styles.emptyStateTitle}>No bookings yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Start by browsing our available services
          </Text>
          <TouchableOpacity 
            style={styles.browseServicesButton}
            onPress={() => navigation.navigate('Services')}
          >
            <Text style={styles.browseServicesButtonText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bookingsContainer}>
          {dashboardData.recentBookings.map((booking) => (
            <TouchableOpacity 
              key={booking.id} 
              style={styles.bookingCard}
              onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.bookingService}>
                  <Text style={styles.bookingServiceIcon}>{booking.serviceIcon || '🏠'}</Text>
                  <View style={styles.bookingServiceInfo}>
                    <Text style={styles.bookingServiceTitle}>{booking.serviceTitle}</Text>
                    <Text style={styles.bookingProvider}>
                      by {booking.providerName || 'Provider'}
                    </Text>
                  </View>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                  <MaterialCommunityIcons name={getStatusIconName(booking.status)} size={FONTS.sm} style={{ marginRight: SPACING.xs }} />
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <Text style={styles.bookingDate}><MaterialCommunityIcons name="calendar-outline" /> {new Date(booking.scheduledDate).toLocaleDateString()}</Text>
                <Text style={styles.bookingPrice}><MaterialCommunityIcons name="cash" /> ${booking.totalCost}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderPopularServices = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}><MaterialCommunityIcons name="star-outline" /> Popular Services</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
          <Text style={styles.sectionAction}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dashboardData.popularServices}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.serviceCard}
            onPress={() => navigation.navigate('ServiceDetails', { serviceId: item.id })}
          >
            <MaterialCommunityIcons name={(item.icon && typeof item.icon === 'string' ? item.icon : 'home-outline')} size={40} style={{ marginBottom: SPACING.sm }} />
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceCategory}>{item.category}</Text>
              <View style={styles.serviceRating}>
                <Text style={styles.ratingText}><MaterialCommunityIcons name="star" /> {item.rating || '5.0'}</Text>
                <Text style={styles.servicePrice}>From ${item.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesContainer}
      />
    </View>
  );

  const renderUpcomingServices = () => {
    const upcoming = (dashboard?.upcomingServices || []).slice(0, 3);
    if (!upcoming.length) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}><MaterialCommunityIcons name="clock-outline" /> Upcoming Services</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
            <Text style={styles.sectionAction}>View All</Text>
          </TouchableOpacity>
        </View>
        {upcoming.map(item => (
          <View key={item.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <View style={styles.bookingService}>
                <Text style={styles.bookingServiceIcon}>{item.serviceIcon || '🏠'}</Text>
                <View style={styles.bookingServiceInfo}>
                  <Text style={styles.bookingServiceTitle}>{item.serviceTitle}</Text>
                  <Text style={styles.bookingProvider}>with {item.providerName || 'Provider'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.bookingDetails}>
              <Text style={styles.bookingDate}><MaterialCommunityIcons name="calendar-outline" /> {new Date(item.scheduledDate).toLocaleDateString()} {item.scheduledTime ? `• ${item.scheduledTime}` : ''}</Text>
              {item.location ? <Text style={styles.bookingPrice}><MaterialCommunityIcons name="map-marker-outline" /> {item.location}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRecentActivity = () => {
    const activity = (dashboard?.recentActivity || []).slice(0, 5);
    if (!activity.length) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}><MaterialCommunityIcons name="history" /> Recent Activity</Text>
        </View>
        {activity.map(evt => (
          <View key={evt.id} style={[styles.bookingCard, { flexDirection: 'row', alignItems: 'center' }] }>
            <Text style={[styles.bookingServiceIcon, { marginRight: SPACING.md }]}>{evt.icon || '📋'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingServiceTitle}>{evt.title}</Text>
              <Text style={styles.bookingProvider}>{evt.description}</Text>
            </View>
            <Text style={styles.bookingDate}>{new Date(evt.timestamp).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerGreeting}>Hello, {user?.name || 'User'}! <MaterialCommunityIcons name="hand-wave" /></Text>
          <Text style={styles.headerSubtitle}>What can we help you with today?</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <MaterialCommunityIcons name="bell-outline" size={FONTS.lg} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Stats Cards */}
        {loading ? (
          <View style={[styles.section, { alignItems: 'center' }]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          renderStatsCard()
        )}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Recent Bookings */}
        {loading ? (
          <View style={[styles.section, { alignItems: 'center' }]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          renderRecentBookings()
        )}

        {/* Popular Services */}
        {loading ? (
          <View style={[styles.section, { alignItems: 'center' }]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          renderPopularServices()
        )}

        {/* Upcoming Services */}
        {loading ? (
          <View style={[styles.section, { alignItems: 'center' }]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          renderUpcomingServices()
        )}

        {/* Recent Activity */}
        {loading ? (
          <View style={[styles.section, { alignItems: 'center' }]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          renderRecentActivity()
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Mock data for fallback
const mockStats = {
  totalBookings: 12,
  activeBookings: 3,
  completedBookings: 9,
};

const mockRecentBookings = [
  {
    id: '1',
    serviceTitle: 'House Cleaning',
    serviceIcon: '🧹',
    providerName: 'Sarah Johnson',
    status: 'confirmed',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    totalCost: 120,
  },
  {
    id: '2',
    serviceTitle: 'Plumbing Repair',
    serviceIcon: '🔧',
    providerName: 'Mike Chen',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    totalCost: 85,
  },
];

const mockPopularServices = [
  {
    id: '1',
    name: 'House Cleaning',
    category: 'Cleaning',
    icon: '🧹',
    price: 25,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Plumbing Repair',
    category: 'Home Maintenance',
    icon: '🔧',
    price: 45,
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Garden Maintenance',
    category: 'Landscaping',
    icon: '🌱',
    price: 30,
    rating: 4.7,
  },
];

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
    paddingVertical: SPACING.lg,
    ...SHADOWS.light,
  },
  headerContent: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  notificationButton: {
    padding: SPACING.sm,
  },
  notificationIcon: {
    fontSize: FONTS.lg,
  },

  // Content
  scrollContent: {
    flex: 1,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Sections
  section: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  sectionAction: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  // Bookings
  bookingsContainer: {
    gap: SPACING.md,
  },
  bookingCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
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
    fontSize: 32,
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
  bookingProvider: {
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
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDate: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  bookingPrice: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },

  // Services
  servicesContainer: {
    gap: SPACING.md,
  },
  serviceCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: 200,
    marginRight: SPACING.md,
  },
  serviceIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  serviceCategory: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  serviceRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.sm,
    color: COLORS.warning,
    fontWeight: FONTS.weightMedium,
  },
  servicePrice: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  browseServicesButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  browseServicesButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },

  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default CustomerDashboardScreen;
