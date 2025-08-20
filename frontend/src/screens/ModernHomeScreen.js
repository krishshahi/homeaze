import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import theme from '../constants/modernTheme';
import ModernCard, { CardHeader, CardBody } from '../components/modern/ModernCard';
import ModernButton from '../components/modern/ModernButton';
import ModernInput from '../components/modern/ModernInput';
import { useAppDispatch, useServices, useUser, useDashboard, useAuth } from '../store/hooks';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import { fetchCategories, fetchFeaturedServices, fetchServices } from '../store/slices/servicesSlice';

const { width } = Dimensions.get('window');

const ModernHomeScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { services, featuredServices, categories } = useServices();
  const { stats, recentActivity, upcomingServices, recentBookings, loading } = useDashboard();
  const auth = useAuth();
  const user = useUser() || {};

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize animations
    Animated.stagger(100, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.duration.slow,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: theme.animations.duration.normal,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Load data
    dispatch(fetchCategories());
    dispatch(fetchFeaturedServices(8));
    dispatch(fetchServices());
    if (auth.isAuthenticated && auth.token) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, auth.isAuthenticated, auth.token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchServices()),
        dispatch(fetchFeaturedServices(8)),
        auth.isAuthenticated && dispatch(fetchDashboardData()),
      ].filter(Boolean));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleServicePress = (service) => {
    if (service.serviceTitle && service.scheduledDate) {
      navigation.navigate('BookingDetails', { bookingId: service.id });
    } else {
      navigation.navigate('ServiceDetails', { 
        serviceId: service._id || service.id,
        service: service 
      });
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    navigation.navigate('Services', { category: category.id });
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        { opacity: headerOpacity }
      ]}
    >
      <LinearGradient
        colors={theme.colors.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>
                Good {getGreeting()}
              </Text>
              <Text style={styles.userNameText}>
                {user.name || 'Welcome'}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color={theme.colors.text.inverse} />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchSection}>
            <ModernInput
              placeholder="Search services..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon="search-outline"
              rightIcon={searchQuery ? "close-circle" : null}
              rightIconOnPress={() => setSearchQuery('')}
              variant="filled"
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </LinearGradient>
    </Animated.View>
  );

  const renderQuickStats = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.quickStatsContainer}>
        <ModernCard
          variant="elevated"
          shadow="md"
          padding="md"
          style={styles.statCard}
        >
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.primary[100] }]}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.primary[600]} />
            </View>
            <Text style={styles.statValue}>{stats?.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
        </ModernCard>

        <ModernCard
          variant="elevated"
          shadow="md"
          padding="md"
          style={styles.statCard}
        >
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.success[100] }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.success[600]} />
            </View>
            <Text style={styles.statValue}>{stats?.completedServices || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </ModernCard>

        <ModernCard
          variant="elevated"
          shadow="md"
          padding="md"
          style={styles.statCard}
        >
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.warning[100] }]}>
              <Ionicons name="star-outline" size={24} color={theme.colors.warning[600]} />
            </View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </ModernCard>
      </View>
    </Animated.View>
  );

  const renderCategories = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
          <Text style={styles.seeAllButton}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {renderCategoryItems()}
      </ScrollView>
    </Animated.View>
  );

  const renderCategoryItems = () => {
    const categoryData = [
      { id: 'cleaning', name: 'Cleaning', icon: 'home-outline', color: theme.colors.primary[500] },
      { id: 'plumbing', name: 'Plumbing', icon: 'water-outline', color: theme.colors.info[500] },
      { id: 'electrical', name: 'Electrical', icon: 'flash-outline', color: theme.colors.warning[500] },
      { id: 'gardening', name: 'Gardening', icon: 'leaf-outline', color: theme.colors.success[500] },
      { id: 'handyman', name: 'Handyman', icon: 'hammer-outline', color: theme.colors.secondary[500] },
      { id: 'painting', name: 'Painting', icon: 'brush-outline', color: theme.colors.error[500] },
    ];

    return categoryData.map((category, index) => (
      <ModernCard
        key={category.id}
        onPress={() => handleCategoryPress(category)}
        pressable
        variant="elevated"
        shadow="sm"
        padding="md"
        style={styles.categoryCard}
      >
        <View style={[styles.categoryIconContainer, { backgroundColor: `${category.color}20` }]}>
          <Ionicons name={category.icon} size={28} color={category.color} />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
      </ModernCard>
    ));
  };

  const renderUpcomingServices = () => {
    if (!upcomingServices?.length) return null;

    return (
      <Animated.View
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Services</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
            <Text style={styles.seeAllButton}>View All</Text>
          </TouchableOpacity>
        </View>

        {upcomingServices.slice(0, 3).map((service, index) => (
          <ModernCard
            key={service.id}
            onPress={() => handleServicePress(service)}
            pressable
            variant="elevated"
            shadow="sm"
            padding="md"
            margin="sm"
            style={styles.upcomingServiceCard}
          >
            <View style={styles.upcomingServiceContent}>
              <View style={styles.upcomingServiceIcon}>
                <Text style={styles.serviceEmoji}>{service.serviceIcon}</Text>
              </View>
              
              <View style={styles.upcomingServiceDetails}>
                <Text style={styles.upcomingServiceTitle}>{service.serviceTitle}</Text>
                <Text style={styles.upcomingServiceProvider}>{service.providerName}</Text>
                <View style={styles.upcomingServiceMeta}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.text.tertiary} />
                  <Text style={styles.upcomingServiceDate}>
                    {formatDate(service.scheduledDate)}
                  </Text>
                  <Ionicons name="time-outline" size={14} color={theme.colors.text.tertiary} />
                  <Text style={styles.upcomingServiceTime}>{service.scheduledTime}</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </View>
          </ModernCard>
        ))}
      </Animated.View>
    );
  };

  const renderFeaturedServices = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Services</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
          <Text style={styles.seeAllButton}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuredServicesGrid}>
        {(featuredServices || services)?.slice(0, 4).map((service, index) => (
          <ModernCard
            key={service.id}
            onPress={() => handleServicePress(service)}
            pressable
            variant="elevated"
            shadow="md"
            padding="lg"
            style={styles.featuredServiceCard}
          >
            <CardBody>
              <View style={styles.serviceImagePlaceholder}>
                <Text style={styles.serviceEmoji}>{service.icon || '🏠'}</Text>
              </View>
              
              <Text style={styles.serviceTitle} numberOfLines={2}>
                {service.title}
              </Text>
              
              <Text style={styles.serviceDescription} numberOfLines={2}>
                {service.description}
              </Text>
              
              <View style={styles.serviceFooter}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
                  <Text style={styles.ratingText}>{service.rating || 4.8}</Text>
                </View>
                
                <Text style={styles.priceText}>
                  {service.startingPrice ? `$${service.startingPrice}` : 'Quote'}
                </Text>
              </View>
              
              {service.featured && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>Popular</Text>
                </View>
              )}
            </CardBody>
          </ModernCard>
        ))}
      </View>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View
      style={[
        styles.section,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.quickActionsContainer}>
        <ModernButton
          title="Book Service"
          icon="add-circle-outline"
          variant="gradient"
          size="lg"
          onPress={() => navigation.navigate('Services')}
          style={styles.primaryActionButton}
        />
        
        <View style={styles.secondaryActions}>
          <ModernButton
            title="My Bookings"
            icon="calendar-outline"
            variant="outline"
            size="md"
            onPress={() => navigation.navigate('Bookings')}
            style={styles.secondaryActionButton}
          />
          
          <ModernButton
            title="Support"
            icon="help-circle-outline"
            variant="outline"
            size="md"
            onPress={() => navigation.navigate('Support')}
            style={styles.secondaryActionButton}
          />
        </View>
      </View>
    </Animated.View>
  );

  // Helper functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary[600]}
        translucent={Platform.OS === 'android'}
      />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {renderQuickStats()}
        {renderCategories()}
        {renderUpcomingServices()}
        {renderFeaturedServices()}
        {renderQuickActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  // Header Styles
  header: {
    position: 'relative',
    overflow: 'hidden',
  },
  
  headerGradient: {
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    position: 'relative',
  },
  
  headerContent: {
    paddingHorizontal: theme.spacing[5],
    zIndex: 2,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[6],
  },
  
  welcomeSection: {
    flex: 1,
  },
  
  welcomeText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginBottom: theme.spacing[1],
  },
  
  userNameText: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weight.bold,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  
  notificationButton: {
    position: 'relative',
    padding: theme.spacing[2],
  },
  
  notificationBadge: {
    position: 'absolute',
    top: theme.spacing[1],
    right: theme.spacing[1],
    backgroundColor: theme.colors.error[500],
    borderRadius: theme.borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  notificationBadgeText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weight.bold,
    fontSize: 10,
  },
  
  profileButton: {
    padding: theme.spacing[1],
  },
  
  avatar: {
    width: theme.components.avatar.sizes.md,
    height: theme.components.avatar.sizes.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  
  avatarText: {
    ...theme.typography.styles.body1,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weight.bold,
  },
  
  searchSection: {
    marginTop: theme.spacing[2],
  },
  
  searchInput: {
    backgroundColor: theme.colors.surface.primary,
    borderWidth: 0,
  },
  
  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  decorativeCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  
  decorativeCircle3: {
    position: 'absolute',
    top: '50%',
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  
  // Content Styles
  content: {
    flex: 1,
    marginTop: -theme.spacing[6],
  },
  
  scrollContent: {
    paddingBottom: theme.spacing[10],
  },
  
  section: {
    marginBottom: theme.spacing[6],
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  
  sectionTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.bold,
  },
  
  seeAllButton: {
    ...theme.typography.styles.body2,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weight.semiBold,
  },
  
  // Quick Stats
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[5],
    gap: theme.spacing[3],
  },
  
  statCard: {
    flex: 1,
  },
  
  statContent: {
    alignItems: 'center',
  },
  
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  
  statValue: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.bold,
    marginBottom: theme.spacing[1],
  },
  
  statLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  // Categories
  categoriesContainer: {
    paddingHorizontal: theme.spacing[5],
    gap: theme.spacing[3],
  },
  
  categoryCard: {
    alignItems: 'center',
    minWidth: 80,
  },
  
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  
  categoryName: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.medium,
    textAlign: 'center',
  },
  
  // Upcoming Services
  upcomingServiceCard: {
    marginHorizontal: theme.spacing[5],
  },
  
  upcomingServiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  upcomingServiceIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[4],
  },
  
  serviceEmoji: {
    fontSize: 24,
  },
  
  upcomingServiceDetails: {
    flex: 1,
  },
  
  upcomingServiceTitle: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semiBold,
    marginBottom: theme.spacing[1],
  },
  
  upcomingServiceProvider: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  
  upcomingServiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  
  upcomingServiceDate: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    marginRight: theme.spacing[3],
  },
  
  upcomingServiceTime: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
  },
  
  // Featured Services
  featuredServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing[5],
    gap: theme.spacing[3],
  },
  
  featuredServiceCard: {
    width: (width - theme.spacing[5] * 2 - theme.spacing[3]) / 2,
    position: 'relative',
  },
  
  serviceImagePlaceholder: {
    height: 80,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  
  serviceTitle: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semiBold,
    marginBottom: theme.spacing[2],
  },
  
  serviceDescription: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
    lineHeight: theme.typography.lineHeight.snug * theme.typography.size.sm,
  },
  
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  
  ratingText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weight.medium,
  },
  
  priceText: {
    ...theme.typography.styles.body2,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weight.bold,
  },
  
  featuredBadge: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    backgroundColor: theme.colors.warning[500],
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  
  featuredBadgeText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weight.bold,
    fontSize: 10,
  },
  
  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: theme.spacing[5],
    gap: theme.spacing[4],
  },
  
  primaryActionButton: {
    ...theme.shadows.lg,
  },
  
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  
  secondaryActionButton: {
    flex: 1,
  },
});

export default ModernHomeScreen;
