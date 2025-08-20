import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import {
  PROVIDER_STATUS,
  PROVIDER_STATUS_COLORS,
  PROVIDER_STATUS_LABELS,
  SERVICE_STATUS,
  SERVICE_STATUS_COLORS,
  SERVICE_STATUS_LABELS,
} from '../../constants/provider';
import {
  providerServicesAPI,
  providerEarningsAPI,
  providerProfileAPI,
} from '../../services/api';

const ProviderDashboard = () => {
  const navigation = useNavigation();
  const [isOnline, setIsOnline] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
  });
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [completedServices, setCompletedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [profileResponse, earningsResponse, servicesResponse] = await Promise.all([
        providerProfileAPI.getProfile(),
        providerEarningsAPI.getEarningsOverview(),
        providerServicesAPI.getServices(),
      ]);

      if (
        profileResponse.success &&
        earningsResponse.success &&
        servicesResponse.success
      ) {
        setProfile(profileResponse.data);
        setEarnings(earningsResponse.data.earnings);
        
        // Filter services by status
        const services = servicesResponse.data;
        setUpcomingServices(
          services.filter((s) => s.status === SERVICE_STATUS.SCHEDULED)
        );
        setCompletedServices(
          services.filter((s) => s.status === SERVICE_STATUS.COMPLETED)
        );
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Load dashboard data error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadInitialData();
  };

  const handleToggleStatus = async (status) => {
    try {
      const response = await providerProfileAPI.updateProfile({
        isOnline: status,
      });

      if (response.success) {
        setIsOnline(status);
      } else {
        Alert.alert('Error', response.error.message);
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderServiceCard = (service) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetails', { id: service.id })}
    >
      <View style={styles.serviceHeader}>
        <View>
          <Text style={styles.customerName}>{service.customer}</Text>
          <Text style={styles.serviceTime}>{service.time}</Text>
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

      <View style={styles.serviceDetails}>
        <Text style={styles.serviceName}>{service.service}</Text>
        <Text style={styles.servicePrice}>${service.price}</Text>
      </View>

      {service.rating && (
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#FFC107" />
          <Text style={styles.ratingText}>{service.rating}</Text>
        </View>
      )}
    </TouchableOpacity>
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
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.providerName}>{profile.businessName}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="user" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.statusLabel}>Status</Text>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: PROVIDER_STATUS_COLORS[
                      isOnline ? PROVIDER_STATUS.ONLINE : PROVIDER_STATUS.OFFLINE
                    ],
                  },
                ]}
              >
                {
                  PROVIDER_STATUS_LABELS[
                    isOnline ? PROVIDER_STATUS.ONLINE : PROVIDER_STATUS.OFFLINE
                  ]
                }
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleStatus}
              trackColor={{ false: '#CCCCCC', true: '#4CAF50' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.earningsSection}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'today' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('today')}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'today' && styles.periodButtonTextActive,
                ]}
              >
                Today
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'week' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('week')}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'week' && styles.periodButtonTextActive,
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                selectedPeriod === 'month' && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === 'month' && styles.periodButtonTextActive,
                ]}
              >
                Month
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.earningsCard}>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsAmount}>
              ${earnings[selectedPeriod]}
            </Text>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => navigation.navigate('Earnings')}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Icon name="chevron-right" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Services</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ServicesList')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {upcomingServices.map(renderServiceCard)}
        </View>

        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Completed Services</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ServicesList')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {completedServices.map(renderServiceCard)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Messages')}
        >
          <Icon name="message-circle" size={24} color="#666" />
          <Text style={styles.footerButtonText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Icon name="calendar" size={24} color="#666" />
          <Text style={styles.footerButtonText}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Earnings')}
        >
          <Icon name="dollar-sign" size={24} color="#666" />
          <Text style={styles.footerButtonText}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings" size={24} color="#666" />
          <Text style={styles.footerButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  providerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  statusSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  earningsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  periodButtonActive: {
    backgroundColor: '#2196F3',
  },
  periodButtonText: {
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  earningsCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#2196F3',
    marginRight: 4,
  },
  servicesSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
  },
  serviceCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
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
  serviceTime: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  /* statusText duplicate removed to avoid duplicate key warning; using earlier definition */
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 14,
    color: '#666',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  footerButton: {
    alignItems: 'center',
  },
  footerButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
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
    marginTop: 24,
  },
  retryButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProviderDashboard;
