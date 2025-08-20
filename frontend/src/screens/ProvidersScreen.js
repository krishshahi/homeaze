import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  FlatList,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ProvidersAPI from '../services/providersApi';

const ProvidersScreen = ({ navigation }) => {
  console.log('🚀 ProvidersScreen loaded with modern UI!');
  console.log('📱 Current timestamp:', new Date().toISOString());
  
  // Use safe area insets for precise control
  const insets = useSafeAreaInsets();
  console.log('📐 Safe area insets:', insets);
  
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with API call
  const mockProviders = [
    {
      id: '1',
      name: 'John Smith',
      profession: 'Plumber',
      category: 'plumbing',
      rating: 4.8,
      reviewCount: 127,
      hourlyRate: 45,
      verified: true,
      distance: 2.3,
      avatar: null,
      specialties: ['Emergency Repairs', 'Installation', 'Maintenance'],
      availability: 'Available Today',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      profession: 'House Cleaner',
      category: 'cleaning',
      rating: 4.9,
      reviewCount: 89,
      hourlyRate: 35,
      verified: true,
      distance: 1.8,
      avatar: null,
      specialties: ['Deep Cleaning', 'Regular Cleaning', 'Move-in/out'],
      availability: 'Available Tomorrow',
    },
    {
      id: '3',
      name: 'Mike Wilson',
      profession: 'Electrician',
      category: 'electrical',
      rating: 4.7,
      reviewCount: 156,
      hourlyRate: 55,
      verified: true,
      distance: 3.1,
      avatar: null,
      specialties: ['Wiring', 'Fixture Installation', 'Troubleshooting'],
      availability: 'Available Today',
    },
  ];

  const categories = [
    { id: 'all', title: 'All', icon: '🏠' },
    { id: 'cleaning', title: 'Cleaning', icon: '🧹' },
    { id: 'plumbing', title: 'Plumbing', icon: '🔧' },
    { id: 'electrical', title: 'Electrical', icon: '⚡' },
    { id: 'gardening', title: 'Gardening', icon: '🌱' },
    { id: 'handyman', title: 'Handyman', icon: '🔨' },
  ];

  const fetchProviders = async (filters = {}) => {
    try {
      console.log('👥 ProvidersScreen - Fetching providers from API with filters:', filters);
      setLoading(true);
      const response = await ProvidersAPI.getProviders(filters);
      console.log('✅ Providers fetched successfully:', response);
      
      // Handle both array response and object response with providers array
      const providersList = Array.isArray(response) ? response : response.providers || [];
      setProviders(providersList);
    } catch (error) {
      console.error('❌ Error fetching providers:', error);
      // Fallback to mock data if API fails
      setProviders(mockProviders);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProviders({ category: selectedCategory });
  };

  const handleProviderPress = (provider) => {
    navigation.navigate('ProviderProfile', { providerId: provider.id });
  };

  const handleCategoryPress = (category) => {
    const newCategory = selectedCategory === category.id ? null : category.id;
    setSelectedCategory(newCategory);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.profession.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price_low':
        return a.hourlyRate - b.hourlyRate;
      case 'price_high':
        return b.hourlyRate - a.hourlyRate;
      case 'distance':
        return a.distance - b.distance;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const renderProviderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.providerCard}
      onPress={() => handleProviderPress(item)}
    >
      <View style={styles.providerHeader}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          )}
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>
        
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{item.name}</Text>
          <Text style={styles.providerProfession}>{item.profession}</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
          </View>
          
          <View style={styles.detailsRow}>
            <Text style={styles.hourlyRate}>${item.hourlyRate}/hr</Text>
            <Text style={styles.distance}>{item.distance} km away</Text>
          </View>
          
          <Text style={styles.availability}>{item.availability}</Text>
        </View>
      </View>
      
      <View style={styles.specialtiesContainer}>
        {item.specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
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
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            {[
              { key: 'rating', label: 'Rating' },
              { key: 'price_low', label: 'Price: Low to High' },
              { key: 'price_high', label: 'Price: High to Low' },
              { key: 'distance', label: 'Distance' },
              { key: 'name', label: 'Name' },
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
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark || COLORS.primary]}
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
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Service Providers</Text>
              <Text style={styles.headerSubtitle}>
                {sortedProviders.length} providers found
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="options-outline" size={24} color={COLORS.white} />
              {(selectedCategory || sortBy !== 'rating') && (
                <View style={styles.filterBadge} />
              )}
            </TouchableOpacity>
          </View>

          {/* Modern Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.modernSearchBar}>
              <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIconModern} />
              <TextInput
                style={styles.modernSearchInput}
                placeholder="Search providers..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={COLORS.textMuted}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Modern Categories Section */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.modernCategoryChip,
                selectedCategory === category.id && styles.modernCategoryChipActive,
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={[
                styles.categoryIconContainer,
                selectedCategory === category.id && styles.categoryIconContainerActive,
              ]}>
                <Text style={[
                  styles.modernCategoryIcon,
                  selectedCategory === category.id && styles.modernCategoryIconActive,
                ]}>{category.icon}</Text>
              </View>
              <Text
                style={[
                  styles.modernCategoryTitle,
                  selectedCategory === category.id && styles.modernCategoryTitleActive,
                ]}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Providers List */}
      <FlatList
        data={sortedProviders}
        renderItem={renderProviderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.providersList}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary || COLORS.background,
  },
  // Modern Header Styles - Compact for Android
  headerGradient: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    paddingHorizontal: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backButton: {
    marginRight: SPACING.md,
    padding: SPACING.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONTS.xxl || 28,
    fontWeight: FONTS.weightBold || 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.md || 16,
    color: COLORS.white,
    opacity: 0.8,
  },
  filterButton: {
    position: 'relative',
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.md,
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: COLORS.warning || COLORS.secondary,
    borderRadius: 4,
  },
  // Modern Search Styles
  searchSection: {
    marginTop: SPACING.md,
  },
  modernSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },
  searchIconModern: {
    marginRight: SPACING.sm,
  },
  modernSearchInput: {
    flex: 1,
    fontSize: FONTS.md || 16,
    color: COLORS.textPrimary || COLORS.text,
  },
  // Modern Categories Styles
  categoriesSection: {
    backgroundColor: COLORS.white,
    marginTop: -SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    ...SHADOWS.light,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  modernCategoryChip: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary || COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border || '#E5E5E5',
    minWidth: 80,
    marginRight: SPACING.sm,
  },
  modernCategoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryIconContainerActive: {
    backgroundColor: COLORS.white,
  },
  modernCategoryIcon: {
    fontSize: 16,
  },
  modernCategoryIconActive: {
    fontSize: 16,
  },
  modernCategoryTitle: {
    fontSize: FONTS.sm || 12,
    fontWeight: FONTS.weightMedium || '500',
    color: COLORS.textSecondary || COLORS.textMuted,
    textAlign: 'center',
  },
  modernCategoryTitleActive: {
    color: COLORS.white,
    fontWeight: FONTS.weightBold || 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  filterIcon: {
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    ...SHADOWS.light,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryTitle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  selectedCategoryTitle: {
    color: COLORS.white,
  },
  resultsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  providersList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  providerCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 12,
    color: COLORS.white,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  providerProfession: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  rating: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  hourlyRate: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  distance: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  availability: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.success,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  filterOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  filterOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  filterOptionTextSelected: {
    color: COLORS.white,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default ProvidersScreen;
