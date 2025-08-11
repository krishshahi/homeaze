const express = require('express');
const router = express.Router();
const { notificationService } = require('../services/notificationService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      unreadOnly
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      status,
      unreadOnly: unreadOnly === 'true'
    };

    const result = await notificationService.getUserNotifications(
      req.user.id,
      options
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

// Send custom notification (admin only)
router.post(
  '/',
  authenticateToken,
  [
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body is required'),
    body('type').isIn([
      'booking_confirmed', 'booking_cancelled', 'booking_reminder',
      'payment_success', 'payment_failed', 'payment_reminder',
      'provider_assigned', 'service_completed', 'review_request',
      'security_alert', 'system_update', 'promotional', 'custom'
    ]).withMessage('Invalid notification type'),
    body('channels').isArray().withMessage('Channels must be an array'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      // Check if user is admin (implement your admin check logic)
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      const {
        userId,
        title,
        body,
        type,
        channels,
        priority = 'normal',
        data = {},
        scheduledFor,
        expiresAt
      } = req.body;

      const notificationData = {
        userId,
        title,
        body,
        type,
        channels,
        priority,
        data,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      };

      const result = await notificationService.sendNotification(notificationData);

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification'
      });
    }
  }
);

// Send template notification
router.post(
  '/template',
  authenticateToken,
  [
    body('templateType').notEmpty().withMessage('Template type is required'),
    body('templateData').isObject().withMessage('Template data must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { templateType, templateData } = req.body;

      const result = await notificationService.sendTemplateNotification(
        req.user.id,
        templateType,
        templateData
      );

      res.status(201).json({
        success: true,
        message: 'Template notification sent successfully',
        data: result
      });
    } catch (error) {
      console.error('Error sending template notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send template notification'
      });
    }
  }
);

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const result = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: result
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: result
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await notificationService.deleteNotification(
      req.params.id,
      req.user.id
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Register FCM token
router.post(
  '/fcm-token',
  authenticateToken,
  [
    body('token').notEmpty().withMessage('FCM token is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { token } = req.body;

      const result = await notificationService.registerFCMToken(req.user.id, token);

      res.json({
        success: true,
        message: 'FCM token registered successfully',
        data: result
      });
    } catch (error) {
      console.error('Error registering FCM token:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register FCM token'
      });
    }
  }
);

// Unregister FCM token
router.delete(
  '/fcm-token',
  authenticateToken,
  [
    body('token').notEmpty().withMessage('FCM token is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { token } = req.body;

      const result = await notificationService.unregisterFCMToken(req.user.id, token);

      res.json({
        success: true,
        message: 'FCM token unregistered successfully',
        data: result
      });
    } catch (error) {
      console.error('Error unregistering FCM token:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unregister FCM token'
      });
    }
  }
);

// Schedule notification (admin only)
router.post(
  '/schedule',
  authenticateToken,
  [
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body is required'),
    body('type').isIn([
      'booking_confirmed', 'booking_cancelled', 'booking_reminder',
      'payment_success', 'payment_failed', 'payment_reminder',
      'provider_assigned', 'service_completed', 'review_request',
      'security_alert', 'system_update', 'promotional', 'custom'
    ]).withMessage('Invalid notification type'),
    body('channels').isArray().withMessage('Channels must be an array'),
    body('scheduledFor').isISO8601().withMessage('Valid scheduled date is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      const {
        userId,
        title,
        body,
        type,
        channels,
        priority = 'normal',
        data = {},
        scheduledFor,
        expiresAt
      } = req.body;

      const notificationData = {
        userId,
        title,
        body,
        type,
        channels,
        priority,
        data,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      };

      const result = await notificationService.scheduleNotification(
        notificationData,
        new Date(scheduledFor)
      );

      res.status(201).json({
        success: true,
        message: 'Notification scheduled successfully',
        data: result
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule notification'
      });
    }
  }
);

// Process scheduled notifications (cron job endpoint)
router.post('/process-scheduled', async (req, res) => {
  try {
    // Add API key or internal authentication here
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const processedCount = await notificationService.processScheduledNotifications();

    res.json({
      success: true,
      message: `Processed ${processedCount} scheduled notifications`
    });
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process scheduled notifications'
    });
  }
});

// Cleanup expired notifications (cron job endpoint)
router.post('/cleanup', async (req, res) => {
  try {
    // Add API key or internal authentication here
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const cleanedCount = await notificationService.cleanupExpiredNotifications();

    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired notifications`
    });
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup notifications'
    });
  }
});

module.exports = router;
