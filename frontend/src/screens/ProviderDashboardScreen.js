import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  RefreshControl,
  Animated,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT, ANIMATIONS } from '../constants/theme';
import BookingsAPI from '../services/bookingsApi';
import ProvidersAPI from '../services/providersApi';
import { useAppDispatch, useAuth } from '../store/hooks';
import { logout } from '../store/slices/authSlice';


const { width } = Dimensions.get('window');

const ProviderDashboardScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    pendingBookings: 0,
    completedToday: 0,
    rating: 0,
    totalReviews: 0,
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading provider dashboard data...');
      setLoading(true);
      
      // Try to fetch real data, but gracefully fall back to mock data
      try {
        const [bookings, stats] = await Promise.all([
          BookingsAPI.getProviderBookings().catch(() => null),
          ProvidersAPI.getProviderStats().catch(() => null),
        ]);
        
        console.log('✅ Dashboard data loaded:', { bookings, stats });
        
        // Process bookings data if available
        if (bookings && (Array.isArray(bookings) || bookings.bookings)) {
          const bookingsList = Array.isArray(bookings) ? bookings : bookings.bookings || [];
          setRecentBookings(bookingsList.slice(0, 5));
          
          const today = new Date().toDateString();
          const todayBookings = bookingsList.filter(b => 
            new Date(b.scheduledDate).toDateString() === today
          );
          
          setDashboardData(prev => ({
            ...prev,
            pendingBookings: bookingsList.filter(b => b.status === 'pending').length,
            completedToday: todayBookings.filter(b => b.status === 'completed').length,
          }));
        } else {
          // Use mock bookings data
          setRecentBookings(mockRecentBookings);
        }
        
        // Process stats data if available
        if (stats) {
          setDashboardData(prev => ({
            ...prev,
            todayEarnings: stats.todayEarnings || 125,
            weeklyEarnings: stats.weeklyEarnings || 856,
            monthlyEarnings: stats.monthlyEarnings || 3420,
            rating: stats.averageRating || 4.8,
            totalReviews: stats.totalReviews || 89,
          }));
        } else {
          // Use mock stats data
          setDashboardData(prev => ({
            ...prev,
            todayEarnings: 125,
            weeklyEarnings: 856,
            monthlyEarnings: 3420,
            rating: 4.8,
            totalReviews: 89,
          }));
        }
      } catch (apiError) {
        console.log('⚠️ Using mock data for dashboard (APIs not ready)');
        // Use mock data completely
        setDashboardData({
          todayEarnings: 125,
          weeklyEarnings: 856,
          monthlyEarnings: 3420,
          pendingBookings: 3,
          completedToday: 2,
          rating: 4.8,
          totalReviews: 89,
        });
        setRecentBookings(mockRecentBookings);
      }
      
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      // Final fallback
      setDashboardData({
        todayEarnings: 125,
        weeklyEarnings: 856,
        monthlyEarnings: 3420,
        pendingBookings: 3,
        completedToday: 2,
        rating: 4.8,
        totalReviews: 89,
      });
      setRecentBookings(mockRecentBookings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process from ProviderDashboard...');
      
      // Clear AsyncStorage first - same as CustomerDashboard
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userType');
      await AsyncStorage.removeItem('userData');
      console.log('📱 AsyncStorage cleared');
      
      // Clear Redux auth state - App.js will handle navigation automatically
      dispatch(logout());
      console.log('🔄 Redux state cleared - App.js should handle navigation');
      
    } catch (error) {
      console.error('❌ ProviderDashboard logout error:', error);
      // Even if storage clearing fails, still clear Redux state
      dispatch(logout());
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('ProviderProfile');
  };

  const renderEarningsCard = () => (
    <View style={styles.earningsCard}>
      <Text style={styles.cardTitle}>💰 Earnings Overview</Text>
      <View style={styles.earningsRow}>
        <View style={styles.earningsItem}>
          <Text style={styles.earningsValue}>${dashboardData.todayEarnings}</Text>
          <Text style={styles.earningsLabel}>Today</Text>
        </View>
        <View style={styles.earningsItem}>
          <Text style={styles.earningsValue}>${dashboardData.weeklyEarnings}</Text>
          <Text style={styles.earningsLabel}>This Week</Text>
        </View>
        <View style={styles.earningsItem}>
          <Text style={styles.earningsValue}>${dashboardData.monthlyEarnings}</Text>
          <Text style={styles.earningsLabel}>This Month</Text>
        </View>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, styles.pendingCard]}>
        <Text style={styles.statNumber}>{dashboardData.pendingBookings}</Text>
        <Text style={styles.statLabel}>Pending Bookings</Text>
        <Text style={styles.statIcon}>⏳</Text>
      </View>
      
      <View style={[styles.statCard, styles.completedCard]}>
        <Text style={styles.statNumber}>{dashboardData.completedToday}</Text>
        <Text style={styles.statLabel}>Completed Today</Text>
        <Text style={styles.statIcon}>✅</Text>
      </View>
      
      <View style={[styles.statCard, styles.ratingCard]}>
        <Text style={styles.statNumber}>{dashboardData.rating}</Text>
        <Text style={styles.statLabel}>{dashboardData.totalReviews} Reviews</Text>
        <Text style={styles.statIcon}>⭐</Text>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsCard}>
      <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('ProviderBookings')}
        >
          <Text style={styles.quickActionIcon}>📅</Text>
          <Text style={styles.quickActionText}>View Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('ProviderServices')}
        >
          <Text style={styles.quickActionIcon}>🛠️</Text>
          <Text style={styles.quickActionText}>My Services</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('ProviderAvailability')}
        >
          <Text style={styles.quickActionIcon}>🗓️</Text>
          <Text style={styles.quickActionText}>Availability</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('ProviderEarnings')}
        >
          <Text style={styles.quickActionIcon}>💸</Text>
          <Text style={styles.quickActionText}>Earnings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentBooking = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => navigation.navigate('ProviderBookingDetails', { bookingId: item.id })}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingService}>{item.serviceTitle}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <Text style={styles.bookingCustomer}>Customer: {item.customerName || 'John Doe'}</Text>
      <Text style={styles.bookingDate}>
        📅 {new Date(item.scheduledDate).toLocaleDateString()}
      </Text>
      <Text style={styles.bookingEarning}>💰 ${item.totalCost}</Text>
    </TouchableOpacity>
  );

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

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [isAnimated, setIsAnimated] = useState(false);
  
  // Start animation on mount
  React.useEffect(() => {
    if (!isAnimated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATIONS.timing.normal,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      setIsAnimated(true);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Enhanced Welcome Section */}
        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={COLORS.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}
          >
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeContent}>
                <Text style={styles.welcomeTitle}>Provider Dashboard 💼</Text>
                <Text style={styles.welcomeSubtitle}>Manage your services and bookings</Text>
              </View>
              <CustomButton
                title="Logout"
                variant="ghost"
                size="small"
                icon={<Ionicons name="log-out-outline" size={20} color={COLORS.white} />}
                style={styles.logoutButton}
                textStyle={styles.logoutButtonText}
                onPress={handleLogout}
                animated={true}
              />
            </View>
            
            {/* Floating decoration elements */}
            <View style={styles.decorationCircle1} />
            <View style={styles.decorationCircle2} />
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Quick Actions */}
        <Animated.View 
          style={[
            styles.quickActionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <CustomButton
            title="Manage Services"
            variant="primary"
            size="large"
            gradient={true}
            icon={<Ionicons name="construct" size={24} color={COLORS.white} />}
            style={styles.primaryAction}
            onPress={() => navigation.navigate('ProviderServices')}
            animated={true}
          />
          
          <CustomButton
            title="View Bookings"
            variant="outline"
            size="large"
            icon={<Ionicons name="calendar-outline" size={20} color={COLORS.primary} />}
            style={styles.secondaryAction}
            onPress={() => navigation.navigate('ProviderBookings')}
            animated={true}
          />
        </Animated.View>

        {/* Enhanced Provider Stats */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>💰 Your Performance</Text>
          <View style={styles.statsRow}>
            <Animated.View style={[styles.statCard, styles.primaryStatCard]}>
              <LinearGradient
                colors={[COLORS.primary + '20', COLORS.primary + '10']}
                style={styles.statGradient}
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="cash-outline" size={LAYOUT.iconSize.lg} color={COLORS.primary} />
              </View>
              <Text style={styles.statNumber}>${dashboardData.todayEarnings}</Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </Animated.View>
            
            <Animated.View style={[styles.statCard, styles.successStatCard]}>
              <LinearGradient
                colors={[COLORS.warning + '20', COLORS.warning + '10']}
                style={styles.statGradient}
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="time-outline" size={LAYOUT.iconSize.lg} color={COLORS.warning} />
              </View>
              <Text style={styles.statNumber}>{dashboardData.pendingBookings}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </Animated.View>
            
            <Animated.View style={[styles.statCard, styles.warningStatCard]}>
              <LinearGradient
                colors={[COLORS.success + '20', COLORS.success + '10']}
                style={styles.statGradient}
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={LAYOUT.iconSize.lg} color={COLORS.success} />
              </View>
              <Text style={styles.statNumber}>{dashboardData.completedToday}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Animated.View>
            
            <Animated.View style={[styles.statCard, styles.infoStatCard]}>
              <LinearGradient
                colors={[COLORS.info + '20', COLORS.info + '10']}
                style={styles.statGradient}
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="star-outline" size={LAYOUT.iconSize.lg} color={COLORS.info} />
              </View>
              <Text style={styles.statNumber}>{dashboardData.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Provider Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.categoryGrid}>
            {[
              { name: 'Earnings', icon: 'trending-up-outline', screen: 'ProviderEarnings' },
              { name: 'Availability', icon: 'calendar-outline', screen: 'ProviderAvailability' },
              { name: 'Notifications', icon: 'notifications-outline', screen: 'ProviderNotifications' },
              { name: 'Profile', icon: 'person-outline', screen: 'ProviderProfile' }
            ].map((action) => (
              <TouchableOpacity 
                key={action.name} 
                style={styles.categoryCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <Ionicons 
                  name={action.icon} 
                  size={32} 
                  color={COLORS.primary} 
                />
                <Text style={styles.categoryName}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📋 Recent Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProviderBookings')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <TouchableOpacity 
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => navigation.navigate('ProviderBookingDetails', { bookingId: booking.id })}
              >
                <View style={styles.bookingHeader}>
                  <Text style={styles.bookingService}>{booking.serviceTitle}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.bookingCustomer}>Customer: {booking.customerName || 'John Doe'}</Text>
                <Text style={styles.bookingDate}>
                  📅 {new Date(booking.scheduledDate).toLocaleDateString()}
                </Text>
                <Text style={styles.bookingEarning}>💰 ${booking.totalCost}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent bookings</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Mock data for fallback
const mockRecentBookings = [
  {
    id: '1',
    serviceTitle: 'House Cleaning',
    customerName: 'Sarah Johnson',
    status: 'pending',
    scheduledDate: new Date().toISOString(),
    totalCost: 120,
  },
  {
    id: '2',
    serviceTitle: 'Plumbing Repair',
    customerName: 'Mike Chen',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    totalCost: 85,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  
  // Enhanced Welcome Section
  welcomeSection: {
    position: 'relative',
    overflow: 'hidden',
  },
  
  welcomeGradient: {
    padding: SPACING.xl,
    paddingTop: SPACING.xl * 1.5,
    borderBottomLeftRadius: BORDER_RADIUS.xxl,
    borderBottomRightRadius: BORDER_RADIUS.xxl,
    position: 'relative',
  },
  
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  
  welcomeContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  
  welcomeTitle: {
    fontSize: FONTS.h1,
    fontWeight: FONTS.weightExtraBold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  
  welcomeSubtitle: {
    fontSize: FONTS.body1,
    color: COLORS.white + 'E6',
    lineHeight: FONTS.body1 * FONTS.lineHeightNormal,
  },
  
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...SHADOWS.subtle,
  },
  
  logoutButtonText: {
    color: COLORS.white,
    fontWeight: FONTS.weightSemiBold,
  },
  
  // Floating decoration elements
  decorationCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  decorationCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  
  // Enhanced Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginTop: -SPACING.xl,
    zIndex: 10,
  },
  
  primaryAction: {
    flex: 2,
    ...SHADOWS.heavy,
  },
  
  secondaryAction: {
    flex: 1,
    ...SHADOWS.medium,
  },
  
  // Enhanced Section Styles
  section: {
    marginBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  
  sectionTitle: {
    fontSize: FONTS.h4,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    letterSpacing: 0.5,
  },
  
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  
  seeAllText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },
  
  // Enhanced Stats Cards
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  
  statGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  primaryStatCard: {
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
  },
  
  successStatCard: {
    borderTopWidth: 3,
    borderTopColor: COLORS.warning,
  },
  
  warningStatCard: {
    borderTopWidth: 3,
    borderTopColor: COLORS.success,
  },
  
  infoStatCard: {
    borderTopWidth: 3,
    borderTopColor: COLORS.info,
  },
  
  statIconContainer: {
    marginBottom: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    ...SHADOWS.subtle,
  },
  
  
  // Enhanced Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  
  categoryCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 100,
    ...SHADOWS.light,
  },
  
  categoryName: {
    fontSize: FONTS.body2,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  
  // Earnings Card
  earningsCard: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  earningsItem: {
    alignItems: 'center',
  },
  earningsValue: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  earningsLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  /* statCard duplicate removed to avoid duplicate key warning; using earlier definition */
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  ratingCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  statNumber: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  statIcon: {
    fontSize: FONTS.md,
    marginTop: SPACING.xs,
  },
  
  // Quick Actions
  quickActionsCard: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: FONTS.xl,
    marginBottom: SPACING.xs,
  },
  quickActionText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  
  // Recent Bookings
  recentBookingsCard: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  /* seeAllText duplicate removed to avoid duplicate key warning; using earlier definition */
  bookingCard: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  bookingService: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    textTransform: 'capitalize',
  },
  bookingCustomer: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  bookingDate: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  bookingEarning: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProviderDashboardScreen;
