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
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import theme from '../constants/modernTheme';
import ModernCard, { CardBody, CardFooter } from '../components/modern/ModernCard';
import ModernButton from '../components/modern/ModernButton';
import ModernInput from '../components/modern/ModernInput';
import { useAppDispatch, useServices, useAuth } from '../store/hooks';
import { fetchServices, fetchCategories, searchServices } from '../store/slices/servicesSlice';

const { width } = Dimensions.get('window');

const ModernServicesScreen = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { services, categories, loading } = useServices();
  const auth = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.category || null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('rating');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Initialize animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.duration.normal,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Load data
    dispatch(fetchServices());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchServices());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleServicePress = (service) => {
    navigation.navigate('ServiceDetails', { 
      serviceId: service._id || service.id,
      service: service 
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      dispatch(searchServices({ query, filters: getActiveFilters() }));
    }
  };

  const getActiveFilters = () => ({
    category: selectedCategory,
    sortBy,
    priceRange,
    featured: showOnlyFeatured,
  });

  const getFilteredServices = () => {
    let filtered = [...services];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(service =>
        service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(service => 
        service.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Featured filter
    if (showOnlyFeatured) {
      filtered = filtered.filter(service => service.featured);
    }

    // Price filter
    filtered = filtered.filter(service => {
      const price = parseFloat(service.startingPrice || service.price || 0);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    filtered.sort((a, b) => {
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
        default:
          return 0;
      }
    });

    return filtered;
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        { opacity: fadeAnim }
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
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text.inverse} />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {selectedCategory ? `${selectedCategory} Services` : 'All Services'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {getFilteredServices().length} services available
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.viewToggleButton}
                onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                <Ionicons 
                  name={viewMode === 'grid' ? 'list' : 'grid'} 
                  size={20} 
                  color={theme.colors.text.inverse} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowFilters(true)}
              >
                <Ionicons name="options-outline" size={20} color={theme.colors.text.inverse} />
                {(selectedCategory || showOnlyFeatured || sortBy !== 'rating') && (
                  <View style={styles.filterBadge} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchSection}>
            <ModernInput
              placeholder="Search services..."
              value={searchQuery}
              onChangeText={handleSearch}
              leftIcon="search-outline"
              rightIcon={searchQuery ? "close-circle" : null}
              rightIconOnPress={() => setSearchQuery('')}
              variant="filled"
              style={styles.searchInput}
            />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderCategories = () => (
    <Animated.View 
      style={[
        styles.categoriesSection,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.categoryChipActive
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[
            styles.categoryChipText,
            !selectedCategory && styles.categoryChipTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>

        {renderCategoryChips()}
      </ScrollView>
    </Animated.View>
  );

  const renderCategoryChips = () => {
    const categoryData = [
      { id: 'cleaning', name: 'Cleaning', icon: 'home-outline' },
      { id: 'plumbing', name: 'Plumbing', icon: 'water-outline' },
      { id: 'electrical', name: 'Electrical', icon: 'flash-outline' },
      { id: 'gardening', name: 'Gardening', icon: 'leaf-outline' },
      { id: 'handyman', name: 'Handyman', icon: 'hammer-outline' },
      { id: 'painting', name: 'Painting', icon: 'brush-outline' },
    ];

    return categoryData.map((category) => (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryChip,
          selectedCategory === category.id && styles.categoryChipActive
        ]}
        onPress={() => setSelectedCategory(
          selectedCategory === category.id ? null : category.id
        )}
      >
        <Ionicons 
          name={category.icon} 
          size={16} 
          color={selectedCategory === category.id 
            ? theme.colors.text.inverse 
            : theme.colors.text.secondary
          }
          style={styles.categoryChipIcon}
        />
        <Text style={[
          styles.categoryChipText,
          selectedCategory === category.id && styles.categoryChipTextActive
        ]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderServiceCard = ({ item, index }) => {
    const isEven = index % 2 === 0;
    
    if (viewMode === 'list') {
      return (
        <Animated.View
          style={[
            styles.listServiceContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ModernCard
            onPress={() => handleServicePress(item)}
            pressable
            variant="elevated"
            shadow="sm"
            padding="md"
            style={styles.listServiceCard}
          >
            <View style={styles.listServiceContent}>
              <View style={styles.listServiceImage}>
                <Text style={styles.serviceEmoji}>{item.icon || '🏠'}</Text>
              </View>
              
              <View style={styles.listServiceDetails}>
                <Text style={styles.listServiceTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.listServiceDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                
                <View style={styles.listServiceMeta}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
                    <Text style={styles.ratingText}>{item.rating || 4.8}</Text>
                  </View>
                  
                  {item.featured && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>Popular</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.listServicePrice}>
                  {item.startingPrice ? `$${item.startingPrice}` : 'Get Quote'}
                </Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </View>
          </ModernCard>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.gridServiceContainer,
          { marginRight: isEven ? theme.spacing[2] : 0 },
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ModernCard
          onPress={() => handleServicePress(item)}
          pressable
          variant="elevated"
          shadow="md"
          padding="lg"
          style={styles.gridServiceCard}
        >
          <CardBody>
            <View style={styles.serviceImagePlaceholder}>
              <Text style={styles.serviceEmoji}>{item.icon || '🏠'}</Text>
              {item.featured && (
                <View style={styles.gridFeaturedBadge}>
                  <Text style={styles.featuredBadgeText}>Popular</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.serviceTitle} numberOfLines={2}>
              {item.title}
            </Text>
            
            <Text style={styles.serviceDescription} numberOfLines={3}>
              {item.description}
            </Text>
          </CardBody>
          
          <CardFooter>
            <View style={styles.serviceFooter}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
                <Text style={styles.ratingText}>{item.rating || 4.8}</Text>
              </View>
              
              <Text style={styles.priceText}>
                {item.startingPrice ? `$${item.startingPrice}` : 'Quote'}
              </Text>
            </View>
          </CardFooter>
        </ModernCard>
      </Animated.View>
    );
  };

  const renderServicesList = () => {
    const filteredServices = getFilteredServices();

    if (viewMode === 'grid') {
      return (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id || item._id}
          numColumns={2}
          contentContainerStyle={styles.servicesGrid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary[500]]}
              tintColor={theme.colors.primary[500]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      );
    }

    return (
      <FlatList
        data={filteredServices}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.servicesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🔍</Text>
      <Text style={styles.emptyStateTitle}>No services found</Text>
      <Text style={styles.emptyStateDescription}>
        Try adjusting your search or filters to find more services.
      </Text>
      <ModernButton
        title="Clear Filters"
        variant="outline"
        size="md"
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory(null);
          setShowOnlyFeatured(false);
          setSortBy('rating');
        }}
        style={styles.clearFiltersButton}
      />
    </View>
  );

  const renderFiltersModal = () => (
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
              <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              {[
                { key: 'rating', label: 'Highest Rated', icon: 'star-outline' },
                { key: 'price_low', label: 'Price: Low to High', icon: 'arrow-up-outline' },
                { key: 'price_high', label: 'Price: High to Low', icon: 'arrow-down-outline' },
                { key: 'name', label: 'Name (A-Z)', icon: 'text-outline' },
                { key: 'newest', label: 'Newest First', icon: 'time-outline' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    sortBy === option.key && styles.filterOptionSelected,
                  ]}
                  onPress={() => setSortBy(option.key)}
                >
                  <View style={styles.filterOptionContent}>
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={sortBy === option.key 
                        ? theme.colors.primary[500] 
                        : theme.colors.text.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.filterOptionText,
                        sortBy === option.key && styles.filterOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {sortBy === option.key && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary[500]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Min</Text>
                  <TouchableOpacity style={styles.priceInput}>
                    <Text style={styles.priceInputText}>${priceRange[0]}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.priceSeparator}>to</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Max</Text>
                  <TouchableOpacity style={styles.priceInput}>
                    <Text style={styles.priceInputText}>${priceRange[1]}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Featured Toggle */}
            <View style={styles.filterSection}>
              <TouchableOpacity
                style={styles.toggleOption}
                onPress={() => setShowOnlyFeatured(!showOnlyFeatured)}
              >
                <View style={styles.toggleContent}>
                  <Ionicons
                    name="star-outline"
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                  <Text style={styles.toggleText}>Show only featured services</Text>
                </View>
                <View style={[
                  styles.toggle,
                  showOnlyFeatured && styles.toggleActive
                ]}>
                  {showOnlyFeatured && (
                    <Ionicons name="checkmark" size={16} color={theme.colors.text.inverse} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <ModernButton
              title="Reset"
              variant="outline"
              size="md"
              onPress={() => {
                setSortBy('rating');
                setPriceRange([0, 500]);
                setShowOnlyFeatured(false);
              }}
              style={styles.resetButton}
            />
            <ModernButton
              title="Apply Filters"
              variant="primary"
              size="md"
              onPress={() => setShowFilters(false)}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary[600]}
        translucent={Platform.OS === 'android'}
      />
      
      {renderHeader()}
      {renderCategories()}
      
      <View style={styles.content}>
        {renderServicesList()}
      </View>
      
      {renderFiltersModal()}
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
  },
  
  headerContent: {
    paddingHorizontal: theme.spacing[5],
  },
  
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  
  backButton: {
    marginRight: theme.spacing[4],
    padding: theme.spacing[2],
  },
  
  headerTitleContainer: {
    flex: 1,
  },
  
  headerTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weight.bold,
    marginBottom: theme.spacing[1],
  },
  
  headerSubtitle: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.inverse,
    opacity: 0.8,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  
  viewToggleButton: {
    padding: theme.spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.md,
  },
  
  filterButton: {
    position: 'relative',
    padding: theme.spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.md,
  },
  
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: theme.colors.warning[500],
    borderRadius: theme.borderRadius.full,
  },
  
  searchSection: {
    marginTop: theme.spacing[2],
  },
  
  searchInput: {
    backgroundColor: theme.colors.surface.primary,
    borderWidth: 0,
  },
  
  // Categories Section
  categoriesSection: {
    backgroundColor: theme.colors.surface.primary,
    marginTop: -theme.spacing[4],
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[4],
    ...theme.shadows.sm,
  },
  
  categoriesContainer: {
    paddingHorizontal: theme.spacing[5],
    gap: theme.spacing[2],
  },
  
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    minWidth: 80,
    maxWidth: 120,
    height: 36,
    flexShrink: 0,
    justifyContent: 'center',
  },
  
  categoryChipActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  
  categoryChipIcon: {
    marginRight: theme.spacing[1],
  },
  
  categoryChipText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weight.medium,
  },
  
  categoryChipTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weight.semiBold,
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Grid View
  servicesGrid: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[10],
  },
  
  gridServiceContainer: {
    flex: 0.5,
    marginBottom: theme.spacing[4],
  },
  
  gridServiceCard: {
    height: 280,
  },
  
  serviceImagePlaceholder: {
    height: 100,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
    position: 'relative',
  },
  
  serviceEmoji: {
    fontSize: 32,
  },
  
  gridFeaturedBadge: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    backgroundColor: theme.colors.warning[500],
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
  },
  
  serviceTitle: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semiBold,
    marginBottom: theme.spacing[2],
    minHeight: 44,
  },
  
  serviceDescription: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.snug * theme.typography.size.sm,
    flex: 1,
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
  
  // List View
  servicesList: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[10],
  },
  
  listServiceContainer: {
    marginBottom: theme.spacing[3],
  },
  
  listServiceCard: {
    // Card styling handled by ModernCard
  },
  
  listServiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  listServiceImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[4],
  },
  
  listServiceDetails: {
    flex: 1,
  },
  
  listServiceTitle: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.semiBold,
    marginBottom: theme.spacing[1],
  },
  
  listServiceDescription: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  
  listServiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  
  listServicePrice: {
    ...theme.typography.styles.body1,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weight.bold,
  },
  
  featuredBadge: {
    backgroundColor: theme.colors.warning[500],
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[0.5],
    marginLeft: theme.spacing[3],
  },
  
  featuredBadgeText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.weight.bold,
    fontSize: 10,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[8],
    paddingVertical: theme.spacing[12],
  },
  
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },
  
  emptyStateTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.bold,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  
  emptyStateDescription: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.size.sm,
    marginBottom: theme.spacing[6],
  },
  
  clearFiltersButton: {
    minWidth: 140,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay.dark,
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: theme.colors.surface.primary,
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    maxHeight: '80%',
    paddingBottom: theme.layout.safeArea.bottom,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  
  modalTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.bold,
  },
  
  modalBody: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
  },
  
  filterSection: {
    paddingVertical: theme.spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  
  filterSectionTitle: {
    ...theme.typography.styles.h6,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.bold,
    marginBottom: theme.spacing[4],
  },
  
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[2],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  filterOptionSelected: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
  },
  
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  
  filterOptionText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.medium,
  },
  
  filterOptionTextSelected: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.weight.semiBold,
  },
  
  // Price Range
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
  },
  
  priceInputContainer: {
    flex: 1,
  },
  
  priceLabel: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  
  priceInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.surface.secondary,
  },
  
  priceInputText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.medium,
    textAlign: 'center',
  },
  
  priceSeparator: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[6],
  },
  
  // Toggle
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
  },
  
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  
  toggleText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.medium,
  },
  
  toggle: {
    width: 50,
    height: 28,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.border.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  toggleActive: {
    backgroundColor: theme.colors.primary[500],
  },
  
  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[5],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
  },
  
  resetButton: {
    flex: 1,
  },
  
  applyButton: {
    flex: 2,
  },
});

export default ModernServicesScreen;
