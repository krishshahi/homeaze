import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';

const EnhancedProviderServicesScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // Mock provider services data
  const mockProviderServices = [
    {
      id: 'ps1',
      name: 'Professional House Cleaning',
      description: 'Deep cleaning service for your home including all rooms, bathrooms, and kitchen.',
      category: 'cleaning',
      icon: '🧹',
      price: 85,
      minDuration: 2,
      maxDuration: 4,
      status: 'active',
      isActive: true,
      featured: true,
      bookingsCount: 47,
      rating: 4.9,
      reviewCount: 32,
      totalEarnings: 3995,
      availability: 'Weekdays & Weekends',
      features: ['Eco-friendly supplies', 'Insured', 'Background checked'],
      lastBooked: '2024-01-14T10:00:00Z',
      createdAt: '2023-06-15T09:00:00Z',
    },
    {
      id: 'ps2',
      name: 'Apartment Deep Clean',
      description: 'Specialized cleaning service for apartments and small spaces.',
      category: 'cleaning',
      icon: '🏢',
      price: 65,
      minDuration: 1.5,
      maxDuration: 3,
      status: 'active',
      isActive: true,
      featured: false,
      bookingsCount: 23,
      rating: 4.7,
      reviewCount: 18,
      totalEarnings: 1495,
      availability: 'Weekdays',
      features: ['Quick service', 'Flexible timing'],
      lastBooked: '2024-01-12T14:30:00Z',
      createdAt: '2023-09-20T11:00:00Z',
    },
    {
      id: 'ps3',
      name: 'Office Cleaning',
      description: 'Commercial cleaning service for offices and small businesses.',
      category: 'cleaning',
      icon: '🏢',
      price: 95,
      minDuration: 2,
      maxDuration: 6,
      status: 'inactive',
      isActive: false,
      featured: false,
      bookingsCount: 12,
      rating: 4.8,
      reviewCount: 9,
      totalEarnings: 1140,
      availability: 'Evenings & Weekends',
      features: ['After-hours service', 'Commercial grade supplies'],
      lastBooked: '2023-12-28T18:00:00Z',
      createdAt: '2023-11-05T16:00:00Z',
    },
    {
      id: 'ps4',
      name: 'Post-Construction Cleanup',
      description: 'Specialized cleaning after construction or renovation work.',
      category: 'cleaning',
      icon: '🔨',
      price: 120,
      minDuration: 4,
      maxDuration: 8,
      status: 'pending',
      isActive: false,
      featured: false,
      bookingsCount: 0,
      rating: 0,
      reviewCount: 0,
      totalEarnings: 0,
      availability: 'Custom Schedule',
      features: ['Heavy-duty equipment', 'Dust removal', 'Debris cleanup'],
      lastBooked: null,
      createdAt: '2024-01-10T12:00:00Z',
    },
  ];

  const tabs = [
    { id: 'all', title: 'All Services', count: mockProviderServices.length },
    { id: 'active', title: 'Active', count: mockProviderServices.filter(s => s.status === 'active').length },
    { id: 'inactive', title: 'Inactive', count: mockProviderServices.filter(s => s.status === 'inactive').length },
    { id: 'pending', title: 'Pending Review', count: mockProviderServices.filter(s => s.status === 'pending').length },
  ];

  useEffect(() => {
    loadProviderServices();
  }, []);

  const loadProviderServices = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setServices(mockProviderServices);
    } catch (error) {
      console.error('Error loading provider services:', error);
      Alert.alert('Error', 'Failed to load your services');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProviderServices();
    setRefreshing(false);
  };

  const getFilteredServices = () => {
    switch (activeTab) {
      case 'active':
        return services.filter(service => service.status === 'active');
      case 'inactive':
        return services.filter(service => service.status === 'inactive');
      case 'pending':
        return services.filter(service => service.status === 'pending');
      default:
        return services;
    }
  };

  const handleServiceAction = (service, action) => {
    setSelectedService(service);
    
    switch (action) {
      case 'toggle':
        toggleServiceStatus(service);
        break;
      case 'edit':
        navigation.navigate('CreateService', { serviceId: service.id, mode: 'edit' });
        break;
      case 'delete':
        confirmDeleteService(service);
        break;
      case 'analytics':
        navigation.navigate('ServiceAnalytics', { serviceId: service.id });
        break;
      case 'duplicate':
        duplicateService(service);
        break;
      default:
        setActionModalVisible(true);
    }
  };

  const toggleServiceStatus = async (service) => {
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setServices(prevServices =>
        prevServices.map(s =>
          s.id === service.id
            ? { ...s, status: newStatus, isActive: newStatus === 'active' }
            : s
        )
      );

      Alert.alert(
        'Success',
        `Service ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update service status');
    }
  };

  const confirmDeleteService = (service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteService(service.id)
        }
      ]
    );
  };

  const deleteService = async (serviceId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setServices(prevServices =>
        prevServices.filter(s => s.id !== serviceId)
      );

      Alert.alert('Success', 'Service deleted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete service');
    }
  };

  const duplicateService = async (service) => {
    try {
      const duplicatedService = {
        ...service,
        id: `${service.id}_copy_${Date.now()}`,
        name: `${service.name} (Copy)`,
        status: 'inactive',
        isActive: false,
        bookingsCount: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString(),
      };

      setServices(prevServices => [duplicatedService, ...prevServices]);
      Alert.alert('Success', 'Service duplicated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to duplicate service');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'inactive': return COLORS.textMuted;
      case 'pending': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'checkmark-circle';
      case 'inactive': return 'pause-circle';
      case 'pending': return 'time';
      default: return 'help-circle';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const ServiceCard = ({ service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServiceAction(service, 'view')}
    >
      {/* Service Header */}
      <View style={styles.serviceHeader}>
        <View style={styles.serviceMainInfo}>
          <Text style={styles.serviceIcon}>{service.icon}</Text>
          <View style={styles.serviceTitleContainer}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {service.name}
            </Text>
            <Text style={styles.serviceCategory}>{service.category}</Text>
            <Text style={styles.servicePrice}>{formatCurrency(service.price)}/hr</Text>
          </View>
        </View>

        <View style={styles.serviceStatusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(service.status) + '20' }
          ]}>
            <Ionicons
              name={getStatusIcon(service.status)}
              size={14}
              color={getStatusColor(service.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
            </Text>
          </View>
          
          {service.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color={COLORS.warning} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>
      </View>

      {/* Service Description */}
      <Text style={styles.serviceDescription} numberOfLines={2}>
        {service.description}
      </Text>

      {/* Service Features */}
      <View style={styles.featuresContainer}>
        {service.features.slice(0, 2).map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        {service.features.length > 2 && (
          <Text style={styles.moreFeatures}>+{service.features.length - 2} more</Text>
        )}
      </View>

      {/* Service Stats */}
      <View style={styles.serviceStats}>
        <View style={styles.statItem}>
          <Ionicons name="calendar" size={16} color={COLORS.primary} />
          <Text style={styles.statValue}>{service.bookingsCount}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color={COLORS.warning} />
          <Text style={styles.statValue}>{service.rating || '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="cash" size={16} color={COLORS.success} />
          <Text style={styles.statValue}>{formatCurrency(service.totalEarnings)}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color={COLORS.textMuted} />
          <Text style={styles.statValue}>{formatDate(service.lastBooked)}</Text>
          <Text style={styles.statLabel}>Last Booked</Text>
        </View>
      </View>

      {/* Service Actions */}
      <View style={styles.serviceActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            service.status === 'active' ? styles.pauseButton : styles.activateButton
          ]}
          onPress={() => handleServiceAction(service, 'toggle')}
        >
          <Ionicons
            name={service.status === 'active' ? 'pause' : 'play'}
            size={16}
            color={service.status === 'active' ? COLORS.warning : COLORS.success}
          />
          <Text style={[
            styles.actionButtonText,
            { color: service.status === 'active' ? COLORS.warning : COLORS.success }
          ]}>
            {service.status === 'active' ? 'Pause' : 'Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleServiceAction(service, 'edit')}
        >
          <Ionicons name="create" size={16} color={COLORS.primary} />
          <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreActionsButton}
          onPress={() => handleServiceAction(service, 'more')}
        >
          <Ionicons name="ellipsis-horizontal" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="briefcase-outline" size={60} color={COLORS.textMuted} />
      <Text style={styles.emptyStateTitle}>
        {activeTab === 'all' ? 'No services yet' : `No ${activeTab} services`}
      </Text>
      <Text style={styles.emptyStateText}>
        {activeTab === 'all' 
          ? "Start by creating your first service to offer to customers"
          : `You don't have any ${activeTab} services at the moment`
        }
      </Text>
      {activeTab === 'all' && (
        <CustomButton
          title="Create Your First Service"
          onPress={() => navigation.navigate('CreateService')}
          style={styles.emptyStateButton}
          icon={<Ionicons name="add-circle" size={20} color={COLORS.white} />}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Services</Text>
          <Text style={styles.headerSubtitle}>Manage your service offerings</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateService')}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}>
                {tab.title}
              </Text>
              {tab.count > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <LoadingSpinner message="Loading your services..." />
        ) : getFilteredServices().length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={getFilteredServices()}
            renderItem={({ item }) => <ServiceCard service={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {/* Action Modal */}
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Service Actions</Text>
            
            {selectedService && (
              <View style={styles.modalServiceInfo}>
                <Text style={styles.modalServiceIcon}>{selectedService.icon}</Text>
                <Text style={styles.modalServiceName}>{selectedService.name}</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  setActionModalVisible(false);
                  handleServiceAction(selectedService, 'analytics');
                }}
              >
                <Ionicons name="bar-chart" size={20} color={COLORS.primary} />
                <Text style={styles.modalActionText}>View Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  setActionModalVisible(false);
                  handleServiceAction(selectedService, 'duplicate');
                }}
              >
                <Ionicons name="copy" size={20} color={COLORS.primary} />
                <Text style={styles.modalActionText}>Duplicate Service</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionButton, styles.deleteAction]}
                onPress={() => {
                  setActionModalVisible(false);
                  handleServiceAction(selectedService, 'delete');
                }}
              >
                <Ionicons name="trash" size={20} color={COLORS.error} />
                <Text style={[styles.modalActionText, { color: COLORS.error }]}>Delete Service</Text>
              </TouchableOpacity>
            </View>

            <CustomButton
              title="Cancel"
              variant="outline"
              onPress={() => setActionModalVisible(false)}
              style={styles.modalCancelButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  serviceTitleContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  serviceCategory: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  serviceStatusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.warning,
    marginLeft: 2,
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  featureTag: {
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  moreFeatures: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  serviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  pauseButton: {
    borderColor: COLORS.warning,
    backgroundColor: COLORS.warning + '10',
  },
  activateButton: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '10',
  },
  editButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  moreActionsButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalServiceInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalServiceIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalServiceName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  modalActions: {
    marginBottom: 20,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  modalActionText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 16,
  },
  deleteAction: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
    paddingTop: 16,
  },
  modalCancelButton: {
    marginTop: 12,
  },
});

export default EnhancedProviderServicesScreen;
