const express = require('express');
const router = express.Router();
const { analyticsService } = require('../services/analyticsService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Track analytics event
router.post(
  '/track',
  authenticateToken,
  [
    body('eventType').isIn([
      'page_view', 'service_view', 'service_search', 'booking_started', 
      'booking_completed', 'payment_completed', 'review_submitted',
      'app_opened', 'feature_used', 'error_occurred', 'session_ended'
    ]).withMessage('Invalid event type'),
    body('eventData').optional().isObject(),
    body('sessionId').optional().notEmpty(),
    body('deviceInfo').optional().isObject(),
    body('location').optional().isObject()
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

      const eventData = {
        ...req.body,
        userId: req.user.id,
        timestamp: new Date()
      };

      const event = await analyticsService.trackEvent(eventData);

      res.status(201).json({
        success: true,
        message: 'Event tracked successfully',
        data: event
      });
    } catch (error) {
      console.error('Error tracking event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track event'
      });
    }
  }
);

// Get personalized service recommendations
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recommendations = await analyticsService.getServiceRecommendations(
      req.user.id,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
});

// Get user behavior profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const behavior = await analyticsService.getUserBehavior(req.user.id);

    if (!behavior) {
      return res.status(404).json({
        success: false,
        message: 'User behavior profile not found'
      });
    }

    res.json({
      success: true,
      data: behavior
    });
  } catch (error) {
    console.error('Error fetching user behavior:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user behavior profile'
    });
  }
});

// Get dashboard analytics (admin only)
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { timeRange = '7d' } = req.query;

    const analytics = await analyticsService.getDashboardAnalytics(timeRange);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics'
    });
  }
});

// Forecast service demand (admin only)
router.get('/forecast/:serviceId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { serviceId } = req.params;
    const { days = 30 } = req.query;

    const forecast = await analyticsService.forecastDemand(
      serviceId,
      parseInt(days)
    );

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Error forecasting demand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to forecast demand'
    });
  }
});

// Get user insights (admin only)
router.get('/users/insights', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const {
      timeRange = '30d',
      segment,
      limit = 100,
      page = 1
    } = req.query;

    // This would be implemented in the analytics service
    // const insights = await analyticsService.getUserInsights({
    //   timeRange,
    //   segment,
    //   limit: parseInt(limit),
    //   page: parseInt(page)
    // });

    res.json({
      success: true,
      message: 'User insights retrieved successfully',
      // data: insights
      data: {
        users: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user insights'
    });
  }
});

// Get service performance analytics (admin only)
router.get('/services/performance', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { timeRange = '30d', category } = req.query;

    const startDate = analyticsService.getStartDate(timeRange);
    const performance = await analyticsService.getServicePerformance(startDate);

    // Filter by category if provided
    let filteredPerformance = performance;
    if (category) {
      filteredPerformance = performance.filter(service => 
        service.category === category
      );
    }

    res.json({
      success: true,
      data: filteredPerformance
    });
  } catch (error) {
    console.error('Error fetching service performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service performance'
    });
  }
});

// Get geographic analytics (admin only)
router.get('/geographic', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { timeRange = '30d' } = req.query;

    const startDate = analyticsService.getStartDate(timeRange);
    const geographicData = await analyticsService.getGeographicDistribution(startDate);

    res.json({
      success: true,
      data: geographicData
    });
  } catch (error) {
    console.error('Error fetching geographic analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch geographic analytics'
    });
  }
});

// Get conversion funnel analytics (admin only)
router.get('/conversion-funnel', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { timeRange = '30d', serviceCategory } = req.query;

    // This would be implemented in the analytics service
    // const funnelData = await analyticsService.getConversionFunnel({
    //   timeRange,
    //   serviceCategory
    // });

    res.json({
      success: true,
      message: 'Conversion funnel data retrieved successfully',
      // data: funnelData
      data: {
        steps: [
          { name: 'App Opens', count: 10000, rate: 100 },
          { name: 'Service Views', count: 7500, rate: 75 },
          { name: 'Booking Started', count: 3750, rate: 37.5 },
          { name: 'Booking Completed', count: 2250, rate: 22.5 },
          { name: 'Payment Completed', count: 2100, rate: 21 }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversion funnel data'
    });
  }
});

// Get cohort analysis (admin only)
router.get('/cohorts', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const {
      cohortType = 'monthly',
      metric = 'retention',
      period = '12'
    } = req.query;

    // This would be implemented in the analytics service
    // const cohortData = await analyticsService.getCohortAnalysis({
    //   cohortType,
    //   metric,
    //   period: parseInt(period)
    // });

    res.json({
      success: true,
      message: 'Cohort analysis retrieved successfully',
      // data: cohortData
      data: {
        cohorts: [],
        periods: [],
        metric,
        cohortType
      }
    });
  } catch (error) {
    console.error('Error fetching cohort analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cohort analysis'
    });
  }
});

// Get A/B test results (admin only)
router.get('/ab-tests/:testId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { testId } = req.params;

    // This would be implemented in the analytics service
    // const testResults = await analyticsService.getABTestResults(testId);

    res.json({
      success: true,
      message: 'A/B test results retrieved successfully',
      // data: testResults
      data: {
        testId,
        status: 'completed',
        variants: [
          { name: 'Control', users: 5000, conversions: 250, rate: 5.0 },
          { name: 'Variant A', users: 5000, conversions: 300, rate: 6.0 }
        ],
        significance: 0.05,
        winner: 'Variant A'
      }
    });
  } catch (error) {
    console.error('Error fetching A/B test results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch A/B test results'
    });
  }
});

// Export analytics data (admin only)
router.get('/export', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const {
      type = 'users',
      format = 'csv',
      timeRange = '30d',
      filters = {}
    } = req.query;

    // This would be implemented in the analytics service
    // const exportData = await analyticsService.exportData({
    //   type,
    //   format,
    //   timeRange,
    //   filters: JSON.parse(filters)
    // });

    res.json({
      success: true,
      message: 'Export initiated successfully',
      // data: exportData
      data: {
        exportId: 'export_12345',
        status: 'processing',
        estimatedTime: '5 minutes'
      }
    });
  } catch (error) {
    console.error('Error initiating data export:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate data export'
    });
  }
});

// Get real-time analytics (admin only)
router.get('/realtime', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // This would be implemented in the analytics service
    // const realtimeData = await analyticsService.getRealtimeAnalytics();

    res.json({
      success: true,
      data: {
        activeUsers: 250,
        currentBookings: 15,
        revenueToday: 5420.50,
        topServices: [
          { name: 'House Cleaning', activeBookings: 5 },
          { name: 'Plumbing', activeBookings: 3 },
          { name: 'Electrical', activeBookings: 2 }
        ],
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time analytics'
    });
  }
});

// Get user segments (admin only)
router.get('/segments', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // This would be implemented in the analytics service
    // const segments = await analyticsService.getUserSegments();

    res.json({
      success: true,
      data: [
        {
          name: 'High Value Customers',
          description: 'Users with high lifetime value',
          count: 450,
          criteria: 'avgBookingValue > 500 AND bookingFrequency > 5'
        },
        {
          name: 'At Risk Users',
          description: 'Users likely to churn',
          count: 230,
          criteria: 'churnRisk > 0.7'
        },
        {
          name: 'New Users',
          description: 'Users registered in last 30 days',
          count: 180,
          criteria: 'daysSinceRegistration < 30'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching user segments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user segments'
    });
  }
});

// Update ML models (admin only)
router.post('/models/retrain', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { modelType } = req.body;

    // This would be implemented in the analytics service
    // const retrainResult = await analyticsService.retrainModel(modelType);

    res.json({
      success: true,
      message: 'Model retraining initiated successfully',
      // data: retrainResult
      data: {
        modelType,
        status: 'training',
        estimatedTime: '30 minutes'
      }
    });
  } catch (error) {
    console.error('Error retraining models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate model retraining'
    });
  }
});

module.exports = router;

