const admin = require('firebase-admin');
const socketService = require('./socketService');
const { emailService } = require('./emailService');
const { smsService } = require('./smsService');
const User = require('../models/User');
const mongoose = require('mongoose');

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  body: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: [
      'booking_confirmed', 'booking_cancelled', 'booking_reminder',
      'payment_success', 'payment_failed', 'payment_reminder',
      'provider_assigned', 'service_completed', 'review_request',
      'security_alert', 'system_update', 'promotional', 'custom'
    ],
    required: true 
  },
  data: { 
    type: Object, 
    default: {} 
  },
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high', 'urgent'], 
    default: 'normal' 
  },
  channels: [{
    type: String,
    enum: ['push', 'email', 'sms', 'in_app', 'socket']
  }],
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'], 
    default: 'pending' 
  },
  scheduledFor: { 
    type: Date 
  },
  sentAt: { 
    type: Date 
  },
  readAt: { 
    type: Date 
  },
  expiresAt: { 
    type: Date 
  }
}, {
  timestamps: true,
  index: [
    { userId: 1, createdAt: -1 },
    { status: 1 },
    { scheduledFor: 1 },
    { type: 1 }
  ]
});

const Notification = mongoose.model('Notification', notificationSchema);

// Initialize Firebase Admin SDK
let firebaseAdmin = null;

const initializeFirebase = () => {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.warn('Firebase service account not configured');
      return;
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
};

class NotificationService {
  constructor() {
    this.subscribers = new Map(); // userId -> socket connections
    this.templates = new Map();
    this.initializeTemplates();
    
    // Initialize Firebase if not already done
    if (!firebaseAdmin && process.env.FIREBASE_SERVICE_ACCOUNT) {
      initializeFirebase();
    }
  }

  initializeTemplates() {
    // Notification templates for consistency
    this.templates.set('booking_confirmed', {
      title: 'Booking Confirmed!',
      body: 'Your booking for {{serviceName}} has been confirmed for {{date}} at {{time}}.',
      channels: ['push', 'email', 'in_app']
    });

    this.templates.set('booking_cancelled', {
      title: 'Booking Cancelled',
      body: 'Your booking for {{serviceName}} on {{date}} has been cancelled.',
      channels: ['push', 'email', 'sms', 'in_app']
    });

    this.templates.set('booking_reminder', {
      title: 'Upcoming Service',
      body: 'Reminder: {{serviceName}} is scheduled for {{date}} at {{time}}.',
      channels: ['push', 'sms']
    });

    this.templates.set('payment_success', {
      title: 'Payment Successful',
      body: 'Your payment of ${{amount}} for {{serviceName}} has been processed successfully.',
      channels: ['push', 'email', 'in_app']
    });

    this.templates.set('payment_failed', {
      title: 'Payment Failed',
      body: 'Your payment for {{serviceName}} could not be processed. Please update your payment method.',
      channels: ['push', 'email', 'sms', 'in_app'],
      priority: 'high'
    });

    this.templates.set('provider_assigned', {
      title: 'Service Provider Assigned',
      body: '{{providerName}} has been assigned to your {{serviceName}} booking.',
      channels: ['push', 'in_app']
    });

    this.templates.set('service_completed', {
      title: 'Service Completed',
      body: 'Your {{serviceName}} service has been completed. Please rate your experience!',
      channels: ['push', 'email', 'in_app']
    });

    this.templates.set('security_alert', {
      title: 'Security Alert',
      body: '{{alertType}}: {{message}}',
      channels: ['push', 'email', 'sms', 'in_app'],
      priority: 'urgent'
    });
  }

  // Create and send notification
  async sendNotification(notificationData) {
    try {
      // Create notification record
      const notification = new Notification(notificationData);
      await notification.save();

      // Process through different channels
      const results = await this.processNotification(notification);

      // Update notification status based on results
      const hasSuccess = Object.values(results).some(result => result.success);
      notification.status = hasSuccess ? 'sent' : 'failed';
      notification.sentAt = new Date();
      await notification.save();

      return {
        success: hasSuccess,
        notificationId: notification._id,
        results
      };

    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Process notification through multiple channels
  async processNotification(notification) {
    const results = {};
    const user = await User.findById(notification.userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Process each channel
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'push':
            results.push = await this.sendPushNotification(notification, user);
            break;
          case 'email':
            results.email = await this.sendEmailNotification(notification, user);
            break;
          case 'sms':
            results.sms = await this.sendSMSNotification(notification, user);
            break;
          case 'in_app':
            results.in_app = await this.sendInAppNotification(notification, user);
            break;
          case 'socket':
            results.socket = await this.sendSocketNotification(notification, user);
            break;
        }
      } catch (error) {
        console.error(`Error sending ${channel} notification:`, error);
        results[channel] = { success: false, error: error.message };
      }
    }

    return results;
  }

  // Send push notification via Firebase
  async sendPushNotification(notification, user) {
    if (!firebaseAdmin || !user.fcmTokens || user.fcmTokens.length === 0) {
      return { success: false, reason: 'No FCM tokens available' };
    }

    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          type: notification.type,
          notificationId: notification._id.toString(),
          ...notification.data
        },
        tokens: user.fcmTokens
      };

      const response = await firebaseAdmin.messaging().sendMulticast(message);
      
      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const validTokens = [];
        response.responses.forEach((resp, idx) => {
          if (resp.success) {
            validTokens.push(user.fcmTokens[idx]);
          }
        });
        
        if (validTokens.length !== user.fcmTokens.length) {
          await User.findByIdAndUpdate(user._id, { fcmTokens: validTokens });
        }
      }

      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount
      };

    } catch (error) {
      console.error('Push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email notification
  async sendEmailNotification(notification, user) {
    try {
      const result = await emailService.sendCustomEmail(
        user.email,
        notification.title,
        notification.body,
        {
          type: notification.type,
          data: notification.data
        }
      );

      return { success: true, messageId: result.messageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Send SMS notification
  async sendSMSNotification(notification, user) {
    if (!user.phoneNumber || !user.phoneVerified) {
      return { success: false, reason: 'Phone number not verified' };
    }

    try {
      const result = await smsService.sendSMS(
        user.phoneNumber,
        `${notification.title}: ${notification.body}`
      );

      return { success: true, messageId: result.sid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Send in-app notification
  async sendInAppNotification(notification, user) {
    // This just ensures the notification is stored in the database
    // Frontend will fetch these via API
    return { success: true, stored: true };
  }

  // Send real-time socket notification
  async sendSocketNotification(notification, user) {
    try {
      const socketConnections = socketService.getUserConnections(user._id.toString());
      
      if (socketConnections && socketConnections.length > 0) {
        socketConnections.forEach(socket => {
          socket.emit('notification', {
            id: notification._id,
            title: notification.title,
            body: notification.body,
            type: notification.type,
            data: notification.data,
            priority: notification.priority,
            timestamp: notification.createdAt
          });
        });

        return { success: true, connectionCount: socketConnections.length };
      }

      return { success: false, reason: 'User not connected' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Template-based notification sending
  async sendTemplateNotification(userId, templateType, templateData) {
    const template = this.templates.get(templateType);
    
    if (!template) {
      throw new Error(`Template ${templateType} not found`);
    }

    // Replace template variables
    let title = template.title;
    let body = template.body;

    Object.keys(templateData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      title = title.replace(regex, templateData[key]);
      body = body.replace(regex, templateData[key]);
    });

    const notificationData = {
      userId,
      title,
      body,
      type: templateType,
      data: templateData,
      channels: template.channels,
      priority: template.priority || 'normal'
    };

    return await this.sendNotification(notificationData);
  }

  // Schedule notification for later
  async scheduleNotification(notificationData, scheduledFor) {
    const notification = new Notification({
      ...notificationData,
      scheduledFor,
      status: 'pending'
    });

    await notification.save();
    return notification;
  }

  // Get user notifications with pagination
  async getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      unreadOnly = false
    } = options;

    const query = { userId };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (unreadOnly) query.readAt = { $exists: false };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments(query);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { 
        status: 'read', 
        readAt: new Date() 
      },
      { new: true }
    );

    if (result) {
      // Emit real-time update
      const socketConnections = socketService.getUserConnections(userId.toString());
      if (socketConnections) {
        socketConnections.forEach(socket => {
          socket.emit('notification_read', { notificationId });
        });
      }
    }

    return result;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { userId, readAt: { $exists: false } },
      { 
        status: 'read', 
        readAt: new Date() 
      }
    );

    // Emit real-time update
    const socketConnections = socketService.getUserConnections(userId.toString());
    if (socketConnections) {
      socketConnections.forEach(socket => {
        socket.emit('notifications_all_read');
      });
    }

    return result;
  }

  // Get unread count
  async getUnreadCount(userId) {
    return await Notification.countDocuments({
      userId,
      readAt: { $exists: false }
    });
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    return await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });
  }

  // Process scheduled notifications (should be called by a cron job)
  async processScheduledNotifications() {
    try {
      const now = new Date();
      const scheduledNotifications = await Notification.find({
        scheduledFor: { $lte: now },
        status: 'pending'
      });

      console.log(`Processing ${scheduledNotifications.length} scheduled notifications`);

      for (const notification of scheduledNotifications) {
        try {
          await this.processNotification(notification);
          notification.status = 'sent';
          notification.sentAt = new Date();
          await notification.save();
        } catch (error) {
          console.error(`Error processing scheduled notification ${notification._id}:`, error);
          notification.status = 'failed';
          await notification.save();
        }
      }

      return scheduledNotifications.length;
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      throw error;
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    const now = new Date();
    const result = await Notification.deleteMany({
      expiresAt: { $lte: now }
    });

    console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return result.deletedCount;
  }

  // Register FCM token for a user
  async registerFCMToken(userId, token) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Add token if not already present
      if (!user.fcmTokens) {
        user.fcmTokens = [];
      }

      if (!user.fcmTokens.includes(token)) {
        user.fcmTokens.push(token);
        await user.save();
      }

      return { success: true };
    } catch (error) {
      console.error('Error registering FCM token:', error);
      throw error;
    }
  }

  // Unregister FCM token
  async unregisterFCMToken(userId, token) {
    try {
      const result = await User.findByIdAndUpdate(
        userId,
        { $pull: { fcmTokens: token } },
        { new: true }
      );

      return { success: !!result };
    } catch (error) {
      console.error('Error unregistering FCM token:', error);
      throw error;
    }
  }
}

// Initialize service instance
const notificationService = new NotificationService();

// Export service and model
module.exports = {
  notificationService,
  Notification
};
