const os = require('os');
const mongoose = require('mongoose');
const cacheService = require('./cacheService');
const notificationService = require('./notificationService');

class MonitoringService {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      cpuUsage: [],
    };
    this.healthChecks = new Map();
    this.alerts = new Map();
    this.isShuttingDown = false;
    
    // Initialize periodic monitoring
    this.startPeriodicMonitoring();
  }

  /**
   * Record request metrics
   */
  recordRequest(method, path, statusCode, responseTime) {
    this.metrics.requests++;
    
    if (statusCode >= 400) {
      this.metrics.errors++;
    }
    
    this.metrics.responseTime.push({
      method,
      path,
      statusCode,
      responseTime,
      timestamp: Date.now(),
    });
    
    // Keep only last 1000 entries
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime = this.metrics.responseTime.slice(-1000);
    }
  }

  /**
   * Record error
   */
  recordError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      severity: this.getErrorSeverity(error),
    };
    
    console.error('Error recorded:', errorData);
    
    // Store in cache for monitoring dashboard
    cacheService.set(
      `error:${Date.now()}:${Math.random()}`,
      errorData,
      cacheService.TTL.DAY
    );
    
    // Send alert for critical errors
    if (errorData.severity === 'critical') {
      this.sendAlert('critical_error', errorData);
    }
  }

  /**
   * Get error severity
   */
  getErrorSeverity(error) {
    if (error.message.includes('ECONNREFUSED') || 
        error.message.includes('database') ||
        error.message.includes('payment')) {
      return 'critical';
    }
    
    if (error.message.includes('validation') ||
        error.message.includes('authentication')) {
      return 'warning';
    }
    
    return 'info';
  }

  /**
   * System health check
   */
  async getSystemHealth() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: {},
      system: await this.getSystemMetrics(),
    };

    // Database health check
    try {
      const dbState = mongoose.connection.readyState;
      health.checks.database = {
        status: dbState === 1 ? 'healthy' : 'unhealthy',
        connected: dbState === 1,
        readyState: dbState,
      };
      
      if (dbState === 1) {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        health.checks.database.responseTime = `${Date.now() - start}ms`;
      }
    } catch (error) {
      health.checks.database = {
        status: 'unhealthy',
        error: error.message,
      };
      health.status = 'degraded';
    }

    // Redis health check
    try {
      const redisHealth = await cacheService.healthCheck();
      health.checks.redis = redisHealth;
      
      if (redisHealth.status !== 'healthy') {
        health.status = 'degraded';
      }
    } catch (error) {
      health.checks.redis = {
        status: 'unhealthy',
        error: error.message,
      };
      health.status = 'degraded';
    }

    // Memory health check
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    health.checks.memory = {
      status: memoryUsagePercent > 90 ? 'critical' : memoryUsagePercent > 70 ? 'warning' : 'healthy',
      heapUsed: this.formatBytes(memoryUsage.heapUsed),
      heapTotal: this.formatBytes(memoryUsage.heapTotal),
      external: this.formatBytes(memoryUsage.external),
      usagePercent: Math.round(memoryUsagePercent),
    };

    if (health.checks.memory.status === 'critical') {
      health.status = 'critical';
    } else if (health.checks.memory.status === 'warning' && health.status === 'healthy') {
      health.status = 'warning';
    }

    return health;
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics() {
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    
    return {
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        loadAverage: os.loadavg(),
        cores: os.cpus().length,
      },
      memory: {
        total: this.formatBytes(os.totalmem()),
        free: this.formatBytes(os.freemem()),
        used: this.formatBytes(os.totalmem() - os.freemem()),
        process: {
          rss: this.formatBytes(memoryUsage.rss),
          heapTotal: this.formatBytes(memoryUsage.heapTotal),
          heapUsed: this.formatBytes(memoryUsage.heapUsed),
          external: this.formatBytes(memoryUsage.external),
        },
      },
      network: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
      },
      uptime: {
        system: os.uptime(),
        process: process.uptime(),
      },
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const responseTime = this.metrics.responseTime;
    const now = Date.now();
    const last5Minutes = responseTime.filter(r => now - r.timestamp < 300000);
    const last1Hour = responseTime.filter(r => now - r.timestamp < 3600000);
    
    const calculateStats = (data) => {
      if (data.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
      
      const times = data.map(d => d.responseTime);
      return {
        avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length,
        p95: this.calculatePercentile(times, 95),
        p99: this.calculatePercentile(times, 99),
      };
    };

    return {
      total: {
        requests: this.metrics.requests,
        errors: this.metrics.errors,
        errorRate: this.metrics.requests > 0 ? 
          Math.round((this.metrics.errors / this.metrics.requests) * 100) : 0,
      },
      last5Minutes: calculateStats(last5Minutes),
      lastHour: calculateStats(last1Hour),
      endpoints: this.getEndpointStats(),
    };
  }

  /**
   * Get endpoint statistics
   */
  getEndpointStats() {
    const endpoints = {};
    const now = Date.now();
    const last1Hour = this.metrics.responseTime.filter(r => now - r.timestamp < 3600000);
    
    for (const request of last1Hour) {
      const key = `${request.method} ${request.path}`;
      if (!endpoints[key]) {
        endpoints[key] = {
          method: request.method,
          path: request.path,
          requests: 0,
          errors: 0,
          totalTime: 0,
          minTime: Infinity,
          maxTime: 0,
        };
      }
      
      const endpoint = endpoints[key];
      endpoint.requests++;
      endpoint.totalTime += request.responseTime;
      endpoint.minTime = Math.min(endpoint.minTime, request.responseTime);
      endpoint.maxTime = Math.max(endpoint.maxTime, request.responseTime);
      
      if (request.statusCode >= 400) {
        endpoint.errors++;
      }
    }
    
    // Calculate averages and error rates
    for (const endpoint of Object.values(endpoints)) {
      endpoint.avgTime = Math.round(endpoint.totalTime / endpoint.requests);
      endpoint.errorRate = Math.round((endpoint.errors / endpoint.requests) * 100);
      endpoint.minTime = endpoint.minTime === Infinity ? 0 : endpoint.minTime;
      delete endpoint.totalTime;
    }
    
    return Object.values(endpoints)
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 20); // Top 20 endpoints
  }

  /**
   * Calculate percentile
   */
  calculatePercentile(arr, percentile) {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Start periodic monitoring
   */
  startPeriodicMonitoring() {
    // Collect system metrics every 30 seconds
    setInterval(async () => {
      if (this.isShuttingDown) return;
      
      try {
        const metrics = await this.getSystemMetrics();
        this.metrics.memoryUsage.push({
          timestamp: Date.now(),
          ...metrics.memory.process,
        });
        
        // Keep only last 100 entries (50 minutes of data)
        if (this.metrics.memoryUsage.length > 100) {
          this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
        }
        
        // Check for memory alerts
        const memUsage = process.memoryUsage();
        const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        if (memPercent > 85) {
          this.sendAlert('high_memory_usage', {
            usagePercent: Math.round(memPercent),
            heapUsed: this.formatBytes(memUsage.heapUsed),
            heapTotal: this.formatBytes(memUsage.heapTotal),
          });
        }
        
      } catch (error) {
        console.error('Periodic monitoring error:', error);
      }
    }, 30000);

    // Clean old response time data every 10 minutes
    setInterval(() => {
      if (this.isShuttingDown) return;
      
      const cutoff = Date.now() - (2 * 60 * 60 * 1000); // 2 hours
      this.metrics.responseTime = this.metrics.responseTime.filter(
        r => r.timestamp > cutoff
      );
    }, 600000);
  }

  /**
   * Send alert
   */
  async sendAlert(type, data) {
    const alertKey = `${type}:${JSON.stringify(data)}`;
    const lastAlert = this.alerts.get(alertKey);
    
    // Prevent spam - don't send same alert within 15 minutes
    if (lastAlert && Date.now() - lastAlert < 900000) {
      return;
    }
    
    this.alerts.set(alertKey, Date.now());
    
    try {
      // Log alert (notification service may not be available in development)
      console.warn(`SYSTEM ALERT [${type.replace('_', ' ').toUpperCase()}]:`, data);
      
      // Try to send notification if service is available
      try {
        const notificationService = require('./notificationService');
        if (notificationService && typeof notificationService.sendNotification === 'function') {
          await notificationService.sendNotification({
            title: `System Alert: ${type.replace('_', ' ').toUpperCase()}`,
            body: `Alert Details: ${JSON.stringify(data, null, 2)}`,
            type: 'system_alert',
            priority: 'urgent',
            channels: ['email', 'push'],
          }, 'system');
        }
      } catch (notifError) {
        // Notification service not available or failed - this is okay for development
        console.debug('Notification service not available for alert:', notifError.message);
      }
      
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get application info
   */
  getAppInfo() {
    return {
      name: process.env.npm_package_name || 'homeaze-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      startTime: new Date(this.startTime).toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      pid: process.pid,
    };
  }

  /**
   * Get recent errors
   */
  async getRecentErrors(limit = 50) {
    try {
      const pattern = 'error:*';
      const keys = await cacheService.redis.keys(`homeaze:${pattern}`);
      
      const errors = [];
      for (const key of keys.slice(0, limit)) {
        const error = await cacheService.get(key.replace('homeaze:', ''));
        if (error) {
          errors.push(error);
        }
      }
      
      return errors.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching recent errors:', error);
      return [];
    }
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown(signal) {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    this.isShuttingDown = true;
    
    const shutdownTimeout = setTimeout(() => {
      console.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 30000); // 30 second timeout
    
    try {
      // Close cache connection
      await cacheService.close();
      
      // Close database connection
      await mongoose.connection.close();
      
      console.log('Graceful shutdown completed');
      clearTimeout(shutdownTimeout);
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  }

  /**
   * Performance middleware
   */
  performanceMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const responseTime = Date.now() - start;
        this.recordRequest(req.method, req.path, res.statusCode, responseTime);
      });
      
      next();
    };
  }

  /**
   * Error middleware
   */
  errorMiddleware() {
    return (err, req, res, next) => {
      this.recordError(err, {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id,
      });
      
      next(err);
    };
  }
}

module.exports = new MonitoringService();
