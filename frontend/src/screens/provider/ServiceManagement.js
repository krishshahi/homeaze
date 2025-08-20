import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { providerServicesAPI, servicesAPI } from '../../services/api';
import websocketService from '../../services/websocket';

const ServiceManagement = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();

    // Connect to WebSocket and listen for service updates
    websocketService.connect();

    websocketService.on('service_update', handleServiceUpdate);
    websocketService.on('booking_update', handleBookingUpdate);

    return () => {
      websocketService.removeListener('service_update', handleServiceUpdate);
      websocketService.removeListener('booking_update', handleBookingUpdate);
      websocketService.disconnect();
    };
  }, []);

  const handleServiceUpdate = (update) => {
    setServices((current) =>
      current.map((service) =>
        service.id === update.serviceId ? { ...service, ...update.data } : service
      )
    );
  };

  const handleBookingUpdate = (update) => {
    // Refresh services list when a booking is created/updated
    // This ensures service availability is current
    loadInitialData();
  };

  const loadInitialData = async () => {
    try {
      setError(null);
      const [servicesResponse, categoriesResponse] = await Promise.all([
        providerServicesAPI.getServices(),
        servicesAPI.getCategories(),
      ]);

      if (servicesResponse.success && categoriesResponse.success) {
        setServices(servicesResponse.data);
        setCategories(categoriesResponse.data);
      } else {
        setError('Failed to load data');
        Alert.alert('Error', 'Failed to load initial data');
      }
    } catch (error) {
      console.error('Load initial data error:', error);
      setError('Failed to load data');
      Alert.alert('Error', 'Failed to load initial data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await providerServicesAPI.getServices();
      if (response.success) {
        setServices(response.data);
      } else {
        Alert.alert('Error', response.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddService = () => {
    navigation.navigate('AddService', {
      categories,
      onServiceAdded: (newService) => {
        setServices([...services, newService]);
      },
    });
  };

  const handleEditService = (service) => {
    navigation.navigate('EditService', {
      service,
      categories,
      onServiceUpdated: (updatedService) => {
        const updatedServices = services.map((s) =>
          s.id === updatedService.id ? updatedService : s
        );
        setServices(updatedServices);
      },
    });
  };

  const toggleServiceAvailability = async (serviceId) => {
    try {
      const service = services.find((s) => s.id === serviceId);
      const response = await providerServicesAPI.updateAvailability(
        serviceId,
        !service.available
      );

      if (response.success) {
        setServices((current) =>
          current.map((s) =>
            s.id === serviceId ? { ...s, available: !s.available } : s
          )
        );
      } else {
        Alert.alert('Error', response.error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update service availability');
    }
  };

  const renderServiceCard = (service) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceCategory}>
            {service.category} • {service.subcategory}
          </Text>
        </View>
        <Switch
          value={service.available}
          onValueChange={() => toggleServiceAvailability(service.id)}
          trackColor={{ false: '#CCCCCC', true: '#90CAF9' }}
          thumbColor={service.available ? '#2196F3' : '#F5F5F5'}
        />
      </View>

      <Text style={styles.serviceDescription}>{service.description}</Text>

      <View style={styles.pricingSection}>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            ${service.basePrice} {service.priceUnit}
          </Text>
        </View>
        <Text style={styles.durationText}>{service.duration}</Text>
      </View>

      {service.options && service.options.length > 0 && (
        <View style={styles.optionsSection}>
          <Text style={styles.optionsTitle}>Additional Options:</Text>
          {service.options.map((option) => (
            <View key={option.id} style={styles.optionItem}>
              <Text style={styles.optionName}>{option.name}</Text>
              <Text style={styles.optionPrice}>
                +${option.price} {option.unit}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.serviceActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditService(service)}
        >
          <Icon name="edit-2" size={20} color="#2196F3" />
          <Text style={styles.editButtonText}>Edit Service</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-triangle" size={48} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadInitialData}
          >
            <Icon name="refresh-cw" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddService}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadInitialData} />
        }
      >
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="package" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateTitle}>No Services Yet</Text>
            <Text style={styles.emptyStateText}>
              Start by adding your first service to attract customers
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={handleAddService}
            >
              <Icon name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.addFirstButtonText}>Add First Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.servicesList}>
            {services.map(renderServiceCard)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#666666',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 12,
  },
  pricingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceTag: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  durationText: {
    fontSize: 14,
    color: '#666666',
  },
  optionsSection: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
    marginBottom: 12,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionName: {
    fontSize: 14,
    color: '#666666',
  },
  optionPrice: {
    fontSize: 14,
    color: '#2196F3',
  },
  serviceActions: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 4,
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ServiceManagement;
