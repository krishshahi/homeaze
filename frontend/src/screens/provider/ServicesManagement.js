import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ServicesManagement = () => {
  const navigation = useNavigation();
  const [services, setServices] = useState([
    {
      id: '1',
      name: 'Deep Cleaning',
      description:
        'Thorough cleaning of all areas including deep cleaning of bathrooms, kitchen, and floors',
      basePrice: 120,
      minHours: 3,
      priceType: 'hourly',
      category: 'Residential',
      isActive: true,
      options: [
        {
          id: 'opt1',
          name: 'Window Cleaning',
          price: 30,
          isSelected: false,
        },
        {
          id: 'opt2',
          name: 'Carpet Cleaning',
          price: 50,
          isSelected: false,
        },
      ],
    },
    {
      id: '2',
      name: 'Regular Cleaning',
      description:
        'Standard cleaning service including dusting, vacuuming, and basic bathroom and kitchen cleaning',
      basePrice: 80,
      minHours: 2,
      priceType: 'hourly',
      category: 'Residential',
      isActive: true,
      options: [
        {
          id: 'opt1',
          name: 'Laundry',
          price: 20,
          isSelected: false,
        },
      ],
    },
  ]);

  const [selectedService, setSelectedService] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddService = () => {
    navigation.navigate('AddService');
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setIsEditing(true);
  };

  const handleSaveService = () => {
    if (selectedService) {
      setServices((prev) =>
        prev.map((service) =>
          service.id === selectedService.id ? selectedService : service
        )
      );
    }
    setSelectedService(null);
    setIsEditing(false);
  };

  const toggleServiceStatus = (serviceId) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, isActive: !service.isActive }
          : service
      )
    );
  };

  const renderServiceCard = (service) => (
    <View key={service.id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceCategory}>{service.category}</Text>
        </View>
        <Switch
          value={service.isActive}
          onValueChange={() => toggleServiceStatus(service.id)}
          trackColor={{ false: '#CCCCCC', true: '#4CAF50' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Text style={styles.serviceDescription}>{service.description}</Text>

      <View style={styles.pricingSection}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Base Price</Text>
          <Text style={styles.priceValue}>${service.basePrice}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Minimum Hours</Text>
          <Text style={styles.priceValue}>{service.minHours} hours</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Price Type</Text>
          <Text style={styles.priceValue}>
            {service.priceType.charAt(0).toUpperCase() +
              service.priceType.slice(1)}
          </Text>
        </View>
      </View>

      {service.options.length > 0 && (
        <View style={styles.optionsSection}>
          <Text style={styles.optionsTitle}>Additional Options</Text>
          {service.options.map((option) => (
            <View key={option.id} style={styles.optionRow}>
              <Text style={styles.optionName}>{option.name}</Text>
              <Text style={styles.optionPrice}>+${option.price}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditService(service)}
        >
          <Icon name="edit-2" size={20} color="#2196F3" />
          <Text style={styles.editButtonText}>Edit Service</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() =>
            navigation.navigate('ServiceStats', { serviceId: service.id })
          }
        >
          <Icon name="bar-chart-2" size={20} color="#666" />
          <Text style={styles.statsButtonText}>View Stats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Services & Pricing</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddService}
        >
          <Icon name="plus" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {services.map(renderServiceCard)}
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
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
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 14,
    color: '#666',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  pricingSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  optionsSection: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
    marginBottom: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionName: {
    fontSize: 14,
    color: '#666',
  },
  optionPrice: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#E3F2FD',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  statsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  statsButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});

export default ServicesManagement;
