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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchServices, fetchCategories, searchServices } from '../store/slices/servicesSlice';
import { getIconProps } from '../utils/iconMapper';

const SimpleServicesScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState(route?.params?.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.category || null);
  const [refreshing, setRefreshing] = useState(false);

  // Get data from Redux store
  const { services, categories, loading, error, searchResults } = useSelector((state) => state.services);

  // Normalize categories with fallback data
  const normalizedCategories = [
    { id: 'all', name: 'All', icon: 'apps-outline', color: '#3B82F6' },
    ...(categories.length > 0 ? categories.map(cat => ({
      id: cat.id || cat._id || cat.slug,
      name: cat.name || cat.title,
      icon: getIconProps(cat.icon || cat.emoji || 'home-outline'),
      color: cat.color || '#3B82F6'
    })) : [
      { id: 'cleaning', name: 'Cleaning', icon: 'home-outline', color: '#3B82F6' },
      { id: 'plumbing', name: 'Plumbing', icon: 'water-outline', color: '#06B6D4' },
      { id: 'electrical', name: 'Electrical', icon: 'flash-outline', color: '#F59E0B' },
      { id: 'gardening', name: 'Gardening', icon: 'leaf-outline', color: '#10B981' },
    ])
  ];

  // Normalize services for consistent display
  const normalizeService = (service) => ({
    id: service.id || service._id,
    title: service.title || service.name || 'Service',
    description: service.description || 'Service description',
    price: service.startingPrice ? `$${service.startingPrice}` : service.price ? `$${service.price}` : 'Price on request',
    rating: service.rating?.average || service.rating || 4.5,
    reviews: service.bookingsCount || service.reviews || 0,
    category: service.category || service.categoryId || 'other',
    image: getIconProps(service.icon || service.emoji || '🏠'),
    provider: service.provider || service.providerName
  });

  // Use search results if search query exists, otherwise use regular services
  const servicesData = searchQuery.trim() ? searchResults : services;
  const normalizedServices = servicesData.map(normalizeService);

  // Filter services by category and search
  const filteredServices = normalizedServices.filter(service => {
    const matchesSearch = !searchQuery || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Initialize data on component mount
  useEffect(() => {
    console.log('🔍 Initializing Services Screen data...');
    dispatch(fetchServices());
    dispatch(fetchCategories());
    
    // If there's an initial search query from navigation params, perform search
    if (route?.params?.searchQuery) {
      handleSearch(route.params.searchQuery);
    }
  }, [dispatch, route?.params?.searchQuery]);

  const handleSearch = async (query) => {
    if (query?.trim()) {
      console.log('🔍 Searching services for:', query);
      dispatch(searchServices({ query: query.trim() }));
    } else {
      // If search is cleared, reload regular services
      dispatch(fetchServices());
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchServices()).unwrap(),
        dispatch(fetchCategories()).unwrap()
      ]);
      
      // Re-run search if there's a search query
      if (searchQuery.trim()) {
        await dispatch(searchServices({ query: searchQuery.trim() })).unwrap();
      }
    } catch (error) {
      console.error('Error refreshing services:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchInputChange = (text) => {
    setSearchQuery(text);
    // Debounce search - only search after user stops typing for 500ms
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      handleSearch(text);
    }, 500);
  };

  const handleCategoryPress = (categoryId) => {
    const newCategory = categoryId === selectedCategory ? null : categoryId;
    setSelectedCategory(newCategory);
  };

  const renderServiceCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetails', { service: item })}
    >
      <View style={styles.serviceImage}>
        <Ionicons name={item.image} size={32} color="#3B82F6" />
      </View>
      
      <View style={styles.serviceContent}>
        <Text style={styles.serviceTitle}>{item.title}</Text>
        <Text style={styles.serviceDescription}>{item.description}</Text>
        
        <View style={styles.serviceFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviews}>({item.reviews})</Text>
          </View>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Services</Text>
                <Text style={styles.headerSubtitle}>{filteredServices.length} available</Text>
              </View>
              
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color="#94A3B8" />
                <TextInput
                  placeholder="Search services..."
                  value={searchQuery}
                  onChangeText={handleSearchInputChange}
                  style={styles.searchInput}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* Content */}
      <View style={styles.content}>
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {normalizedCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? '#FFFFFF' : category.color} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Services List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : filteredServices.length > 0 ? (
          <FlatList
            data={filteredServices}
            renderItem={renderServiceCard}
            keyExtractor={(item) => item.id}
            style={styles.servicesList}
            contentContainerStyle={styles.servicesContent}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.servicesRow}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3B82F6']}
                tintColor="#3B82F6"
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No services found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 
                `No services match "${searchQuery}"${selectedCategory && selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}` :
                'Try adjusting your search or category filter'
              }
            </Text>
          </View>
        )}
      </View>
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
    paddingBottom: 16,
  },
  
  headerContent: {
    paddingHorizontal: 20,
  },
  
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  backButton: {
    padding: 4,
  },
  
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  
  headerSpacer: {
    width: 32,
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
  
  categoriesScroll: {
    paddingTop: 16,
  },
  
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  
  categoryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  
  categoryTextActive: {
    color: '#FFFFFF',
  },
  
  servicesList: {
    flex: 1,
    paddingTop: 16,
  },
  
  servicesContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  
  servicesRow: {
    justifyContent: 'space-between',
  },
  
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  serviceImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  serviceEmoji: {
    fontSize: 32,
  },
  
  serviceContent: {
    flex: 1,
  },
  
  serviceTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  serviceDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  rating: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  
  reviews: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  price: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  
  emptyTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SimpleServicesScreen;
