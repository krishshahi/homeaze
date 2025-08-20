import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ServiceSelection = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock categories
  const categories = [
    {
      id: 'cleaning',
      name: 'Cleaning',
      icon: 'wind',
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      icon: 'tool',
    },
    {
      id: 'landscaping',
      name: 'Landscaping',
      icon: 'scissors',
    },
    {
      id: 'pest_control',
      name: 'Pest Control',
      icon: 'shield',
    },
  ];

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [selectedCategory, searchQuery, services]);

  const loadServices = async () => {
    try {
      // Here you would typically fetch services from your backend
      // For now, using mock data
      const mockServices = [
        {
          id: '1',
          name: 'Regular House Cleaning',
          category: 'cleaning',
          provider: {
            id: 'p1',
            name: 'CleanPro Services',
            rating: 4.8,
            reviewCount: 156,
            image: 'https://example.com/provider1.jpg',
          },
          description: 'Standard house cleaning service including dusting, vacuuming, and bathroom cleaning',
          basePrice: 120,
          priceUnit: 'per visit',
          duration: '3-4 hours',
          available: true,
          options: [
            {
              id: 'windows',
              name: 'Window Cleaning',
              price: 30,
              unit: 'per visit',
            },
            {
              id: 'laundry',
              name: 'Laundry Service',
              price: 25,
              unit: 'per load',
            },
          ],
        },
        {
          id: '2',
          name: 'Deep Cleaning',
          category: 'cleaning',
          provider: {
            id: 'p2',
            name: 'Sparkle Clean',
            rating: 4.9,
            reviewCount: 203,
            image: 'https://example.com/provider2.jpg',
          },
          description: 'Thorough cleaning of all areas including detailed attention to kitchen and bathrooms',
          basePrice: 250,
          priceUnit: 'per visit',
          duration: '6-8 hours',
          available: true,
          options: [
            {
              id: 'carpet',
              name: 'Carpet Deep Clean',
              price: 80,
              unit: 'per room',
            },
            {
              id: 'cabinets',
              name: 'Cabinet Interior Cleaning',
              price: 50,
              unit: 'per kitchen',
            },
          ],
        },
      ];

      setServices(mockServices);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    if (selectedCategory) {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.provider.name.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  };

  const handleServiceSelect = (service) => {
    navigation.navigate('ServiceDetails', {
      serviceId: service.id,
      onBookingComplete: () => {
        // Refresh services after booking
        loadServices();
      },
    });
  };

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonSelected,
      ]}
      onPress={() =>
        setSelectedCategory(
          selectedCategory === category.id ? null : category.id
        )
      }
    >
      <Icon
        name={category.icon}
        size={24}
        color={selectedCategory === category.id ? '#2196F3' : '#666666'}
      />
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category.id && styles.categoryButtonTextSelected,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderServiceCard = (service) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceCard}
      onPress={() => handleServiceSelect(service)}
    >
      <View style={styles.providerInfo}>
        <View style={styles.providerAvatar}>
          <Icon name="user" size={24} color="#666666" />
        </View>
        <View style={styles.providerDetails}>
          <Text style={styles.providerName}>{service.provider.name}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>
              {service.provider.rating} ({service.provider.reviewCount} reviews)
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.serviceName}>{service.name}</Text>
      <Text style={styles.serviceDescription} numberOfLines={2}>
        {service.description}
      </Text>

      <View style={styles.serviceFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>${service.basePrice}</Text>
          <Text style={styles.priceUnit}>{service.priceUnit}</Text>
        </View>
        <View style={styles.durationContainer}>
          <Icon name="clock" size={16} color="#666666" />
          <Text style={styles.durationText}>{service.duration}</Text>
        </View>
      </View>

      {service.options && service.options.length > 0 && (
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>
            {service.options.length} additional options available
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book a Service</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services or providers"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Icon name="x" size={20} color="#666666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categories}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(renderCategoryButton)}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {filteredServices.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="inbox" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateTitle}>No Services Found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          <View style={styles.servicesList}>
            {filteredServices.map(renderServiceCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    padding: 8,
  },
  categories: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoriesContent: {
    padding: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#E3F2FD',
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
    fontWeight: 'bold',
  },
  categoryButtonTextSelected: {
    color: '#2196F3',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  servicesList: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666666',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  priceUnit: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666666',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666666',
  },
  optionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  optionsTitle: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default ServiceSelection;
