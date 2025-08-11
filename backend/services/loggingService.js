const fs = require('fs');
const path = require('path');
const util = require('util');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

class LoggingService {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDir();
    
    this.logger = this.createLogger();
    this.requestLogger = this.createRequestLogger();
    this.errorLogger = this.createErrorLogger();
    
    this.logBuffer = [];
    this.maxBufferSize = 1000;
    
    this.initializeLogRotation();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Create main application logger
   */
  createLogger() {
    const logFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.metadata(),
      format.json()
    );

    const consoleFormat = format.combine(
      format.colorize(),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(({ level, message, timestamp, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
          log += `\n${util.inspect(meta, { colors: true, depth: 2 })}`;
        }
        
        return log;
      })
    );

    return createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: {
        service: 'homeaze-backend',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      },
      transports: [
        // Console transport for development
        new transports.Console({
          format: consoleFormat,
          silent: process.env.NODE_ENV === 'test'
        }),

        // Daily rotate file for all logs
        new DailyRotateFile({
          filename: path.join(this.logDir, 'application-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d'
        }),

        // Separate file for errors
        new DailyRotateFile({
          filename: path.join(this.logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error'
        })
      ]
    });
  }

  /**
   * Create request logger
   */
  createRequestLogger() {
    const requestFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.json()
    );

    return createLogger({
      level: 'info',
      format: requestFormat,
      transports: [
        new DailyRotateFile({
          filename: path.join(this.logDir, 'requests-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '50m',
          maxFiles: '7d'
        })
      ]
    });
  }

  /**
   * Create error logger
   */
  createErrorLogger() {
    const errorFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.json()
    );

    return createLogger({
      level: 'error',
      format: errorFormat,
      transports: [
        new DailyRotateFile({
          filename: path.join(this.logDir, 'errors-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d'
        })
      ]
    });
  }

  /**
   * Log levels
   */
  debug(message, meta = {}) {
    this.logger.debug(message, this.enrichMeta(meta));
    this.addToBuffer('debug', message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, this.enrichMeta(meta));
    this.addToBuffer('info', message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, this.enrichMeta(meta));
    this.addToBuffer('warn', message, meta);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = this.enrichMeta({
      ...meta,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null
    });

    this.logger.error(message, errorMeta);
    this.errorLogger.error(message, errorMeta);
    this.addToBuffer('error', message, errorMeta);
  }

  /**
   * Structured logging methods
   */
  logRequest(req, res, responseTime) {
    const requestData = {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      sessionId: req.sessionID,
      contentLength: res.get('content-length'),
      referrer: req.get('referrer')
    };

    this.requestLogger.info('HTTP Request', requestData);
    
    // Also log to main logger for important requests
    if (res.statusCode >= 400) {
      this.logger.warn('HTTP Error Response', requestData);
    }
  }

  logAuth(action, userId, details = {}) {
    this.logger.info(`Authentication: ${action}`, {
      category: 'auth',
      action,
      userId,
      ...details
    });
  }

  logPayment(action, paymentId, amount, currency, details = {}) {
    this.logger.info(`Payment: ${action}`, {
      category: 'payment',
      action,
      paymentId,
      amount,
      currency,
      ...details
    });
  }

  logBooking(action, bookingId, userId, details = {}) {
    this.logger.info(`Booking: ${action}`, {
      category: 'booking',
      action,
      bookingId,
      userId,
      ...details
    });
  }

  logSecurity(event, details = {}) {
    this.logger.warn(`Security Event: ${event}`, {
      category: 'security',
      event,
      ...details
    });
  }

  logDatabase(operation, collection, details = {}) {
    this.logger.debug(`Database: ${operation}`, {
      category: 'database',
      operation,
      collection,
      ...details
    });
  }

  logCache(operation, key, details = {}) {
    this.logger.debug(`Cache: ${operation}`, {
      category: 'cache',
      operation,
      key,
      ...details
    });
  }

  logNotification(type, recipient, details = {}) {
    this.logger.info(`Notification: ${type}`, {
      category: 'notification',
      type,
      recipient,
      ...details
    });
  }

  /**
   * Enrich metadata with request context
   */
  enrichMeta(meta) {
    return {
      ...meta,
      timestamp: new Date().toISOString(),
      pid: process.pid,
      hostname: require('os').hostname(),
      memory: process.memoryUsage()
    };
  }

  /**
   * Add to in-memory buffer for real-time monitoring
   */
  addToBuffer(level, message, meta) {
    this.logBuffer.push({
      level,
      message,
      meta,
      timestamp: Date.now()
    });

    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Get recent logs from buffer
   */
  getRecentLogs(limit = 100, level = null) {
    let logs = this.logBuffer;

    if (level) {
      logs = logs.filter(log => log.level === level);
    }

    return logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Search logs
   */
  async searchLogs(query, options = {}) {
    const {
      level = null,
      category = null,
      startDate = null,
      endDate = null,
      limit = 100
    } = options;

    // For now, search in buffer (in production, use log aggregation service)
    let logs = this.logBuffer;

    if (level) {
      logs = logs.filter(log => log.level === level);
    }

    if (category) {
      logs = logs.filter(log => log.meta?.category === category);
    }

    if (startDate) {
      logs = logs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter(log => log.timestamp <= endDate);
    }

    if (query) {
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(query.toLowerCase()) ||
        JSON.stringify(log.meta).toLowerCase().includes(query.toLowerCase())
      );
    }

    return logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get log statistics
   */
  getLogStats() {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const lastHour = now - (60 * 60 * 1000);

    const recentLogs = this.logBuffer.filter(log => log.timestamp >= last24Hours);
    const lastHourLogs = this.logBuffer.filter(log => log.timestamp >= lastHour);

    const levelCounts = recentLogs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {});

    const categoryCounts = recentLogs.reduce((acc, log) => {
      const category = log.meta?.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return {
      total: this.logBuffer.length,
      last24Hours: recentLogs.length,
      lastHour: lastHourLogs.length,
      levels: levelCounts,
      categories: categoryCounts,
      errorRate: levelCounts.error ? 
        Math.round((levelCounts.error / recentLogs.length) * 100) : 0
    };
  }

  /**
   * Express middleware for request logging
   */
  requestMiddleware() {
    return (req, res, next) => {
      const start = Date.now();

      // Skip logging for health checks and static files
      if (req.path === '/health' || req.path.startsWith('/static/')) {
        return next();
      }

      res.on('finish', () => {
        const responseTime = Date.now() - start;
        this.logRequest(req, res, responseTime);
      });

      next();
    };
  }

  /**
   * Express error logging middleware
   */
  errorMiddleware() {
    return (err, req, res, next) => {
      this.error('Express Error', err, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id
      });

      next(err);
    };
  }

  /**
   * Log rotation management
   */
  initializeLogRotation() {
    // Custom rotation for buffer logs
    setInterval(() => {
      const cutoff = Date.now() - (2 * 60 * 60 * 1000); // 2 hours
      this.logBuffer = this.logBuffer.filter(log => log.timestamp > cutoff);
    }, 300000); // Every 5 minutes
  }

  /**
   * Export logs for external analysis
   */
  async exportLogs(format = 'json', options = {}) {
    const {
      startDate = null,
      endDate = null,
      level = null,
      category = null
    } = options;

    let logs = await this.searchLogs('', {
      level,
      category,
      startDate,
      endDate,
      limit: 10000
    });

    if (format === 'csv') {
      return this.convertToCSV(logs);
    }

    return logs;
  }

  /**
   * Convert logs to CSV format
   */
  convertToCSV(logs) {
    if (logs.length === 0) return '';

    const headers = ['timestamp', 'level', 'message', 'category', 'userId', 'ip'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.level,
      log.message,
      log.meta?.category || '',
      log.meta?.userId || '',
      log.meta?.ip || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Health check
   */
  healthCheck() {
    try {
      const stats = this.getLogStats();
      return {
        status: 'healthy',
        logsDirectory: this.logDir,
        bufferSize: this.logBuffer.length,
        stats
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      // Flush any pending logs
      await new Promise((resolve) => {
        this.logger.on('finish', resolve);
        this.logger.end();
      });

      await new Promise((resolve) => {
        this.requestLogger.on('finish', resolve);
        this.requestLogger.end();
      });

      await new Promise((resolve) => {
        this.errorLogger.on('finish', resolve);
        this.errorLogger.end();
      });

      console.log('Logging service shutdown complete');
    } catch (error) {
      console.error('Error during logging service shutdown:', error);
    }
  }
}

module.exports = new LoggingService();
