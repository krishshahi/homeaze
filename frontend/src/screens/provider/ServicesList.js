import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import {
  SERVICE_STATUS,
  SERVICE_STATUS_COLORS,
  SERVICE_STATUS_LABELS,
} from '../../constants/provider';

const ServicesList = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const mockServices = {
    upcoming: [
      {
        id: '1',
        customer: 'John Smith',
        service: 'Deep Cleaning',
        date: '2024-02-20',
        time: '10:00 AM',
        status: SERVICE_STATUS.SCHEDULED,
        location: '123 Main St, City',
        price: 120,
      },
      {
        id: '2',
        customer: 'Sarah Wilson',
        service: 'Regular Cleaning',
        date: '2024-02-20',
        time: '2:00 PM',
        status: SERVICE_STATUS.SCHEDULED,
        location: '456 Oak Ave, City',
        price: 80,
      },
    ],
    ongoing: [
      {
        id: '3',
        customer: 'David Brown',
        service: 'Deep Cleaning',
        date: '2024-02-19',
        time: '11:00 AM',
        status: SERVICE_STATUS.IN_PROGRESS,
        location: '789 Pine St, City',
        price: 120,
      },
    ],
    completed: [
      {
        id: '4',
        customer: 'Mike Johnson',
        service: 'Deep Cleaning',
        date: '2024-02-18',
        time: '9:00 AM',
        status: SERVICE_STATUS.COMPLETED,
        location: '321 Elm St, City',
        price: 120,
        rating: 4.8,
      },
    ],
  };

  const getFilteredServices = () => {
    const services = mockServices[selectedFilter] || [];
    if (!searchQuery) return services;

    return services.filter(
      (service) =>
        service.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderServiceCard = ({ item: service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetails', { serviceId: service.id })}
    >
      <View style={styles.serviceHeader}>
        <View>
          <Text style={styles.customerName}>{service.customer}</Text>
          <Text style={styles.serviceDate}>
            {service.date} at {service.time}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: SERVICE_STATUS_COLORS[service.status] },
          ]}
        >
          <Text style={styles.statusText}>
            {SERVICE_STATUS_LABELS[service.status]}
          </Text>
        </View>
      </View>

      <View style={styles.serviceInfo}>
        <View style={styles.infoRow}>
          <Icon name="box" size={16} color="#666" />
          <Text style={styles.infoText}>{service.service}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="map-pin" size={16} color="#666" />
          <Text style={styles.infoText}>{service.location}</Text>
        </View>
      </View>

      <View style={styles.serviceFooter}>
        <Text style={styles.servicePrice}>${service.price}</Text>
        {service.rating && (
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>{service.rating}</Text>
          </View>
        )}
      </View>

      {service.status === SERVICE_STATUS.SCHEDULED && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() =>
              navigation.navigate('ServiceDetails', {
                id: service.id,
                action: 'start',
              })
            }
          >
            <Icon name="play" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Start Service</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={() =>
              navigation.navigate('Chat', { customerId: service.customerId })
            }
          >
            <Icon name="message-circle" size={16} color="#2196F3" />
            <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>Message</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
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
        <Text style={styles.title}>Services</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => navigation.navigate('ServicesFilter')}
        >
          <Icon name="sliders" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'upcoming' && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter('upcoming')}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'upcoming' && styles.filterTabTextActive,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'ongoing' && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter('ongoing')}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'ongoing' && styles.filterTabTextActive,
            ]}
          >
            Ongoing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === 'completed' && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter('completed')}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === 'completed' && styles.filterTabTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredServices()}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filterTabs: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
  },
  filterTabTextActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  listContainer: {
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
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  serviceInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  messageButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ServicesList;
