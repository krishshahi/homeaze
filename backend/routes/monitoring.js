const express = require('express');
const { body, query } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const monitoringService = require('../services/monitoringService');
const loggingService = require('../services/loggingService');
const cacheService = require('../services/cacheService');

const router = express.Router();

// Middleware to check admin access
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

/**
 * Health check endpoint (public)
 * GET /api/monitoring/health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await monitoringService.getSystemHealth();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: health
    });
  } catch (error) {
    loggingService.error('Health check failed', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      data: {
        status: 'unhealthy',
        error: error.message
      }
    });
  }
});

/**
 * Simple health check for load balancers
 * GET /api/monitoring/ping
 */
router.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * Application info
 * GET /api/monitoring/info
 */
router.get('/info', authenticateToken, requireAdmin, (req, res) => {
  try {
    const appInfo = monitoringService.getAppInfo();
    res.json({
      success: true,
      data: appInfo
    });
  } catch (error) {
    loggingService.error('Failed to get app info', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get application info'
    });
  }
});

/**
 * System metrics
 * GET /api/monitoring/metrics
 */
router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const systemHealth = await monitoringService.getSystemHealth();
    const performanceMetrics = monitoringService.getPerformanceMetrics();
    const cacheStats = await cacheService.getCacheStats();

    res.json({
      success: true,
      data: {
        system: systemHealth.system,
        performance: performanceMetrics,
        cache: cacheStats,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    loggingService.error('Failed to get system metrics', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system metrics'
    });
  }
});

/**
 * Performance metrics
 * GET /api/monitoring/performance
 */
router.get('/performance', authenticateToken, requireAdmin, (req, res) => {
  try {
    const metrics = monitoringService.getPerformanceMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    loggingService.error('Failed to get performance metrics', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics'
    });
  }
});

/**
 * Get recent errors
 * GET /api/monitoring/errors
 */
router.get('/errors', 
  authenticateToken,
  requireAdmin,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const errors = await monitoringService.getRecentErrors(limit);
      
      res.json({
        success: true,
        data: errors
      });
    } catch (error) {
      loggingService.error('Failed to get recent errors', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent errors'
      });
    }
  }
);

/**
 * Get logs
 * GET /api/monitoring/logs
 */
router.get('/logs',
  authenticateToken,
  requireAdmin,
  [
    query('level').optional().isIn(['debug', 'info', 'warn', 'error']).withMessage('Invalid log level'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    query('search').optional().isString().withMessage('Search must be a string')
  ],
  async (req, res) => {
    try {
      const {
        level,
        category,
        limit = 100,
        search = '',
        startDate,
        endDate
      } = req.query;

      const options = {
        level,
        category,
        limit: parseInt(limit),
        startDate: startDate ? new Date(startDate).getTime() : null,
        endDate: endDate ? new Date(endDate).getTime() : null
      };

      const logs = await loggingService.searchLogs(search, options);
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      loggingService.error('Failed to get logs', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get logs'
      });
    }
  }
);

/**
 * Get log statistics
 * GET /api/monitoring/logs/stats
 */
router.get('/logs/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const stats = loggingService.getLogStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    loggingService.error('Failed to get log stats', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get log statistics'
    });
  }
});

/**
 * Export logs
 * GET /api/monitoring/logs/export
 */
router.get('/logs/export',
  authenticateToken,
  requireAdmin,
  [
    query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
    query('level').optional().isIn(['debug', 'info', 'warn', 'error']).withMessage('Invalid log level'),
    query('category').optional().isString().withMessage('Category must be a string')
  ],
  async (req, res) => {
    try {
      const {
        format = 'json',
        level,
        category,
        startDate,
        endDate
      } = req.query;

      const options = {
        level,
        category,
        startDate: startDate ? new Date(startDate).getTime() : null,
        endDate: endDate ? new Date(endDate).getTime() : null
      };

      const logs = await loggingService.exportLogs(format, options);
      
      // Set appropriate headers for download
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `homeaze-logs-${timestamp}.${format}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      
      if (format === 'csv') {
        res.send(logs);
      } else {
        res.json(logs);
      }
    } catch (error) {
      loggingService.error('Failed to export logs', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export logs'
      });
    }
  }
);

/**
 * Cache statistics
 * GET /api/monitoring/cache
 */
router.get('/cache', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await cacheService.getCacheStats();
    const health = await cacheService.healthCheck();
    
    res.json({
      success: true,
      data: {
        stats,
        health
      }
    });
  } catch (error) {
    loggingService.error('Failed to get cache stats', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics'
    });
  }
});

/**
 * Clear cache
 * DELETE /api/monitoring/cache
 */
router.delete('/cache',
  authenticateToken,
  requireAdmin,
  [
    body('pattern').optional().isString().withMessage('Pattern must be a string'),
    body('keys').optional().isArray().withMessage('Keys must be an array')
  ],
  async (req, res) => {
    try {
      const { pattern, keys } = req.body;
      
      if (pattern) {
        await cacheService.delPattern(pattern);
        loggingService.info('Cache cleared by pattern', { pattern, admin: req.user.id });
      } else if (keys && keys.length > 0) {
        for (const key of keys) {
          await cacheService.del(key);
        }
        loggingService.info('Cache cleared by keys', { keys, admin: req.user.id });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Pattern or keys required'
        });
      }
      
      res.json({
        success: true,
        message: 'Cache cleared successfully'
      });
    } catch (error) {
      loggingService.error('Failed to clear cache', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache'
      });
    }
  }
);

/**
 * Warm cache
 * POST /api/monitoring/cache/warm
 */
router.post('/cache/warm',
  authenticateToken,
  requireAdmin,
  [
    body('type').isIn(['popular_services', 'trending_searches', 'top_providers']).withMessage('Invalid cache type'),
    body('data').notEmpty().withMessage('Data is required')
  ],
  async (req, res) => {
    try {
      const { type, data } = req.body;
      
      await cacheService.warmCache(type, data);
      loggingService.info('Cache warmed', { type, admin: req.user.id });
      
      res.json({
        success: true,
        message: 'Cache warmed successfully'
      });
    } catch (error) {
      loggingService.error('Failed to warm cache', error);
      res.status(500).json({
        success: false,
        message: 'Failed to warm cache'
      });
    }
  }
);

/**
 * Dashboard data
 * GET /api/monitoring/dashboard
 */
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      systemHealth,
      performanceMetrics,
      logStats,
      cacheStats,
      appInfo
    ] = await Promise.all([
      monitoringService.getSystemHealth(),
      monitoringService.getPerformanceMetrics(),
      loggingService.getLogStats(),
      cacheService.getCacheStats(),
      monitoringService.getAppInfo()
    ]);

    res.json({
      success: true,
      data: {
        system: systemHealth,
        performance: performanceMetrics,
        logs: logStats,
        cache: cacheStats,
        app: appInfo,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    loggingService.error('Failed to get dashboard data', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
});

/**
 * Test alert system
 * POST /api/monitoring/test-alert
 */
router.post('/test-alert',
  authenticateToken,
  requireAdmin,
  [
    body('type').isString().notEmpty().withMessage('Alert type is required'),
    body('message').isString().notEmpty().withMessage('Message is required')
  ],
  async (req, res) => {
    try {
      const { type, message } = req.body;
      
      await monitoringService.sendAlert(`test_${type}`, {
        message,
        admin: req.user.id,
        timestamp: Date.now()
      });
      
      loggingService.info('Test alert sent', { type, message, admin: req.user.id });
      
      res.json({
        success: true,
        message: 'Test alert sent successfully'
      });
    } catch (error) {
      loggingService.error('Failed to send test alert', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test alert'
      });
    }
  }
);

/**
 * Get recent activity summary
 * GET /api/monitoring/activity
 */
router.get('/activity',
  authenticateToken,
  requireAdmin,
  [
    query('hours').optional().isInt({ min: 1, max: 168 }).withMessage('Hours must be between 1 and 168')
  ],
  async (req, res) => {
    try {
      const hours = parseInt(req.query.hours) || 24;
      const cutoff = Date.now() - (hours * 60 * 60 * 1000);

      // Get activity data from various sources
      const performanceMetrics = monitoringService.getPerformanceMetrics();
      const logStats = loggingService.getLogStats();
      
      // Filter for the specified time period
      const recentLogs = loggingService.getRecentLogs(1000);
      const recentActivity = recentLogs.filter(log => log.timestamp >= cutoff);

      const activityByHour = {};
      for (let i = 0; i < hours; i++) {
        const hourStart = Date.now() - (i * 60 * 60 * 1000);
        const hourKey = new Date(hourStart).getHours();
        
        activityByHour[hourKey] = recentActivity.filter(log => 
          log.timestamp >= hourStart - (60 * 60 * 1000) && 
          log.timestamp < hourStart
        ).length;
      }

      res.json({
        success: true,
        data: {
          period: `${hours} hours`,
          totalRequests: performanceMetrics.total.requests,
          totalErrors: performanceMetrics.total.errors,
          errorRate: performanceMetrics.total.errorRate,
          activityByHour,
          logStats: {
            total: logStats.total,
            errors: logStats.levels.error || 0,
            warnings: logStats.levels.warn || 0
          }
        }
      });
    } catch (error) {
      loggingService.error('Failed to get activity summary', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get activity summary'
      });
    }
  }
);

module.exports = router;
