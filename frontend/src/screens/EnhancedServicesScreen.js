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
  Modal,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ServiceCard from '../components/ServiceCard';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT, ANIMATIONS } from '../constants/theme';
import { useAppDispatch, useServices, useAuth } from '../store/hooks';
import { fetchServices, fetchCategories, updateFilters, searchServices } from '../store/slices/servicesSlice';
import * as servicesApi from '../services/servicesApi';

const { width } = Dimensions.get('window');

const EnhancedServicesScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { services, categories, filters } = useServices();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Enhanced categories with icons and colors
  const enhancedCategories = [
    { id: 'all', title: 'All Services', icon: '🏠', color: COLORS.primary },
    { id: 'cleaning', title: 'Cleaning', icon: '🧹', color: COLORS.info },
    { id: 'maintenance', title: 'Home Repair', icon: '🔧', color: COLORS.warning },
    { id: 'landscaping', title: 'Landscaping', icon: '🌱', color: COLORS.success },
    { id: 'plumbing', title: 'Plumbing', icon: '🚿', color: COLORS.info },
    { id: 'electrical', title: 'Electrical', icon: '⚡', color: COLORS.warning },
    { id: 'painting', title: 'Painting', icon: '🎨', color: COLORS.secondary },
    { id: 'moving', title: 'Moving', icon: '📦', color: COLORS.primary },
    { id: 'petcare', title: 'Pet Care', icon: '🐕', color: COLORS.success },
    { id: 'handyman', title: 'Handyman', icon: '🔨', color: COLORS.error },
  ];

  useEffect(() => {
    loadInitialData();
    startAnimations();
  }, []);

  const startAnimations = () => {
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
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load both services and categories
      await Promise.all([
        dispatch(fetchServices(filters)),
        dispatch(fetchCategories())
      ]);
    } catch (error) {
      console.error('❌ Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleServicePress = (service) => {
    navigation.navigate('ServiceDetails', { 
      serviceId: service.id,
      service: service 
    });
  };

  const handleCategoryPress = (category) => {
    const newCategory = selectedCategory === category.id ? null : category.id;
    setSelectedCategory(newCategory);
    
    // Apply category filter with animation
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.7, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  // Enhanced filtering logic
  const getFilteredServices = () => {
    return services.filter(service => {
      // Search filter
      const matchesSearch = !searchQuery || 
        service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = !selectedCategory || 
        selectedCategory === 'all' || 
        service.category?.toLowerCase() === selectedCategory;
      
      // Price filter
      const price = service.startingPrice || service.price || 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      
      // Featured filter
      const matchesFeatured = !showOnlyFeatured || service.featured;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesFeatured;
    });
  };

  const getSortedServices = () => {
    const filtered = getFilteredServices();
    
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price_low':
          return (a.startingPrice || a.price || 0) - (b.startingPrice || b.price || 0);
        case 'price_high':
          return (b.startingPrice || b.price || 0) - (a.startingPrice || a.price || 0);
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'popular':
          return (b.bookingsCount || 0) - (a.bookingsCount || 0);
        default:
          return 0;
      }
    });
  };

  const renderServiceItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.serviceItemContainer,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 50],
            })
          }]
        }
      ]}
    >
      <ServiceCard
        title={item.title}
        icon={item.icon}
        description={item.description}
        rating={item.rating}
        startingPrice={item.startingPrice || item.price}
        featured={item.featured}
        provider={item.provider}
        availability={item.availability}
        tags={item.tags}
        onPress={() => handleServicePress(item)}
        layout={index % 4 === 3 ? 'featured' : 'default'}
        variant={item.featured ? 'featured' : 'default'}
      />
    </Animated.View>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            {[
              { key: 'rating', label: '⭐ Highest Rated' },
              { key: 'price_low', label: '💰 Price: Low to High' },
              { key: 'price_high', label: '💸 Price: High to Low' },
              { key: 'name', label: '🔤 Name (A-Z)' },
              { key: 'newest', label: '🆕 Newest First' },
              { key: 'popular', label: '🔥 Most Popular' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  sortBy === option.key && styles.filterOptionSelected,
                ]}
                onPress={() => setSortBy(option.key)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    sortBy === option.key && styles.filterOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.priceRangeContainer}>
              <Text style={styles.priceRangeLabel}>${priceRange[0]}</Text>
              <Text style={styles.priceRangeLabel}>-</Text>
              <Text style={styles.priceRangeLabel}>${priceRange[1]}</Text>
            </View>
          </View>

          {/* Featured Toggle */}
          <View style={styles.filterSection}>
            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => setShowOnlyFeatured(!showOnlyFeatured)}
            >
              <Text style={styles.filterSectionTitle}>Featured Services Only</Text>
              <View style={[
                styles.toggle,
                showOnlyFeatured && styles.toggleActive
              ]}>
                {showOnlyFeatured && (
                  <Ionicons name="checkmark" size={16} color={COLORS.white} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Apply Button */}
          <CustomButton
            title="Apply Filters"
            variant="primary"
            onPress={() => setShowFilters(false)}
            style={styles.applyButton}
          />
        </View>
      </View>
    </Modal>
  );

  const sortedServices = getSortedServices();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Enhanced Header */}
      <Animated.View 
        style={[
          styles.headerContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <LinearGradient
          colors={COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Find Services</Text>
              <Text style={styles.headerSubtitle}>
                {sortedServices.length} services available
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="options-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <CustomInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search services..."
              variant="filled"
              leftIcon={<Ionicons name="search" size={20} color={COLORS.textSecondary} />}
              rightIcon={searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ) : null}
              style={styles.searchInput}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Categories */}
      <Animated.View
        style={[
          styles.categoriesSection,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {enhancedCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip,
                { borderColor: category.color }
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryTitle,
                  selectedCategory === category.id && {
                    color: COLORS.white,
                    fontWeight: FONTS.weightBold
                  }
                ]}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Services Grid */}
      <FlatList
        data={sortedServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.serviceRow}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No services found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your filters or search terms
            </Text>
          </View>
        )}
      />

      <FilterModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Enhanced Header
  headerContainer: {
    overflow: 'hidden',
  },

  headerGradient: {
    paddingBottom: SPACING.xl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: FONTS.h1,
    fontWeight: FONTS.weightExtraBold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },

  headerSubtitle: {
    fontSize: FONTS.body2,
    color: COLORS.white + 'CC',
    fontWeight: FONTS.weightMedium,
  },

  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Search Container
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },

  searchInput: {
    backgroundColor: COLORS.white,
  },

  // Categories
  categoriesSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },

  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },

  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryIcon: {
    fontSize: FONTS.lg,
    marginRight: SPACING.sm,
  },

  categoryTitle: {
    fontSize: FONTS.body3,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
  },

  // Services List
  servicesList: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },

  serviceRow: {
    justifyContent: 'space-between',
  },

  serviceItemContainer: {
    flex: 0.48,
    marginBottom: SPACING.lg,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  modalTitle: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },

  filterSection: {
    marginBottom: SPACING.xl,
  },

  filterSectionTitle: {
    fontSize: FONTS.body1,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterOptionSelected: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },

  filterOptionText: {
    fontSize: FONTS.body2,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weightMedium,
  },

  filterOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: FONTS.weightBold,
  },

  // Price Range
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },

  priceRangeLabel: {
    fontSize: FONTS.body1,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },

  // Toggle
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  toggleActive: {
    backgroundColor: COLORS.primary,
  },

  applyButton: {
    marginTop: SPACING.lg,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },

  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },

  emptyStateTitle: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },

  emptyStateSubtitle: {
    fontSize: FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONTS.body2 * FONTS.lineHeightNormal,
  },
});

export default EnhancedServicesScreen;
