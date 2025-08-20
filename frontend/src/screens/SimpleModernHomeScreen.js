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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import theme from '../constants/modernTheme';
import ModernCard from '../components/modern/ModernCard';
import ModernButton from '../components/modern/ModernButton';
import ModernInput from '../components/modern/ModernInput';

const { width } = Dimensions.get('window');

const SimpleModernHomeScreen = ({ navigation }) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Fallback data
  const fallbackUser = { name: 'Welcome User', email: 'user@example.com' };
  const fallbackStats = { totalBookings: 12, completedServices: 8, avgRating: 4.8 };

  useEffect(() => {
    // Initialize animations
    Animated.stagger(100, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
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
                {fallbackUser.name}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
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
                    {fallbackUser.name.charAt(0).toUpperCase()}
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
          padding="md"
          style={styles.statCard}
        >
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{fallbackStats.totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
        </ModernCard>

        <ModernCard
          variant="elevated"
          padding="md"
          style={styles.statCard}
        >
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{fallbackStats.completedServices}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </ModernCard>

        <ModernCard
          variant="elevated"
          padding="md"
          style={styles.statCard}
        >
          <View style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="star-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{fallbackStats.avgRating}</Text>
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
      { id: 'cleaning', name: 'Cleaning', icon: 'home-outline', color: '#3B82F6' },
      { id: 'plumbing', name: 'Plumbing', icon: 'water-outline', color: '#06B6D4' },
      { id: 'electrical', name: 'Electrical', icon: 'flash-outline', color: '#F59E0B' },
      { id: 'gardening', name: 'Gardening', icon: 'leaf-outline', color: '#10B981' },
      { id: 'handyman', name: 'Handyman', icon: 'hammer-outline', color: '#8B5CF6' },
      { id: 'painting', name: 'Painting', icon: 'brush-outline', color: '#EF4444' },
    ];

    return categoryData.map((category, index) => (
      <ModernCard
        key={category.id}
        onPress={() => navigation.navigate('Services', { category: category.id })}
        pressable
        variant="elevated"
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
            onPress={() => Alert.alert('Support', 'Contact support feature coming soon!')}
            style={styles.secondaryActionButton}
          />
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#3B82F6"
        translucent={false}
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
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        {renderQuickStats()}
        {renderCategories()}
        {renderQuickActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header Styles
  header: {
    position: 'relative',
    overflow: 'hidden',
  },
  
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 20,
    position: 'relative',
  },
  
  headerContent: {
    paddingHorizontal: 20,
    zIndex: 2,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  welcomeSection: {
    flex: 1,
  },
  
  welcomeText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  
  userNameText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  profileButton: {
    padding: 4,
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  
  searchSection: {
    marginTop: 16,
  },
  
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    marginBottom: 0,
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
    marginTop: 0,
  },
  
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 120,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  
  seeAllButton: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  
  // Quick Stats
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
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
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  statValue: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Categories
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  
  categoryCard: {
    alignItems: 'center',
    minWidth: 80,
  },
  
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  categoryName: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  
  primaryActionButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  secondaryActionButton: {
    flex: 1,
  },
});

export default SimpleModernHomeScreen;
