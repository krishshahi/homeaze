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
import UpcomingServices from './UpcomingServices';

const { width } = Dimensions.get('window');

const CustomerDashboard = ({ 
  stats, 
  upcomingServices, 
  recentActivity, 
  loading, 
  onServicePress,
  onBookNewService,
  onViewAllBookings 
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
  
  const customerStats = {
    totalBookings: stats?.totalBookings || 0,
    completedServices: stats?.completedServices || 0,
    totalSpent: stats?.totalSpent || 0,
    savedAmount: stats?.savedAmount || 0,
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Starting logout process from CustomerDashboard...');
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userType');
      await AsyncStorage.removeItem('userData');
      console.log('📱 AsyncStorage cleared');
      
      // Clear Redux auth state - App.js will handle navigation automatically
      dispatch(logout());
      console.log('🔄 Redux state cleared - App.js should handle navigation');
      
    } catch (error) {
      console.error('❌ CustomerDashboard logout error:', error);
      // Even if storage clearing fails, still clear Redux state
      dispatch(logout());
    }
  };

  return (
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
              <Text style={styles.welcomeTitle}>Welcome Back! 🏠</Text>
              <Text style={styles.welcomeSubtitle}>Find the perfect service for your home</Text>
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
          title="Book New Service"
          variant="primary"
          size="large"
          gradient={true}
          icon={<Ionicons name="add-circle" size={24} color={COLORS.white} />}
          style={styles.primaryAction}
          onPress={onBookNewService}
          animated={true}
        />
        
        <CustomButton
          title="My Bookings"
          variant="outline"
          size="large"
          icon={<Ionicons name="calendar-outline" size={20} color={COLORS.primary} />}
          style={styles.secondaryAction}
          onPress={onViewAllBookings}
          animated={true}
        />
      </Animated.View>

      {/* Enhanced Customer Stats */}
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>📊 Your Activity</Text>
        <View style={styles.statsRow}>
          <Animated.View style={[styles.statCard, styles.primaryStatCard]}>
            <LinearGradient
              colors={[COLORS.primary + '20', COLORS.primary + '10']}
              style={styles.statGradient}
            />
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar-outline" size={LAYOUT.iconSize.lg} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{customerStats.totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </Animated.View>
          
          <Animated.View style={[styles.statCard, styles.successStatCard]}>
            <LinearGradient
              colors={[COLORS.success + '20', COLORS.success + '10']}
              style={styles.statGradient}
            />
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={LAYOUT.iconSize.lg} color={COLORS.success} />
            </View>
            <Text style={styles.statNumber}>{customerStats.completedServices}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Animated.View>
          
          <Animated.View style={[styles.statCard, styles.warningStatCard]}>
            <LinearGradient
              colors={[COLORS.warning + '20', COLORS.warning + '10']}
              style={styles.statGradient}
            />
            <View style={styles.statIconContainer}>
              <Ionicons name="cash-outline" size={LAYOUT.iconSize.lg} color={COLORS.warning} />
            </View>
            <Text style={styles.statNumber}>${customerStats.totalSpent}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </Animated.View>
          
          <Animated.View style={[styles.statCard, styles.infoStatCard]}>
            <LinearGradient
              colors={[COLORS.info + '20', COLORS.info + '10']}
              style={styles.statGradient}
            />
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-down-outline" size={LAYOUT.iconSize.lg} color={COLORS.info} />
            </View>
            <Text style={styles.statNumber}>${customerStats.savedAmount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Upcoming Services */}
      <UpcomingServices 
        services={upcomingServices} 
        loading={loading} 
        onServicePress={onServicePress}
        title="Your Upcoming Services"
      />

      {/* Recent Activity */}
      <RecentActivity 
        activities={recentActivity} 
        loading={loading}
        title="Recent Activity"
      />



      {/* Service Categories Quick Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Services</Text>
        <View style={styles.categoryGrid}>
          {['Cleaning', 'Plumbing', 'Electrical', 'Gardening'].map((category) => (
            <TouchableOpacity key={category} style={styles.categoryCard}>
              <Ionicons 
                name={getCategoryIcon(category)} 
                size={32} 
                color={COLORS.primary} 
              />
              <Text style={styles.categoryName}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const getCategoryIcon = (category) => {
  const icons = {
    'Cleaning': 'home-outline',
    'Plumbing': 'water-outline',
    'Electrical': 'flash-outline',
    'Gardening': 'leaf-outline',
  };
  return icons[category] || 'build-outline';
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
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  
  statLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: FONTS.weightMedium,
    lineHeight: FONTS.caption * FONTS.lineHeightNormal,
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
});

export default CustomerDashboard;
