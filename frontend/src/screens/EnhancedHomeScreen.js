import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  FlatList,
  Animated,
  RefreshControl,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ServiceCard from '../components/ServiceCard';
import CustomButton from '../components/CustomButton';
import CustomerDashboard from '../components/CustomerDashboard';
import ProviderDashboard from '../components/ProviderDashboard';
import NotificationSystem, { NotificationBanner } from '../components/NotificationSystem';
import ServiceFlowTestButton from '../components/ServiceFlowTestButton';
import { 
  COLORS, 
  FONTS, 
  SPACING, 
  BORDER_RADIUS, 
  SHADOWS, 
  LAYOUT, 
  ANIMATIONS, 
  VARIANTS 
} from '../constants/theme';
import { useAppDispatch, useServices, useUser, useDashboard, useAuth } from '../store/hooks';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import { initializeServices } from '../store/slices/servicesSlice';

const { width, height } = Dimensions.get('window');

const EnhancedHomeScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { services, featuredServices, categories } = useServices();
  const { stats, recentActivity, upcomingServices, recentBookings, loading } = useDashboard();
  const auth = useAuth();
  const user = useUser() || {};
  
  // State management
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bannerNotification, setBannerNotification] = useState(null);
  const [showSecurityBanner, setShowSecurityBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Mock data for enhanced demo
  const mockServices = [
    {
      id: '1',
      title: 'House Cleaning',
      icon: '🏠',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
      description: 'Professional deep cleaning service for your home',
      rating: 4.8,
      reviewCount: 234,
      startingPrice: 75,
      originalPrice: 100,
      discount: 25,
      provider: { name: 'CleanPro Services' },
      duration: '2-3 hours',
      availability: 'Today',
      tags: ['Deep Clean', 'Eco-Friendly'],
      featured: true,
    },
    {
      id: '2',
      title: 'Plumbing Repair',
      icon: '🔧',
      description: 'Expert plumbing solutions for all your needs',
      rating: 4.6,
      reviewCount: 189,
      startingPrice: 85,
      provider: { name: 'QuickFix Plumbers' },
      duration: '1-2 hours',
      availability: 'Tomorrow',
      tags: ['Emergency', '24/7'],
    },
    {
      id: '3',
      title: 'Gardening',
      icon: '🌱',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
      description: 'Transform your outdoor space with expert care',
      rating: 4.9,
      reviewCount: 156,
      startingPrice: 60,
      provider: { name: 'Green Thumb Gardens' },
      duration: '3-4 hours',
      availability: 'This week',
      tags: ['Organic', 'Design'],
    },
    {
      id: '4',
      title: 'Electrical Work',
      icon: '⚡',
      description: 'Safe and reliable electrical services',
      rating: 4.7,
      reviewCount: 203,
      startingPrice: 95,
      provider: { name: 'PowerUp Electric' },
      duration: '1-3 hours',
      availability: 'Today',
      tags: ['Licensed', 'Insured'],
      isUnavailable: false,
    },
  ];

  const mockCategories = [
    { id: '1', name: 'Cleaning', icon: '🧽', count: 15 },
    { id: '2', name: 'Repair', icon: '🔨', count: 23 },
    { id: '3', name: 'Beauty', icon: '💄', count: 12 },
    { id: '4', name: 'Fitness', icon: '💪', count: 8 },
    { id: '5', name: 'Tech', icon: '💻', count: 18 },
  ];

  // Component mount animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.timing.slow,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: ANIMATIONS.timing.normal,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize data
    dispatch(initializeServices());
    if (auth.isAuthenticated && auth.token) {
      dispatch(fetchDashboardData());
    }

    // Mock notifications for demo
    if (user.userType === 'provider') {
      setTimeout(() => {
        const mockNotification = {
          id: '1',
          type: 'booking_request',
          title: 'New Booking Request',
          message: 'You have received a new booking request for House Cleaning',
          createdAt: new Date().toISOString(),
          bookingId: 'booking_123',
        };
        setBannerNotification(mockNotification);
        setNotifications([mockNotification]);
      }, 3000);
    }
  }, [dispatch, auth.isAuthenticated, auth.token, user.userType]);

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleServicePress = (service) => {
    console.log('Service selected:', service.title);
    navigation.navigate('ServiceDetails', { serviceId: service.id });
  };

  const handleFavoritePress = (service) => {
    const newFavorites = new Set(favorites);
    if (favorites.has(service.id)) {
      newFavorites.delete(service.id);
    } else {
      newFavorites.add(service.id);
    }
    setFavorites(newFavorites);
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(selectedCategory?.id === category.id ? null : category);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = !searchQuery || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      service.tags?.some(tag => tag.toLowerCase().includes(selectedCategory.name.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  const renderServiceCard = ({ item, index }) => (
    <Animated.View
      style={[
        { opacity: fadeAnim },
        {
          transform: [
            { 
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, index * 10],
              })
            }
          ]
        }
      ]}
    >
      <ServiceCard
        key={item.id}
        title={item.title}
        icon={item.icon}
        image={item.image}
        description={item.description}
        rating={item.rating}
        reviewCount={item.reviewCount}
        startingPrice={item.startingPrice}
        originalPrice={item.originalPrice}
        discount={item.discount}
        provider={item.provider}
        duration={item.duration}
        availability={item.availability}
        tags={item.tags}
        featured={item.featured}
        isFavorite={favorites.has(item.id)}
        isUnavailable={item.isUnavailable}
        onPress={() => handleServicePress(item)}
        onFavoritePress={() => handleFavoritePress(item)}
        animated={true}
        style={styles.serviceCard}
      />
    </Animated.View>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory?.id === item.id && styles.selectedCategoryCard,
      ]}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.8}
    >
      <View style={[
        styles.categoryIconContainer,
        selectedCategory?.id === item.id && styles.selectedCategoryIcon,
      ]}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
      </View>
      <Text style={[
        styles.categoryTitle,
        selectedCategory?.id === item.id && styles.selectedCategoryTitle,
      ]}>
        {item.name}
      </Text>
      <Text style={[
        styles.categoryCount,
        selectedCategory?.id === item.id && styles.selectedCategoryCount,
      ]}>
        {item.count}
      </Text>
    </TouchableOpacity>
  );

  const renderQuickAction = (title, icon, onPress, gradient = false) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {gradient ? (
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={styles.quickActionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.quickActionIconGradient}>{icon}</Text>
          <Text style={styles.quickActionTitleGradient}>{title}</Text>
        </LinearGradient>
      ) : (
        <>
          <Text style={styles.quickActionIcon}>{icon}</Text>
          <Text style={styles.quickActionTitle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.white} 
        translucent={Platform.OS === 'android'}
      />
      
      {/* Enhanced Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={[COLORS.white, COLORS.backgroundSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        />
        
        <View style={styles.headerTop}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </Text>
            <Text style={styles.userName}>
              {user.name || 'User'}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => setShowNotifications(true)}
            >
              <Text style={styles.notificationIcon}>🔔</Text>
              {notifications.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for services..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Security Enhancement Banner */}
      {showSecurityBanner && (
        <Animated.View style={[styles.securityBanner, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#e8f5e8', '#f0f8f0']}
            style={styles.securityBannerGradient}
          >
            <View style={styles.securityBannerContent}>
              <Text style={styles.securityBannerIcon}>🔐</Text>
              <View style={styles.securityBannerText}>
                <Text style={styles.securityBannerTitle}>Security Enhancements Available!</Text>
                <Text style={styles.securityBannerSubtitle}>
                  Enable MFA, check sessions, and manage social logins
                </Text>
              </View>
              <CustomButton
                title="Security"
                size="small"
                variant="success"
                onPress={() => {
                  navigation.navigate('Profile', { screen: 'SecuritySettings' });
                  setShowSecurityBanner(false);
                }}
              />
            </View>
            <TouchableOpacity 
              style={styles.securityBannerClose}
              onPress={() => setShowSecurityBanner(false)}
            >
              <Text style={styles.securityBannerCloseText}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Notification Banner */}
      {bannerNotification && (
        <NotificationBanner
          notification={bannerNotification}
          onPress={() => setShowNotifications(true)}
          onDismiss={() => setBannerNotification(null)}
        />
      )}

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Role-based Dashboard */}
        {user.userType === 'provider' ? (
          <ProviderDashboard
            stats={stats}
            recentBookings={recentBookings}
            recentActivity={recentActivity}
            loading={loading.dashboard}
            onBookingPress={(booking) => navigation.navigate('BookingDetails', { bookingId: booking.id })}
            onViewAllBookings={() => navigation.navigate('Bookings')}
            onManageServices={() => navigation.navigate('ManageServices')}
            onViewEarnings={() => navigation.navigate('Earnings')}
          />
        ) : (
          <CustomerDashboard
            stats={stats}
            upcomingServices={upcomingServices}
            recentActivity={recentActivity}
            loading={loading.dashboard}
            onServicePress={handleServicePress}
            onBookNewService={() => navigation.navigate('Services')}
            onViewAllBookings={() => navigation.navigate('Bookings')}
          />
        )}

        {/* Quick Actions */}
        {showQuickActions && (
          <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity onPress={() => setShowQuickActions(false)}>
                <Text style={styles.hideText}>Hide</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.quickActionsContainer}>
              {renderQuickAction('Book Service', '📅', () => navigation.navigate('Services'), true)}
              {renderQuickAction('My Bookings', '📋', () => navigation.navigate('Bookings'))}
              {renderQuickAction('Favorites', '❤️', () => navigation.navigate('Favorites'))}
              {renderQuickAction('Support', '💬', () => navigation.navigate('Support'))}
            </View>
          </Animated.View>
        )}

        {/* Categories */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={mockCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </Animated.View>

        {/* Featured Services */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? `${selectedCategory.name} Services` : 'Featured Services'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Services')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.servicesGrid}>
            {filteredServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                icon={service.icon}
                image={service.image}
                description={service.description}
                rating={service.rating}
                reviewCount={service.reviewCount}
                startingPrice={service.startingPrice}
                originalPrice={service.originalPrice}
                discount={service.discount}
                provider={service.provider}
                duration={service.duration}
                availability={service.availability}
                tags={service.tags}
                featured={service.featured}
                isFavorite={favorites.has(service.id)}
                isUnavailable={service.isUnavailable}
                onPress={() => handleServicePress(service)}
                onFavoritePress={() => handleFavoritePress(service)}
                animated={true}
                style={[
                  styles.serviceCard,
                  index % 2 === 0 ? { marginRight: SPACING.sm } : { marginLeft: SPACING.sm }
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Demo Button */}
        <Animated.View style={[styles.demoSection, { opacity: fadeAnim }]}>
          <CustomButton
            title="Experience Demo Features"
            variant="secondary"
            size="large"
            fullWidth
            gradient
            icon={<Text>🚀</Text>}
            onPress={() => navigation.navigate('FeaturesDemoScreen')}
            style={styles.demoButton}
          />
        </Animated.View>
      </ScrollView>
      
      {/* Notification System Modal */}
      <NotificationSystem
        notifications={notifications}
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        onAcceptBooking={(bookingId) => console.log('Accept booking:', bookingId)}
        onRejectBooking={(bookingId) => console.log('Reject booking:', bookingId)}
        onViewBooking={(bookingId) => {
          navigation.navigate('BookingDetails', { bookingId });
          setShowNotifications(false);
        }}
      />
      
      {/* Service Flow Test Button */}
      <ServiceFlowTestButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  
  // Header styles
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    position: 'relative',
    ...SHADOWS.light,
  },
  
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + SPACING.sm : SPACING.sm,
  },
  
  greetingContainer: {
    flex: 1,
  },
  
  greetingText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sm * FONTS.lineHeightNormal,
  },
  
  userName: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  
  notificationButton: {
    width: LAYOUT.avatarSize.md,
    height: LAYOUT.avatarSize.md,
    backgroundColor: COLORS.primaryUltraLight,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...SHADOWS.subtle,
  },
  
  notificationIcon: {
    fontSize: LAYOUT.iconSize.md,
  },
  
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  
  notificationBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  
  profileButton: {
    width: LAYOUT.avatarSize.md,
    height: LAYOUT.avatarSize.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  
  profileIcon: {
    fontSize: LAYOUT.iconSize.md,
  },
  
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: LAYOUT.inputHeight,
    ...SHADOWS.subtle,
  },
  
  searchIcon: {
    fontSize: LAYOUT.iconSize.md,
    marginRight: SPACING.sm,
    color: COLORS.textMuted,
  },
  
  searchInput: {
    flex: 1,
    fontSize: FONTS.body1,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weightRegular,
  },
  
  clearButton: {
    padding: SPACING.xs,
  },
  
  clearIcon: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  
  filterButton: {
    width: LAYOUT.inputHeight,
    height: LAYOUT.inputHeight,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  
  filterIcon: {
    fontSize: LAYOUT.iconSize.md,
  },
  
  // Security banner styles
  securityBanner: {
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  
  securityBannerGradient: {
    padding: SPACING.md,
    position: 'relative',
  },
  
  securityBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  
  securityBannerIcon: {
    fontSize: LAYOUT.iconSize.lg,
  },
  
  securityBannerText: {
    flex: 1,
  },
  
  securityBannerTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.successDark,
    marginBottom: SPACING.xxs,
  },
  
  securityBannerSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.success,
    lineHeight: FONTS.sm * FONTS.lineHeightNormal,
  },
  
  securityBannerClose: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    padding: SPACING.xs,
  },
  
  securityBannerCloseText: {
    color: COLORS.success,
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
  },
  
  // Content styles
  content: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  
  section: {
    marginBottom: SPACING.xl,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  
  sectionTitle: {
    fontSize: FONTS.h5,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  
  seeAllText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weightSemiBold,
  },
  
  hideText: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    fontWeight: FONTS.weightMedium,
  },
  
  // Quick actions styles
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  
  quickActionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  
  quickActionGradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  
  quickActionIcon: {
    fontSize: LAYOUT.iconSize.xl,
    marginBottom: SPACING.sm,
  },
  
  quickActionIconGradient: {
    fontSize: LAYOUT.iconSize.xl,
    marginBottom: SPACING.sm,
  },
  
  quickActionTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  
  quickActionTitleGradient: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.white,
    textAlign: 'center',
  },
  
  // Categories styles
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  
  categoryCard: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    minWidth: 80,
    ...SHADOWS.light,
  },
  
  selectedCategoryCard: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  
  selectedCategoryIcon: {
    backgroundColor: COLORS.white,
  },
  
  categoryIcon: {
    fontSize: LAYOUT.iconSize.lg,
  },
  
  categoryTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  
  selectedCategoryTitle: {
    color: COLORS.white,
    fontWeight: FONTS.weightSemiBold,
  },
  
  categoryCount: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  
  selectedCategoryCount: {
    color: COLORS.white,
  },
  
  // Services styles
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  
  serviceCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    marginBottom: SPACING.md,
  },
  
  // Demo section
  demoSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  
  demoButton: {
    ...SHADOWS.heavy,
  },
});

export default EnhancedHomeScreen;
