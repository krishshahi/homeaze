// Enhanced Notification Service - Production Ready
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import io from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.129:3001/api';
const WEBSOCKET_URL = (process.env.REACT_APP_API_URL || 'http://192.168.1.129:3001/api').replace(/\/api$/, '');

class NotificationService {
  static socket = null;
  static notificationListeners = [];
  static pushToken = null;
  
  /**
   * Initialize notification service
   * @param {Function} onNotificationReceived - Callback when notification is received
   * @param {Function} onNotificationResponse - Callback when notification is tapped
   */
  static async initialize(onNotificationReceived, onNotificationResponse) {
    try {
      console.log('📱 Initializing notification service...');
      
      // Configure notification handling
      await this.configureNotifications();
      
      // Register for push notifications
      await this.registerForPushNotifications();
      
      // Initialize WebSocket
      await this.initializeWebSocket();
      
      // Set up notification listeners
      this.setupNotificationListeners(onNotificationReceived, onNotificationResponse);
      
      console.log('✅ Notification service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
    }
  }
  
  /**
   * Configure notification behavior
   */
  static async configureNotifications() {
    // Set how notifications should be handled when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    
    // Configure notification categories for actions
    await Notifications.setNotificationCategoryAsync('booking_request', [
      {
        identifier: 'accept',
        buttonTitle: 'Accept',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'reject',
        buttonTitle: 'Reject',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'view',
        buttonTitle: 'View',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  }
  
  /**
   * Register device for push notifications
   */
  static async registerForPushNotifications() {
    try {
      if (!Device.isDevice) {
        console.log('📱 Push notifications only work on physical devices');
        return null;
      }
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Failed to get push notification permission');
        return null;
      }
      
      // Get push token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.pushToken = token;
      
      console.log('🔑 Push token:', token);
      
      // Configure for Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      // Send token to backend
      await this.registerPushToken(token);
      
      return token;
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      return null;
    }
  }
  
  /**
   * Send push token to backend
   */
  static async registerPushToken(token) {
    try {
      const authToken = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const response = await fetch(`${API_BASE_URL}/notifications/register-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({
          pushToken: token,
          deviceType: Platform.OS,
          deviceInfo: {
            brand: Device.brand,
            modelName: Device.modelName,
            osName: Device.osName,
            osVersion: Device.osVersion,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to register push token');
      }
      
      console.log('✅ Push token registered successfully');
    } catch (error) {
      console.error('❌ Error registering push token:', error);
    }
  }
  
  /**
   * Initialize WebSocket connection for real-time notifications
   */
  static async initializeWebSocket() {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      if (!token) {
        console.log('❌ No auth token found for WebSocket');
        return;
      }
      
      this.socket = io(WEBSOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });
      
      this.socket.on('connect', () => {
        console.log('🔗 Connected to notification WebSocket');
      });
      
      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from notification WebSocket');
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
      });
      
      // Listen for real-time notifications
      this.socket.on('notification', (notification) => {
        console.log('📨 Real-time notification received:', notification);
        this.handleIncomingNotification(notification);
      });
      
      this.socket.on('booking_update', (data) => {
        console.log('📋 Booking update received:', data);
        this.handleBookingUpdate(data);
      });
      
    } catch (error) {
      console.error('❌ Error initializing WebSocket:', error);
    }
  }
  
  /**
   * Set up notification listeners
   */
  static setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
    // Listen for notifications when app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Foreground notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });
    
    // Listen for notification responses (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      
      const { notification, actionIdentifier } = response;
      const data = notification.request.content.data;
      
      // Handle different action identifiers
      if (actionIdentifier === 'accept' && data.bookingId) {
        this.handleBookingAction('accept', data.bookingId);
      } else if (actionIdentifier === 'reject' && data.bookingId) {
        this.handleBookingAction('reject', data.bookingId);
      } else if (onNotificationResponse) {
        onNotificationResponse(response);
      }
    });
    
    this.notificationListeners = [notificationListener, responseListener];
  }
  
  /**
   * Handle incoming real-time notification
   */
  static handleIncomingNotification(notification) {
    // Show local notification if app is in background
    this.showLocalNotification(
      notification.title,
      notification.message,
      notification.data
    );
  }
  
  /**
   * Handle booking updates
   */
  static handleBookingUpdate(data) {
    const { booking, type } = data;
    
    let title = 'Booking Update';
    let message = '';
    
    switch (type) {
      case 'status_changed':
        message = `Booking ${booking.id} status changed to ${booking.status}`;
        break;
      case 'payment_received':
        message = `Payment received for booking ${booking.id}`;
        break;
      case 'reminder':
        message = `Reminder: Service scheduled for ${new Date(booking.scheduledDate).toLocaleDateString()}`;
        break;
      default:
        message = `Booking ${booking.id} has been updated`;
    }
    
    this.showLocalNotification(title, message, {
      bookingId: booking.id,
      type: 'booking_update',
      ...booking,
    });
  }
  
  /**
   * Show local notification
   */
  static async showLocalNotification(title, message, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data,
          categoryIdentifier: data.type === 'booking_request' ? 'booking_request' : undefined,
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('❌ Error showing local notification:', error);
    }
  }
  
  /**
   * Handle booking actions from notifications
   */
  static async handleBookingAction(action, bookingId) {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} booking`);
      }
      
      console.log(`✅ Booking ${action}ed successfully`);
      
      // Show confirmation notification
      this.showLocalNotification(
        'Action Completed',
        `Booking has been ${action}ed successfully`,
        { bookingId }
      );
      
    } catch (error) {
      console.error(`❌ Error ${action}ing booking:`, error);
    }
  }
  
  /**
   * Get notification history
   */
  static async getNotificationHistory(filters = {}) {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = `${API_BASE_URL}/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification history');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching notification history:', error);
      throw error;
    }
  }
  
  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId) {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      console.log('✅ Notification marked as read');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }
  
  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead() {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  }
  
  /**
   * Delete notification
   */
  static async deleteNotification(notificationId) {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      console.log('✅ Notification deleted');
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }
  
  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(preferences) {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(preferences),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }
      
      console.log('✅ Notification preferences updated');
    } catch (error) {
      console.error('❌ Error updating notification preferences:', error);
    }
  }
  
  /**
   * Get notification preferences
   */
  static async getNotificationPreferences() {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching notification preferences:', error);
      throw error;
    }
  }
  
  /**
   * Send test notification (for debugging)
   */
  static async sendTestNotification() {
    try {
      await this.showLocalNotification(
        'Test Notification',
        'This is a test notification from HomeAze',
        { type: 'test' }
      );
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  }
  
  /**
   * Get unread notification count
   */
  static async getUnreadCount() {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      return 0;
    }
  }
  
  /**
   * Clean up notification service
   */
  static cleanup() {
    // Remove notification listeners
    this.notificationListeners.forEach(listener => {
      listener.remove();
    });
    this.notificationListeners = [];
    
    // Disconnect WebSocket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    console.log('🧹 Notification service cleaned up');
  }
  
  /**
   * Reconnect WebSocket if disconnected
   */
  static async reconnectWebSocket() {
    if (!this.socket || !this.socket.connected) {
      console.log('🔄 Reconnecting WebSocket...');
      await this.initializeWebSocket();
    }
  }
  
  /**
   * Check notification permissions status
   */
  static async checkPermissionStatus() {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }
  
  /**
   * Open device notification settings
   */
  static async openNotificationSettings() {
    if (Platform.OS === 'ios') {
      // On iOS, we can't open settings directly, show alert instead
      console.log('Please enable notifications in Settings > HomeAze > Notifications');
    } else if (Platform.OS === 'android') {
      // On Android, we can open notification settings
      Notifications.openNotificationSettingsAsync();
    }
  }
}

export default NotificationService;
