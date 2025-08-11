const mongoose = require('mongoose');
const cacheService = require('./cacheService');
const loggingService = require('./loggingService');

class PerformanceService {
  constructor() {
    this.queryCache = new Map();
    this.slowQueryThreshold = 1000; // 1 second
    this.cacheHitRates = {
      api: { hits: 0, misses: 0 },
      database: { hits: 0, misses: 0 },
      user: { hits: 0, misses: 0 }
    };
    
    this.initializeOptimizations();
  }

  /**
   * Initialize database and query optimizations
   */
  initializeOptimizations() {
    // Monitor slow queries
    if (mongoose.connection.readyState === 1) {
      this.setupSlowQueryLogging();
    } else {
      mongoose.connection.once('connected', () => {
        this.setupSlowQueryLogging();
      });
    }
  }

  /**
   * Setup slow query logging
   */
  setupSlowQueryLogging() {
    try {
      // Enable profiling for slow operations
      mongoose.connection.db.command({
        profile: 2,
        slowms: this.slowQueryThreshold
      }).catch(err => {
        loggingService.warn('Could not enable MongoDB profiling', err);
      });

      // Log slow queries periodically
      setInterval(async () => {
        await this.checkSlowQueries();
      }, 60000); // Check every minute
    } catch (error) {
      loggingService.error('Failed to setup slow query logging', error);
    }
  }

  /**
   * Check for slow queries and log them
   */
  async checkSlowQueries() {
    try {
      const profilerData = await mongoose.connection.db
        .collection('system.profile')
        .find({ ts: { $gte: new Date(Date.now() - 60000) } })
        .sort({ $natural: -1 })
        .limit(10)
        .toArray();

      for (const query of profilerData) {
        if (query.millis > this.slowQueryThreshold) {
          loggingService.warn('Slow database query detected', {
            category: 'performance',
            collection: query.ns,
            duration: query.millis,
            query: query.command,
            timestamp: query.ts
          });
        }
      }
    } catch (error) {
      // Profiling might not be available in all MongoDB setups
      loggingService.debug('Could not check slow queries', error);
    }
  }

  /**
   * Database query optimization middleware
   */
  optimizeQuery(Model, options = {}) {
    const {
      useCache = true,
      cacheTTL = cacheService.TTL.MEDIUM,
      enablePagination = true,
      defaultSort = { createdAt: -1 }
    } = options;

    return async (queryFn, cacheKey = null) => {
      const startTime = Date.now();
      
      try {
        // Try cache first if enabled
        if (useCache && cacheKey) {
          const cached = await cacheService.get(cacheKey);
          if (cached) {
            this.cacheHitRates.database.hits++;
            loggingService.debug('Database query cache hit', {
              category: 'performance',
              cacheKey,
              model: Model.modelName
            });
            return cached;
          }
          this.cacheHitRates.database.misses++;
        }

        // Execute query with optimizations
        let query = queryFn();
        
        // Add default optimizations
        if (query.lean && typeof query.lean === 'function') {
          query = query.lean(); // Return plain objects instead of Mongoose documents
        }

        const result = await query;
        const duration = Date.now() - startTime;

        // Log slow queries
        if (duration > this.slowQueryThreshold) {
          loggingService.warn('Slow database query', {
            category: 'performance',
            model: Model.modelName,
            duration,
            query: query.getQuery ? query.getQuery() : 'N/A'
          });
        }

        // Cache result if enabled
        if (useCache && cacheKey) {
          await cacheService.set(cacheKey, result, cacheTTL);
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        loggingService.error('Database query error', error, {
          category: 'performance',
          model: Model.modelName,
          duration
        });
        throw error;
      }
    };
  }

  /**
   * API response caching middleware
   */
  apiCache(options = {}) {
    const {
      ttl = cacheService.TTL.SHORT,
      keyGenerator = null,
      skipCache = false,
      varyBy = ['url', 'userId']
    } = options;

    return async (req, res, next) => {
      // Skip caching for non-GET requests or if disabled
      if (req.method !== 'GET' || skipCache) {
        return next();
      }

      try {
        // Generate cache key
        const cacheKey = keyGenerator ? 
          keyGenerator(req) : 
          this.generateApiCacheKey(req, varyBy);

        // Check cache
        const cached = await cacheService.getCachedApiResponse(req.originalUrl, req.query);
        if (cached) {
          this.cacheHitRates.api.hits++;
          loggingService.debug('API cache hit', {
            category: 'performance',
            endpoint: req.originalUrl,
            cacheKey
          });
          
          res.set('X-Cache', 'HIT');
          return res.json(cached);
        }

        this.cacheHitRates.api.misses++;

        // Capture response
        const originalJson = res.json;
        res.json = function(data) {
          // Cache successful responses
          if (res.statusCode === 200) {
            cacheService.cacheApiResponse(req.originalUrl, req.query, data, ttl);
            res.set('X-Cache', 'MISS');
          }
          return originalJson.call(this, data);
        };

        next();
      } catch (error) {
        loggingService.error('API cache error', error);
        next();
      }
    };
  }

  /**
   * Generate API cache key
   */
  generateApiCacheKey(req, varyBy) {
    const keyParts = [];
    
    for (const factor of varyBy) {
      switch (factor) {
        case 'url':
          keyParts.push(req.originalUrl);
          break;
        case 'userId':
          keyParts.push(req.user?.id || 'anonymous');
          break;
        case 'query':
          keyParts.push(JSON.stringify(req.query));
          break;
        case 'headers':
          keyParts.push(req.get('user-agent') || '');
          break;
        default:
          if (req[factor]) {
            keyParts.push(req[factor]);
          }
      }
    }
    
    return keyParts.join(':');
  }

  /**
   * Database connection pooling optimization
   */
  optimizeConnectionPool() {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    return options;
  }

  /**
   * Pagination optimization
   */
  createPaginationOptions(page = 1, limit = 20, maxLimit = 100) {
    const normalizedLimit = Math.min(Math.max(parseInt(limit), 1), maxLimit);
    const normalizedPage = Math.max(parseInt(page), 1);
    const skip = (normalizedPage - 1) * normalizedLimit;

    return {
      limit: normalizedLimit,
      skip,
      page: normalizedPage
    };
  }

  /**
   * Index recommendations based on slow queries
   */
  async getIndexRecommendations() {
    try {
      const recommendations = [];
      
      // Get slow queries from the last hour
      const profilerData = await mongoose.connection.db
        .collection('system.profile')
        .find({ ts: { $gte: new Date(Date.now() - 3600000) } })
        .toArray();

      const queryPatterns = new Map();

      for (const query of profilerData) {
        if (query.millis > this.slowQueryThreshold) {
          const collection = query.ns.split('.')[1];
          const command = query.command;
          
          if (command.find) {
            const filter = command.filter || {};
            const sort = command.sort || {};
            
            const key = `${collection}:${JSON.stringify(filter)}:${JSON.stringify(sort)}`;
            
            if (!queryPatterns.has(key)) {
              queryPatterns.set(key, {
                collection,
                filter,
                sort,
                count: 0,
                totalTime: 0
              });
            }
            
            const pattern = queryPatterns.get(key);
            pattern.count++;
            pattern.totalTime += query.millis;
          }
        }
      }

      // Generate recommendations
      for (const [key, pattern] of queryPatterns) {
        if (pattern.count > 5) { // Frequent slow queries
          const indexFields = { ...pattern.filter, ...pattern.sort };
          recommendations.push({
            collection: pattern.collection,
            suggestedIndex: indexFields,
            reason: `Frequent slow queries (${pattern.count} occurrences, avg ${Math.round(pattern.totalTime / pattern.count)}ms)`,
            impact: 'high'
          });
        }
      }

      return recommendations;
    } catch (error) {
      loggingService.error('Failed to generate index recommendations', error);
      return [];
    }
  }

  /**
   * Memory optimization utilities
   */
  optimizeMemoryUsage() {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      loggingService.debug('Forced garbage collection');
    }

    // Clear old cache entries
    this.clearOldCacheEntries();
  }

  /**
   * Clear old cache entries
   */
  clearOldCacheEntries() {
    const maxSize = 1000;
    
    if (this.queryCache.size > maxSize) {
      const entriesToDelete = this.queryCache.size - maxSize;
      const keys = Array.from(this.queryCache.keys()).slice(0, entriesToDelete);
      
      for (const key of keys) {
        this.queryCache.delete(key);
      }
      
      loggingService.debug('Cleared old query cache entries', { count: entriesToDelete });
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const memUsage = process.memoryUsage();
    
    return {
      memory: {
        rss: this.formatBytes(memUsage.rss),
        heapTotal: this.formatBytes(memUsage.heapTotal),
        heapUsed: this.formatBytes(memUsage.heapUsed),
        external: this.formatBytes(memUsage.external),
        heapUsagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      },
      cache: {
        hitRates: {
          api: this.calculateHitRate(this.cacheHitRates.api),
          database: this.calculateHitRate(this.cacheHitRates.database),
          user: this.calculateHitRate(this.cacheHitRates.user)
        },
        queryCache: {
          size: this.queryCache.size
        }
      },
      database: {
        connections: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        poolSize: mongoose.connection?.db?.serverConfig?.poolSize || 0
      }
    };
  }

  /**
   * Calculate hit rate percentage
   */
  calculateHitRate(stats) {
    const total = stats.hits + stats.misses;
    return total > 0 ? Math.round((stats.hits / total) * 100) : 0;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Optimize aggregation queries
   */
  optimizeAggregation(pipeline, options = {}) {
    const {
      allowDiskUse = false,
      maxTimeMS = 30000,
      hint = null
    } = options;

    const optimizedPipeline = [...pipeline];
    
    // Add $match as early as possible
    const matchStage = optimizedPipeline.find(stage => stage.$match);
    if (matchStage) {
      const matchIndex = optimizedPipeline.indexOf(matchStage);
      if (matchIndex > 0) {
        optimizedPipeline.splice(matchIndex, 1);
        optimizedPipeline.unshift(matchStage);
      }
    }

    // Add $limit after $sort to prevent sorting large datasets
    const sortIndex = optimizedPipeline.findIndex(stage => stage.$sort);
    const limitIndex = optimizedPipeline.findIndex(stage => stage.$limit);
    
    if (sortIndex !== -1 && limitIndex !== -1 && sortIndex > limitIndex) {
      const limitStage = optimizedPipeline[limitIndex];
      optimizedPipeline.splice(limitIndex, 1);
      optimizedPipeline.splice(sortIndex, 0, limitStage);
    }

    return {
      pipeline: optimizedPipeline,
      options: {
        allowDiskUse,
        maxTimeMS,
        ...(hint && { hint })
      }
    };
  }

  /**
   * Batch operation helper
   */
  async batchOperation(items, batchFn, batchSize = 100, concurrency = 5) {
    const results = [];
    const batches = [];
    
    // Create batches
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    // Process batches with concurrency limit
    const promises = batches.map(async (batch, index) => {
      try {
        const result = await batchFn(batch, index);
        results[index] = result;
        
        loggingService.debug('Batch processed successfully', {
          category: 'performance',
          batchIndex: index,
          batchSize: batch.length
        });
        
        return result;
      } catch (error) {
        loggingService.error('Batch processing error', error, {
          category: 'performance',
          batchIndex: index,
          batchSize: batch.length
        });
        throw error;
      }
    });

    // Execute with concurrency limit
    const concurrentPromises = [];
    for (let i = 0; i < promises.length; i += concurrency) {
      const batch = promises.slice(i, i + concurrency);
      concurrentPromises.push(Promise.all(batch));
    }

    await Promise.all(concurrentPromises);
    return results.flat();
  }

  /**
   * Reset performance counters
   */
  resetCounters() {
    this.cacheHitRates = {
      api: { hits: 0, misses: 0 },
      database: { hits: 0, misses: 0 },
      user: { hits: 0, misses: 0 }
    };
    
    this.queryCache.clear();
    
    loggingService.info('Performance counters reset');
  }
}

module.exports = new PerformanceService();
