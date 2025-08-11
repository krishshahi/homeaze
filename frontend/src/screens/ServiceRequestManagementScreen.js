import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';

const ServiceRequestManagementScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // Mock data for service requests
  const mockRequests = {
    pending: [
      {
        id: '1',
        customer: {
          id: 'c1',
          name: 'Sarah Johnson',
          phone: '+1-555-0123',
          email: 'sarah@email.com',
          avatar: null,
        },
        service: {
          id: 's1',
          name: 'Deep House Cleaning',
          category: 'cleaning',
          icon: '🧹',
        },
        requestDate: '2024-01-15',
        serviceDate: '2024-01-18',
        serviceTime: '10:00 AM',
        address: '123 Main St, Anytown, CA 90210',
        estimatedDuration: '3 hours',
        estimatedPrice: 120,
        specialInstructions: 'Please bring eco-friendly cleaning supplies. Two bathrooms need extra attention.',
        urgency: 'normal',
        status: 'pending',
        requestedAt: '2024-01-15T14:30:00Z',
      },
      {
        id: '2',
        customer: {
          id: 'c2',
          name: 'Michael Chen',
          phone: '+1-555-0456',
          email: 'michael@email.com',
          avatar: null,
        },
        service: {
          id: 's2',
          name: 'Plumbing Repair',
          category: 'maintenance',
          icon: '🔧',
        },
        requestDate: '2024-01-15',
        serviceDate: '2024-01-16',
        serviceTime: '2:00 PM',
        address: '456 Oak Ave, Cityville, CA 90211',
        estimatedDuration: '2 hours',
        estimatedPrice: 150,
        specialInstructions: 'Kitchen sink is leaking. Need urgent repair.',
        urgency: 'urgent',
        status: 'pending',
        requestedAt: '2024-01-15T16:45:00Z',
      },
    ],
    accepted: [
      {
        id: '3',
        customer: {
          id: 'c3',
          name: 'Emily Davis',
          phone: '+1-555-0789',
          email: 'emily@email.com',
          avatar: null,
        },
        service: {
          id: 's3',
          name: 'Garden Landscaping',
          category: 'landscaping',
          icon: '🌱',
        },
        requestDate: '2024-01-14',
        serviceDate: '2024-01-20',
        serviceTime: '9:00 AM',
        address: '789 Pine Rd, Townsville, CA 90212',
        estimatedDuration: '4 hours',
        estimatedPrice: 200,
        specialInstructions: 'Front yard needs complete makeover. Customer has specific plant preferences.',
        urgency: 'normal',
        status: 'accepted',
        acceptedAt: '2024-01-14T18:20:00Z',
      },
    ],
    completed: [
      {
        id: '4',
        customer: {
          id: 'c4',
          name: 'Robert Wilson',
          phone: '+1-555-0321',
          email: 'robert@email.com',
          avatar: null,
        },
        service: {
          id: 's4',
          name: 'HVAC Maintenance',
          category: 'maintenance',
          icon: '❄️',
        },
        requestDate: '2024-01-10',
        serviceDate: '2024-01-13',
        serviceTime: '11:00 AM',
        address: '321 Elm St, Villagetown, CA 90213',
        estimatedDuration: '2.5 hours',
        estimatedPrice: 180,
        finalPrice: 175,
        specialInstructions: 'Annual maintenance check for central air system.',
        urgency: 'normal',
        status: 'completed',
        completedAt: '2024-01-13T15:30:00Z',
        customerRating: 5,
        customerReview: 'Excellent service! Very professional and thorough.',
      },
    ],
  };

  const tabs = [
    { id: 'pending', title: 'Pending', icon: '⏳', count: mockRequests.pending.length },
    { id: 'accepted', title: 'Accepted', icon: '✅', count: mockRequests.accepted.length },
    { id: 'completed', title: 'Completed', icon: '🎉', count: mockRequests.completed.length },
  ];

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRequests(mockRequests[activeTab] || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Error', 'Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleRequestAction = (request, action) => {
    setSelectedRequest(request);
    setActionModalVisible(true);
  };

  const performAction = async (action) => {
    if (!selectedRequest) return;

    setActionModalVisible(false);
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      let message = '';
      switch (action) {
        case 'accept':
          message = 'Service request accepted! The customer has been notified.';
          break;
        case 'decline':
          message = 'Service request declined.';
          break;
        case 'complete':
          message = 'Service marked as completed. Payment will be processed.';
          break;
        case 'contact':
          navigation.navigate('Chat', { 
            customerId: selectedRequest.customer.id,
            requestId: selectedRequest.id 
          });
          return;
        default:
          message = 'Action completed successfully.';
      }

      Alert.alert('Success', message);
      await loadRequests(); // Reload requests

    } catch (error) {
      Alert.alert('Error', 'Failed to perform action. Please try again.');
    } finally {
      setLoading(false);
      setSelectedRequest(null);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return COLORS.error;
      case 'high': return COLORS.warning;
      default: return COLORS.success;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'accepted': return COLORS.info;
      case 'completed': return COLORS.success;
      default: return COLORS.textMuted;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const RequestCard = ({ request }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => handleRequestAction(request, 'view')}
    >
      <View style={styles.requestHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceIcon}>{request.service.icon}</Text>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>{request.service.name}</Text>
            <Text style={styles.customerName}>{request.customer.name}</Text>
          </View>
        </View>
        
        <View style={styles.requestMeta}>
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(request.urgency) + '20' }]}>
            <Text style={[styles.urgencyText, { color: getUrgencyColor(request.urgency) }]}>
              {request.urgency.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.requestTime}>
            {formatTime(request.requestedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {formatDate(request.serviceDate)} at {request.serviceTime}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.primary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {request.address}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>
            ${request.finalPrice || request.estimatedPrice} • {request.estimatedDuration}
          </Text>
        </View>
      </View>

      {request.specialInstructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsLabel}>Special Instructions:</Text>
          <Text style={styles.instructionsText} numberOfLines={2}>
            {request.specialInstructions}
          </Text>
        </View>
      )}

      {request.status === 'completed' && request.customerRating && (
        <View style={styles.ratingContainer}>
          <View style={styles.ratingStars}>
            {[...Array(5)].map((_, i) => (
              <Text key={i} style={styles.ratingStar}>
                {i < request.customerRating ? '⭐' : '☆'}
              </Text>
            ))}
          </View>
          <Text style={styles.ratingText}>"{request.customerReview}"</Text>
        </View>
      )}

      <View style={styles.requestActions}>
        {request.status === 'pending' && (
          <>
            <CustomButton
              title="Decline"
              variant="outline"
              onPress={() => performAction('decline')}
              style={styles.actionButton}
            />
            <CustomButton
              title="Accept"
              onPress={() => performAction('accept')}
              style={styles.actionButton}
            />
          </>
        )}
        
        {request.status === 'accepted' && (
          <>
            <CustomButton
              title="Contact Customer"
              variant="outline"
              onPress={() => performAction('contact')}
              style={styles.actionButton}
              icon={<Ionicons name="chatbubble-outline" size={16} color={COLORS.primary} />}
            />
            <CustomButton
              title="Mark Completed"
              onPress={() => performAction('complete')}
              style={styles.actionButton}
            />
          </>
        )}

        {request.status === 'completed' && (
          <CustomButton
            title="View Details"
            variant="outline"
            onPress={() => navigation.navigate('BookingDetails', { bookingId: request.id })}
            style={styles.fullWidthButton}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>
        {activeTab === 'pending' ? '⏳' : activeTab === 'accepted' ? '✅' : '🎉'}
      </Text>
      <Text style={styles.emptyStateTitle}>
        No {activeTab} requests
      </Text>
      <Text style={styles.emptyStateText}>
        {activeTab === 'pending' 
          ? 'New service requests will appear here'
          : activeTab === 'accepted'
          ? 'Accepted requests will show up here'
          : 'Completed services will be listed here'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Requests</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {mockRequests.pending.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
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
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && !refreshing ? (
          <LoadingSpinner message="Loading requests..." />
        ) : requests.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={requests}
            renderItem={({ item }) => <RequestCard request={item} />}
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
            <Text style={styles.modalTitle}>Service Request Actions</Text>
            
            {selectedRequest && (
              <View style={styles.modalInfo}>
                <Text style={styles.modalServiceName}>
                  {selectedRequest.service.name}
                </Text>
                <Text style={styles.modalCustomerName}>
                  for {selectedRequest.customer.name}
                </Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => setActionModalVisible(false)}
                style={styles.modalButton}
              />
              
              {selectedRequest?.status === 'pending' && (
                <>
                  <CustomButton
                    title="Accept Request"
                    onPress={() => performAction('accept')}
                    style={styles.modalButton}
                  />
                  <CustomButton
                    title="Decline Request"
                    variant="outline"
                    onPress={() => performAction('decline')}
                    style={styles.modalButton}
                  />
                </>
              )}
              
              {selectedRequest?.status === 'accepted' && (
                <CustomButton
                  title="Mark as Completed"
                  onPress={() => performAction('complete')}
                  style={styles.modalButton}
                />
              )}
            </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    position: 'relative',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  requestMeta: {
    alignItems: 'flex-end',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  requestTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  ratingContainer: {
    marginBottom: 12,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingStar: {
    fontSize: 16,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fullWidthButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalServiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalCustomerName: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  modalActions: {
    gap: 12,
  },
  modalButton: {
    marginBottom: 8,
  },
});

export default ServiceRequestManagementScreen;
