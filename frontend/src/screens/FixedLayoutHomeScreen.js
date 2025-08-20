import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchServices, fetchCategories } from '../store/slices/servicesSlice';
import { fetchUserBookings } from '../store/slices/bookingSlice';
import { fetchProfile } from '../store/slices/userSlice';
import { getIconProps } from '../utils/iconMapper';

const { width, height } = Dimensions.get('window');

// Simple card component without complex theming
const SimpleCard = ({ children, style, onPress }) => (
  <TouchableOpacity
    style={[
      {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      style,
    ]}
    onPress={onPress}
    disabled={!onPress}
  >
    {children}
  </TouchableOpacity>
);

// Simple input component
const SimpleInput = ({ placeholder, value, onChangeText, style }) => (
  <View style={[
    {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    style,
  ]}>
    <Ionicons name="search-outline" size={20} color="#94A3B8" style={{ marginRight: 12 }} />
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={{ flex: 1, fontSize: 16, color: '#1F2937' }}
      placeholderTextColor="#94A3B8"
    />
  </View>
);

const FixedLayoutHomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  // Get data from Redux store
  const auth = useSelector((state) => state.auth);
  const bookings = useSelector((state) => state.booking?.bookings || []);
  const services = useSelector((state) => state.services);
  const userProfile = useSelector((state) => state.user?.profile);
  const isLoading = useSelector((state) => state.services.loading || state.booking.loading || state.user.loading);

  // Calculate dynamic stats from real data
  const completedBookings = bookings.filter(booking => booking.status === 'completed').length;
  const totalBookings = bookings.length;
  const avgRating = userProfile?.averageRating || 4.8;
  const stats = { 
    totalBookings: totalBookings || 0, 
    completedServices: completedBookings || 0, 
    avgRating: avgRating 
  };

  // Use dynamic categories or fallback to static ones
  const dynamicCategories = services.categories?.length > 0 ? services.categories.map(cat => ({
    id: cat.id || cat._id || cat.slug,
    name: cat.name || cat.title,
    icon: getIconProps(cat.icon || cat.emoji || 'home-outline'),
    color: cat.color || '#3B82F6'
  })) : [
    { id: 'cleaning', name: 'Cleaning', icon: 'home-outline', color: '#3B82F6' },
    { id: 'plumbing', name: 'Plumbing', icon: 'water-outline', color: '#06B6D4' },
    { id: 'electrical', name: 'Electrical', icon: 'flash-outline', color: '#F59E0B' },
    { id: 'gardening', name: 'Gardening', icon: 'leaf-outline', color: '#10B981' },
  ];

  // Get user name for display
  const userName = auth.user?.name || userProfile?.name || 'Welcome User';
  const firstName = userName.split(' ')[0];

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🏠 Initializing Home Screen data...');
        
        // Fetch user profile if authenticated
        if (auth.isAuthenticated && auth.token) {
          dispatch(fetchProfile());
        }
        
        // Fetch services and categories
        dispatch(fetchServices());
        dispatch(fetchCategories());
        
        // Fetch user bookings if authenticated
        if (auth.isAuthenticated) {
          dispatch(fetchUserBookings());
        }
        
        console.log('✅ Home Screen data initialization completed');
      } catch (error) {
        console.error('❌ Error initializing Home Screen data:', error);
      }
    };

    initializeData();
  }, [dispatch, auth.isAuthenticated, auth.token]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Services', { 
        screen: 'ServicesMain',
        params: { searchQuery: searchQuery.trim() }
      });
    }
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('Services', {
      screen: 'ServicesMain',
      params: { category: category.id }
    });
  };

  const handleBookService = () => {
    navigation.navigate('Services');
  };

  const handleMyBookings = () => {
    navigation.navigate('Bookings');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact support at support@homeaze.com or call 1-800-HOMEAZE');
  };

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
            <View style={styles.headerTop}>
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Good Morning</Text>
                <Text style={styles.userNameText}>{firstName}</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color="#94A3B8" />
                <TextInput
                  placeholder="Search services..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  style={styles.searchInput}
                  placeholderTextColor="#94A3B8"
                  returnKeyType="search"
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.section}>
          <View style={styles.statsContainer}>
            <SimpleCard style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={[styles.statIcon, { backgroundColor: '#3B82F620' }]}>
                  <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>{stats.totalBookings}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
              </View>
            </SimpleCard>

            <SimpleCard style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{stats.completedServices}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </SimpleCard>

            <SimpleCard style={styles.statCard}>
              <View style={styles.statContent}>
                <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="star-outline" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>{stats.avgRating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </SimpleCard>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <View style={styles.categoriesContainer}>
              {dynamicCategories.map((category) => (
                <SimpleCard 
                  key={category.id} 
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={styles.categoryContent}>
                    <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                      <Ionicons name={category.icon} size={28} color={category.color} />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                </SimpleCard>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBookService}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.buttonGradient}>
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Book Service</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleMyBookings}>
              <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
              <Text style={styles.secondaryButtonText}>My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleSupport}>
              <Ionicons name="help-circle-outline" size={18} color="#3B82F6" />
              <Text style={styles.secondaryButtonText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  
  searchContainer: {
    marginTop: 4,
  },
  
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  
  content: {
    flex: 1,
  },
  
  section: {
    marginBottom: 24,
    paddingTop: 20,
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
  
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  
  statCard: {
    flex: 1,
    alignItems: 'center',
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
    fontSize: 18,
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  categoriesScroll: {
    paddingLeft: 20,
  },
  
  categoriesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  
  categoryCard: {
    width: 80,
    alignItems: 'center',
  },
  
  categoryContent: {
    alignItems: 'center',
  },
  
  categoryIcon: {
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
  
  primaryButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  
  primaryButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  secondaryActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  
  secondaryButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default FixedLayoutHomeScreen;
