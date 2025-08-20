import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const Notifications = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Here you would typically fetch notifications from your backend
      // For now, using mock data
      const mockNotifications = [
        {
          id: '1',
          type: 'new_booking',
          title: 'New Service Booking',
          message: 'John Smith has booked Regular House Cleaning for tomorrow at 10:00 AM',
          status: 'unread',
          booking: {
            id: 'b1',
            service: 'Regular House Cleaning',
            customer: {
              name: 'John Smith',
              address: '123 Main St, City',
            },
            dateTime: '2024-02-20T10:00:00Z',
            duration: '3 hours',
            price: 120,
          },
          createdAt: '2024-02-19T15:30:00Z',
        },
        {
          id: '2',
          type: 'booking_update',
          title: 'Booking Rescheduled',
          message: 'Sarah Johnson has rescheduled Deep Cleaning from Feb 21 to Feb 23',
          status: 'read',
          booking: {
            id: 'b2',
            service: 'Deep Cleaning',
            customer: {
              name: 'Sarah Johnson',
              address: '456 Oak Ave, City',
            },
            dateTime: '2024-02-23T09:00:00Z',
            duration: '6 hours',
            price: 250,
          },
          createdAt: '2024-02-19T12:45:00Z',
        },
        {
          id: '3',
          type: 'review',
          title: 'New Review',
          message: 'Michael Brown has left a 5-star review for House Cleaning',
          status: 'unread',
          review: {
            id: 'r1',
            rating: 5,
            comment: 'Excellent service! Very thorough and professional.',
            service: 'House Cleaning',
            customer: {
              name: 'Michael Brown',
            },
          },
          createdAt: '2024-02-19T10:15:00Z',
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = (notification) => {
    // Mark the notification as read
    setNotifications(
      notifications.map((n) =>
        n.id === notification.id ? { ...n, status: 'read' } : n
      )
    );

    // Navigate based on notification type
    switch (notification.type) {
      case 'new_booking':
      case 'booking_update':
        navigation.navigate('BookingDetails', {
          bookingId: notification.booking.id,
        });
        break;
      case 'review':
        navigation.navigate('ReviewDetails', {
          reviewId: notification.review.id,
        });
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_booking':
        return 'calendar';
      case 'booking_update':
        return 'clock';
      case 'review':
        return 'star';
      default:
        return 'bell';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      if (hours < 1) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes} minutes ago`;
      }
      return `${hours} hours ago`;
    }

    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} days ago`;
    }

    // More than 7 days
    return date.toLocaleDateString();
  };

  const renderNotification = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationCard,
        notification.status === 'unread' && styles.unreadCard,
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View
        style={[
          styles.iconContainer,
          notification.status === 'unread' && styles.unreadIcon,
        ]}
      >
        <Icon
          name={getNotificationIcon(notification.type)}
          size={24}
          color={notification.status === 'unread' ? '#2196F3' : '#666666'}
        />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text
            style={[
              styles.notificationTitle,
              notification.status === 'unread' && styles.unreadText,
            ]}
          >
            {notification.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatDate(notification.createdAt)}
          </Text>
        </View>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
      </View>
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
        <Text style={styles.title}>Notifications</Text>
        {notifications.some((n) => n.status === 'unread') && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {notifications.filter((n) => n.status === 'unread').length}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="bell-off" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map(renderNotification)}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
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
  notificationsList: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  unreadCard: {
    backgroundColor: '#F3F9FF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unreadIcon: {
    backgroundColor: '#E3F2FD',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    color: '#2196F3',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666666',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default Notifications;
