import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppDispatch } from '../store/hooks';
import ServicesAPI from '../services/servicesApi';

const AdvancedSearchScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: 200 },
    location: '',
    radius: 25, // miles
    rating: 0,
    availability: 'any', // any, today, this-week, this-month
    sortBy: 'relevance', // relevance, price-low, price-high, rating, distance
  });

  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);

  const serviceCategories = [
    { id: 'cleaning', name: 'Cleaning', icon: '🧹', count: 24 },
    { id: 'maintenance', name: 'Home Maintenance', icon: '🔧', count: 18 },
    { id: 'landscaping', name: 'Landscaping', icon: '🌱', count: 15 },
    { id: 'plumbing', name: 'Plumbing', icon: '🚿', count: 12 },
    { id: 'electrical', name: 'Electrical', icon: '⚡', count: 10 },
    { id: 'painting', name: 'Painting', icon: '🎨', count: 8 },
    { id: 'moving', name: 'Moving', icon: '📦', count: 6 },
    { id: 'petcare', name: 'Pet Care', icon: '🐕', count: 5 },
  ];

  useEffect(() => {
    loadPopularCategories();
    loadRecentSearches();
  }, []);

  const loadPopularCategories = async () => {
    try {
      // In real app, would fetch from API
      setPopularCategories(serviceCategories.slice(0, 6));
    } catch (error) {
      console.error('❌ Error loading popular categories:', error);
    }
  };

  const loadRecentSearches = async () => {
    try {
      // In real app, would load from local storage or API
      setRecentSearches([
        'House cleaning',
        'Plumbing repair',
        'Garden maintenance',
        'Interior painting',
      ]);
    } catch (error) {
      console.error('❌ Error loading recent searches:', error);
    }
  };

  const performSearch = async (query = searchQuery, searchFilters = appliedFilters) => {
    if (!query.trim() && searchFilters.categories.length === 0) return;

    try {
      setLoading(true);
      
      // Simulate API call with filters
      const searchParams = {
        q: query.trim(),
        categories: searchFilters.categories,
        minPrice: searchFilters.priceRange.min,
        maxPrice: searchFilters.priceRange.max,
        location: searchFilters.location,
        radius: searchFilters.radius,
        rating: searchFilters.rating,
        availability: searchFilters.availability,
        sortBy: searchFilters.sortBy,
      };

      console.log('🔍 Searching with params:', searchParams);
      
      // Simulate API delay
      setTimeout(() => {
        setSearchResults(mockSearchResults);
        setLoading(false);
        
        // Add to recent searches
        if (query.trim() && !recentSearches.includes(query.trim())) {
          setRecentSearches(prev => [query.trim(), ...prev.slice(0, 9)]);
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Error performing search:', error);
      setSearchResults([]);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setShowFilters(false);
    performSearch(searchQuery, filters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      categories: [],
      priceRange: { min: 0, max: 200 },
      location: '',
      radius: 25,
      rating: 0,
      availability: 'any',
      sortBy: 'relevance',
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    performSearch(searchQuery, defaultFilters);
  };

  const toggleCategory = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (appliedFilters.categories.length > 0) count++;
    if (appliedFilters.priceRange.min > 0 || appliedFilters.priceRange.max < 200) count++;
    if (appliedFilters.location.length > 0) count++;
    if (appliedFilters.rating > 0) count++;
    if (appliedFilters.availability !== 'any') count++;
    if (appliedFilters.sortBy !== 'relevance') count++;
    return count;
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search services..."
          placeholderTextColor={COLORS.textMuted}
          onSubmitEditing={() => performSearch()}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <Text style={styles.filterIcon}>⚙️</Text>
        {getActiveFiltersCount() > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderQuickFilters = () => (
    <View style={styles.quickFiltersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.quickFilter,
            appliedFilters.sortBy === 'price-low' && styles.quickFilterActive
          ]}
          onPress={() => {
            const newFilters = { ...appliedFilters, sortBy: 'price-low' };
            setAppliedFilters(newFilters);
            performSearch(searchQuery, newFilters);
          }}
        >
          <Text style={[
            styles.quickFilterText,
            appliedFilters.sortBy === 'price-low' && styles.quickFilterTextActive
          ]}>
            💰 Lowest Price
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickFilter,
            appliedFilters.rating >= 4 && styles.quickFilterActive
          ]}
          onPress={() => {
            const newFilters = { ...appliedFilters, rating: appliedFilters.rating >= 4 ? 0 : 4 };
            setAppliedFilters(newFilters);
            performSearch(searchQuery, newFilters);
          }}
        >
          <Text style={[
            styles.quickFilterText,
            appliedFilters.rating >= 4 && styles.quickFilterTextActive
          ]}>
            ⭐ 4+ Stars
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickFilter,
            appliedFilters.availability === 'today' && styles.quickFilterActive
          ]}
          onPress={() => {
            const newFilters = { 
              ...appliedFilters, 
              availability: appliedFilters.availability === 'today' ? 'any' : 'today' 
            };
            setAppliedFilters(newFilters);
            performSearch(searchQuery, newFilters);
          }}
        >
          <Text style={[
            styles.quickFilterText,
            appliedFilters.availability === 'today' && styles.quickFilterTextActive
          ]}>
            📅 Available Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickFilter,
            appliedFilters.radius <= 10 && styles.quickFilterActive
          ]}
          onPress={() => {
            const newFilters = { ...appliedFilters, radius: appliedFilters.radius <= 10 ? 25 : 10 };
            setAppliedFilters(newFilters);
            performSearch(searchQuery, newFilters);
          }}
        >
          <Text style={[
            styles.quickFilterText,
            appliedFilters.radius <= 10 && styles.quickFilterTextActive
          ]}>
            📍 Nearby
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderPopularCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔥 Popular Categories</Text>
      <View style={styles.categoriesGrid}>
        {popularCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              appliedFilters.categories.includes(category.id) && styles.categoryCardActive
            ]}
            onPress={() => {
              const newFilters = {
                ...appliedFilters,
                categories: appliedFilters.categories.includes(category.id)
                  ? appliedFilters.categories.filter(id => id !== category.id)
                  : [...appliedFilters.categories, category.id]
              };
              setAppliedFilters(newFilters);
              performSearch(searchQuery, newFilters);
            }}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryName,
              appliedFilters.categories.includes(category.id) && styles.categoryNameActive
            ]}>
              {category.name}
            </Text>
            <Text style={[
              styles.categoryCount,
              appliedFilters.categories.includes(category.id) && styles.categoryCountActive
            ]}>
              {category.count} services
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecentSearches = () => {
    if (recentSearches.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕐 Recent Searches</Text>
        <View style={styles.recentSearches}>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => {
                setSearchQuery(search);
                performSearch(search);
              }}
            >
              <Text style={styles.recentSearchIcon}>🔍</Text>
              <Text style={styles.recentSearchText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (searchResults.length === 0 && (searchQuery || appliedFilters.categories.length > 0)) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>No results found</Text>
          <Text style={styles.emptyStateSubtitle}>
            Try adjusting your search terms or filters
          </Text>
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🎯 Search Results ({searchResults.length})
        </Text>
        <FlatList
          data={searchResults}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderServiceCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetails', { serviceId: item.id })}
    >
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceIcon}>{item.icon}</Text>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.providerName}>by {item.providerName}</Text>
          <View style={styles.serviceRating}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
            <Text style={styles.reviewsCount}>({item.reviewsCount} reviews)</Text>
            <Text style={styles.serviceDistance}>• {item.distance} mi</Text>
          </View>
        </View>
        <View style={styles.servicePricing}>
          <Text style={styles.servicePrice}>${item.price}</Text>
          <Text style={styles.servicePriceUnit}>/hr</Text>
        </View>
      </View>
      
      <Text style={styles.serviceDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.serviceFooter}>
        <View style={styles.serviceTags}>
          {item.tags?.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.serviceAvailability}>
          {item.availability}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={applyFilters}>
            <Text style={styles.modalApplyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Categories */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Categories</Text>
            <View style={styles.categoriesFilterGrid}>
              {serviceCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryFilterItem,
                    filters.categories.includes(category.id) && styles.categoryFilterItemActive
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <Text style={styles.categoryFilterIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryFilterText,
                    filters.categories.includes(category.id) && styles.categoryFilterTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price Range (per hour)</Text>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Min</Text>
                <TextInput
                  style={styles.priceValue}
                  value={filters.priceRange.min.toString()}
                  onChangeText={(value) => 
                    setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, min: parseInt(value) || 0 }
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <Text style={styles.priceSeparator}>-</Text>
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Max</Text>
                <TextInput
                  style={styles.priceValue}
                  value={filters.priceRange.max.toString()}
                  onChangeText={(value) => 
                    setFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: parseInt(value) || 200 }
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="200"
                />
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Location</Text>
            <TextInput
              style={styles.locationInput}
              value={filters.location}
              onChangeText={(location) => setFilters(prev => ({ ...prev, location }))}
              placeholder="Enter city, zip code, or address"
              placeholderTextColor={COLORS.textMuted}
            />
            
            <Text style={styles.radiusLabel}>Search Radius</Text>
            <View style={styles.radiusOptions}>
              {[5, 10, 25, 50].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusOption,
                    filters.radius === radius && styles.radiusOptionActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, radius }))}
                >
                  <Text style={[
                    styles.radiusOptionText,
                    filters.radius === radius && styles.radiusOptionTextActive
                  ]}>
                    {radius} mi
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
            <View style={styles.ratingOptions}>
              {[0, 3, 4, 4.5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingOption,
                    filters.rating === rating && styles.ratingOptionActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, rating }))}
                >
                  <Text style={[
                    styles.ratingOptionText,
                    filters.rating === rating && styles.ratingOptionTextActive
                  ]}>
                    {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Availability */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Availability</Text>
            <View style={styles.availabilityOptions}>
              {[
                { key: 'any', label: 'Any time' },
                { key: 'today', label: 'Today' },
                { key: 'this-week', label: 'This week' },
                { key: 'this-month', label: 'This month' },
              ].map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.availabilityOption,
                    filters.availability === key && styles.availabilityOptionActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, availability: key }))}
                >
                  <Text style={[
                    styles.availabilityOptionText,
                    filters.availability === key && styles.availabilityOptionTextActive
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.sortOptions}>
              {[
                { key: 'relevance', label: 'Relevance' },
                { key: 'price-low', label: 'Price: Low to High' },
                { key: 'price-high', label: 'Price: High to Low' },
                { key: 'rating', label: 'Highest Rated' },
                { key: 'distance', label: 'Distance' },
              ].map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.sortOption,
                    filters.sortBy === key && styles.sortOptionActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, sortBy: key }))}
                >
                  <Text style={[
                    styles.sortOptionText,
                    filters.sortBy === key && styles.sortOptionTextActive
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.clearFiltersModalButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersModalButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Services</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Search Bar */}
        {renderSearchBar()}

        {/* Quick Filters */}
        {renderQuickFilters()}

        {/* Search Results or Discover Content */}
        {searchQuery || appliedFilters.categories.length > 0 || getActiveFiltersCount() > 0 ? (
          renderSearchResults()
        ) : (
          <>
            {renderPopularCategories()}
            {renderRecentSearches()}
          </>
        )}
      </ScrollView>

      {renderFiltersModal()}
    </SafeAreaView>
  );
};

// Mock search results
const mockSearchResults = [
  {
    id: '1',
    name: 'Professional House Cleaning',
    providerName: 'Sarah Johnson',
    icon: '🧹',
    rating: 4.9,
    reviewsCount: 127,
    price: 25,
    distance: 2.3,
    description: 'Thorough cleaning service for homes and apartments. Eco-friendly products available.',
    availability: 'Available today',
    tags: ['Eco-friendly', 'Insured'],
  },
  {
    id: '2',
    name: 'Expert Plumbing Services',
    providerName: 'Mike Chen',
    icon: '🔧',
    rating: 4.8,
    reviewsCount: 89,
    price: 45,
    distance: 1.8,
    description: 'Licensed plumber with 10+ years experience. Emergency services available.',
    availability: 'Available tomorrow',
    tags: ['Licensed', '24/7 Emergency'],
  },
  {
    id: '3',
    name: 'Garden Care & Maintenance',
    providerName: 'Emily Davis',
    icon: '🌱',
    rating: 4.7,
    reviewsCount: 64,
    price: 30,
    distance: 3.1,
    description: 'Complete garden maintenance including lawn care, pruning, and landscaping.',
    availability: 'Available this week',
    tags: ['Organic', 'Equipment included'],
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
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 60,
  },

  // Content
  scrollContent: {
    flex: 1,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    fontSize: FONTS.md,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  clearIcon: {
    fontSize: FONTS.md,
    color: COLORS.textMuted,
    padding: SPACING.xs,
  },
  filterButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    position: 'relative',
  },
  filterIcon: {
    fontSize: FONTS.md,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },

  // Quick Filters
  quickFiltersContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  quickFilter: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  quickFilterActive: {
    backgroundColor: COLORS.primary,
  },
  quickFilterText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weightMedium,
  },
  quickFilterTextActive: {
    color: COLORS.white,
  },

  // Sections
  section: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  categoryCardActive: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  categoryName: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: COLORS.primary,
  },
  categoryCount: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  categoryCountActive: {
    color: COLORS.primary,
  },

  // Recent Searches
  recentSearches: {
    gap: SPACING.sm,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  recentSearchIcon: {
    fontSize: FONTS.md,
    marginRight: SPACING.sm,
  },
  recentSearchText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
  },

  // Service Cards
  serviceCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  serviceIcon: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  providerName: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.sm,
    color: COLORS.warning,
    marginRight: SPACING.xs,
  },
  reviewsCount: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  serviceDistance: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  servicePricing: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  servicePriceUnit: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  serviceDescription: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTags: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  serviceTag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  serviceTagText: {
    fontSize: FONTS.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weightBold,
  },
  serviceAvailability: {
    fontSize: FONTS.xs,
    color: COLORS.success,
    fontWeight: FONTS.weightMedium,
  },

  // Loading & Empty States
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  clearFiltersButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },

  // Filter Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCancelText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  modalTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  modalApplyText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  modalFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // Filter Sections
  filterSection: {
    marginBottom: SPACING.xl,
  },
  filterSectionTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Category Filters
  categoriesFilterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  categoryFilterItemActive: {
    backgroundColor: COLORS.primary,
  },
  categoryFilterIcon: {
    fontSize: FONTS.md,
    marginRight: SPACING.xs,
  },
  categoryFilterText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  categoryFilterTextActive: {
    color: COLORS.white,
  },

  // Price Range
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  priceInput: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  priceValue: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
  priceSeparator: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },

  // Location
  locationInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  radiusLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  radiusOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  radiusOption: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  radiusOptionActive: {
    backgroundColor: COLORS.primary,
  },
  radiusOptionText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  radiusOptionTextActive: {
    color: COLORS.white,
  },

  // Rating Options
  ratingOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  ratingOption: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  ratingOptionActive: {
    backgroundColor: COLORS.primary,
  },
  ratingOptionText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  ratingOptionTextActive: {
    color: COLORS.white,
  },

  // Availability Options
  availabilityOptions: {
    gap: SPACING.sm,
  },
  availabilityOption: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  availabilityOptionActive: {
    backgroundColor: COLORS.primary,
  },
  availabilityOptionText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  availabilityOptionTextActive: {
    color: COLORS.white,
  },

  // Sort Options
  sortOptions: {
    gap: SPACING.sm,
  },
  sortOption: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary,
  },
  sortOptionText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  sortOptionTextActive: {
    color: COLORS.white,
  },

  // Clear Filters
  clearFiltersModalButton: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  clearFiltersModalButtonText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weightMedium,
  },
});

export default AdvancedSearchScreen;
