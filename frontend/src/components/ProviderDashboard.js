import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT, ANIMATIONS } from '../constants/theme';
import CustomButton from './CustomButton';
import RecentActivity from './RecentActivity';
import { Alert } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { logout } from '../store/slices/authSlice';

const { width } = Dimensions.get('window');

const ProviderDashboard = ({ 
  stats, 
  recentBookings, 
  recentActivity, 
  loading, 
  onBookingPress,
  onViewAllBookings,
  onManageServices,
  onViewEarnings 
}) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  
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
  
  const providerStats = {
    totalBookings: stats?.totalBookings || 0,
    completedServices: stats?.completedServices || 0,
    totalEarnings: stats?.totalEarnings || stats?.currentRevenue || 0,
    averageRating: stats?.averageRating || 4.5,
    pendingBookings: stats?.pendingBookings || stats?.activeBookings || 0,
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process from ProviderDashboard...');
      
      // Clear AsyncStorage
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Enhanced Provider Header */}
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
          colors={COLORS.gradientSecondary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeGradient}
        >
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeTitle}>Provider Dashboard 🏢</Text>
              <Text style={styles.welcomeSubtitle}>Manage your business and grow your revenue</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{providerStats.pendingBookings}</Text>
                </View>
              </TouchableOpacity>
              <CustomButton
                title="Logout"
                variant="ghost"
                size="small"
                icon={<Ionicons name="log-out-outline" size={18} color={COLORS.white} />}
                style={styles.logoutButton}
                textStyle={styles.logoutButtonText}
                onPress={handleLogout}
                animated={true}
              />
            </View>
          </View>
          
          {/* Floating decoration elements */}
          <View style={styles.decorationCircle1} />
          <View style={styles.decorationCircle2} />
        </LinearGradient>
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
        <Text style={styles.sectionTitle}>📈 Your Business Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <Animated.View style={[styles.statCard, styles.primaryStatCard]}>
              <LinearGradient
                colors={[COLORS.primary + '20', COLORS.primary + '10']}
                style={styles.statGradient}
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar-outline" size={LAYOUT.iconSize.lg} color={COLORS.primary} />
              </View>
              <Text style={styles.statNumber}>{providerStats.totalBookings}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </Animated.View>
            
            <Animated.View style={[styles.statCard, styles.successStatCard]}>
              <LinearGradient
                colors={[COLORS.success + '20', COLORS.success + '10']}
                style={styles.statGradient}
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={LAYOUT.iconSize.lg} color={COLORS.success} />
              </View>
              <Text style={styles.statNumber}>{providerStats.completedServices}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </Animated.View>
          </View>

          <View style={styles.statsRow}>
            <Animated.View style={[styles.statCard, styles.warningStatCard]}>
              <LinearGradient
                colors={[COLORS.warning + '20', COLORS.warning + '10']}
                style={styles.statGradient}
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="cash-outline" size={LAYOUT.iconSize.lg} color={COLORS.warning} />
              </View>
              <Text style={styles.statNumber}>${providerStats.totalEarnings}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </Animated.View>
            
            <Animated.View style={[styles.statCard, styles.infoStatCard]}>
              <LinearGradient
                colors={[COLORS.info + '20', COLORS.info + '10']}
                style={styles.statGradient}
              />
              <View style={styles.statIconContainer}>
                <Ionicons name="star-outline" size={LAYOUT.iconSize.lg} color={COLORS.info} />
              </View>
              <Text style={styles.statNumber}>{providerStats.averageRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions for Provider */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onViewAllBookings}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>View Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onManageServices}>
          <Ionicons name="build-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Manage Services</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onViewEarnings}>
          <Ionicons name="trending-up-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Earnings</Text>
        </TouchableOpacity>
      </View>

      {/* Pending Bookings Alert */}
      {providerStats.pendingBookings > 0 && (
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Ionicons name="time-outline" size={20} color={COLORS.warning} />
            <Text style={styles.alertTitle}>Pending Bookings</Text>
          </View>
          <Text style={styles.alertText}>
            You have {providerStats.pendingBookings} booking(s) waiting for your response
          </Text>
          <TouchableOpacity style={styles.alertButton} onPress={onViewAllBookings}>
            <Text style={styles.alertButtonText}>Review Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Bookings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity onPress={onViewAllBookings}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading bookings...</Text>
          </View>
        ) : (
          <View style={styles.bookingsContainer}>
            {recentBookings && recentBookings.length > 0 ? (
              recentBookings.slice(0, 3).map((booking) => (
                <TouchableOpacity 
                  key={booking.id} 
                  style={styles.bookingCard}
                  onPress={() => onBookingPress(booking)}
                >
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingService}>{booking.serviceTitle}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                      <Text style={styles.statusText}>{booking.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.bookingCustomer}>Customer: {booking.customerName || 'N/A'}</Text>
                  <Text style={styles.bookingDate}>
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.bookingPrice}>${booking.totalCost}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent bookings</Text>
            )}
          </View>
        )}
      </View>

      {/* Performance Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.performanceGrid}>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceNumber}>12</Text>
            <Text style={styles.performanceLabel}>Jobs Completed</Text>
          </View>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceNumber}>$2,450</Text>
            <Text style={styles.performanceLabel}>Earnings</Text>
          </View>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceNumber}>4.8</Text>
            <Text style={styles.performanceLabel}>Rating</Text>
          </View>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceNumber}>3</Text>
            <Text style={styles.performanceLabel}>New Reviews</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <RecentActivity 
        activities={recentActivity} 
        loading={loading}
        title="Recent Activity"
      />
    </ScrollView>
  );
};

const getStatusColor = (status) => {
  const colors = {
    'pending': COLORS.warning,
    'confirmed': COLORS.info,
    'in-progress': COLORS.primary,
    'completed': COLORS.success,
    'cancelled': COLORS.error,
  };
  return colors[status] || COLORS.textSecondary;
};

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
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  
  notificationButton: {
    position: 'relative',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: FONTS.weightBold,
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
  
  // Enhanced Stats Cards
  statsContainer: {
    padding: SPACING.lg,
    marginTop: -SPACING.xl,
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
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
    borderTopColor: COLORS.success,
  },
  
  warningStatCard: {
    borderTopWidth: 3,
    borderTopColor: COLORS.warning,
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
  
  statNumber: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightExtraBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  
  statLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: FONTS.weightMedium,
    lineHeight: FONTS.caption * FONTS.lineHeightNormal,
    marginTop: SPACING.xs,
  },
  
  // Enhanced Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 80,
    ...SHADOWS.medium,
  },
  
  actionButtonText: {
    fontSize: FONTS.body3,
    color: COLORS.primary,
    fontWeight: FONTS.weightSemiBold,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  
  // Enhanced Alert Card
  alertCard: {
    backgroundColor: COLORS.warning + '20',
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    ...SHADOWS.light,
  },
  
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  alertTitle: {
    fontSize: FONTS.body2,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  
  alertText: {
    fontSize: FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: FONTS.body3 * FONTS.lineHeightNormal,
  },
  
  alertButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.subtle,
  },
  
  alertButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body3,
    fontWeight: FONTS.weightBold,
  },
  
  // Enhanced Sections
  section: {
    marginBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  
  sectionTitle: {
    fontSize: FONTS.h4,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  
  seeAllText: {
    fontSize: FONTS.body3,
    color: COLORS.primary,
    fontWeight: FONTS.weightSemiBold,
  },
  
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  
  // Enhanced Booking Cards
  bookingsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  
  bookingCard: {
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  bookingService: {
    fontSize: FONTS.body2,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 80,
    alignItems: 'center',
  },
  
  statusText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: FONTS.weightBold,
    textTransform: 'capitalize',
  },
  
  bookingCustomer: {
    fontSize: FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  
  bookingDate: {
    fontSize: FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  
  bookingPrice: {
    fontSize: FONTS.h4,
    fontWeight: FONTS.weightExtraBold,
    color: COLORS.success,
  },
  
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONTS.body2,
    fontStyle: 'italic',
    padding: SPACING.xxl,
    lineHeight: FONTS.body2 * FONTS.lineHeightRelaxed,
  },
  
  // Enhanced Performance Grid
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  
  performanceCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.backgroundCard,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  
  performanceNumber: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightExtraBold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  
  performanceLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: FONTS.weightMedium,
    lineHeight: FONTS.caption * FONTS.lineHeightNormal,
  },
});

export default ProviderDashboard;
