const Redis = require('ioredis');
const crypto = require('crypto');

class CacheService {
  constructor() {
    this.isRedisEnabled = process.env.REDIS_ENABLED !== 'false';
    this.memoryCache = new Map(); // In-memory fallback cache
    this.redisConnected = false;
    
    if (this.isRedisEnabled) {
      try {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
          retryDelayOnFailover: 100,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
          keyPrefix: 'homeaze:',
          connectTimeout: 5000,
          commandTimeout: 3000,
        });

        this.redis.on('error', (err) => {
          console.warn('Redis connection error, falling back to memory cache:', err.message);
          this.redisConnected = false;
        });

        this.redis.on('connect', () => {
          console.log('Redis connected successfully');
          this.redisConnected = true;
        });

        this.redis.on('close', () => {
          console.warn('Redis connection closed, using memory cache');
          this.redisConnected = false;
        });
      } catch (error) {
        console.warn('Failed to initialize Redis, using memory cache:', error.message);
        this.redis = null;
        this.redisConnected = false;
      }
    } else {
      console.log('Redis disabled, using memory cache for development');
      this.redis = null;
      this.redisConnected = false;
    }

    // Cache TTL configurations (in seconds)
    this.TTL = {
      SHORT: 300,      // 5 minutes
      MEDIUM: 1800,    // 30 minutes
      LONG: 3600,      // 1 hour
      DAY: 86400,      // 24 hours
      WEEK: 604800,    // 7 days
    };
  }

  /**
   * Generate cache key with optional prefix and hash long keys
   */
  generateKey(prefix, identifier) {
    const key = `${prefix}:${identifier}`;
    // Hash very long keys to avoid Redis key length limits
    if (key.length > 250) {
      return `${prefix}:${crypto.createHash('sha256').update(identifier).digest('hex')}`;
    }
    return key;
  }

  /**
   * Get data from cache (Redis or memory fallback)
   */
  async get(key) {
    try {
      if (this.redis && this.redisConnected) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        // Use memory cache fallback
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        } else if (cached) {
          this.memoryCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      // Try memory cache as fallback
      const cached = this.memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }
      return null;
    }
  }

  /**
   * Set data in cache with TTL (Redis or memory fallback)
   */
  async set(key, data, ttl = this.TTL.MEDIUM) {
    try {
      if (this.redis && this.redisConnected) {
        await this.redis.setex(key, ttl, JSON.stringify(data));
        return true;
      } else {
        // Use memory cache fallback
        const expiry = Date.now() + (ttl * 1000);
        this.memoryCache.set(key, { data, expiry });
        
        // Cleanup expired entries periodically
        if (Math.random() < 0.01) { // 1% chance to cleanup
          this.cleanupMemoryCache();
        }
        return true;
      }
    } catch (error) {
      console.error('Cache set error:', error);
      // Fallback to memory cache
      try {
        const expiry = Date.now() + (ttl * 1000);
        this.memoryCache.set(key, { data, expiry });
        return true;
      } catch (memError) {
        console.error('Memory cache set error:', memError);
        return false;
      }
    }
  }

  /**
   * Delete data from cache (Redis or memory fallback)
   */
  async del(key) {
    try {
      let success = false;
      
      if (this.redis && this.redisConnected) {
        await this.redis.del(key);
        success = true;
      }
      
      // Also remove from memory cache
      if (this.memoryCache.has(key)) {
        this.memoryCache.delete(key);
        success = true;
      }
      
      return success;
    } catch (error) {
      console.error('Cache delete error:', error);
      // Try memory cache cleanup
      if (this.memoryCache.has(key)) {
        this.memoryCache.delete(key);
        return true;
      }
      return false;
    }
  }

  /**
   * Clean up expired entries from memory cache
   */
  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expiry <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Delete multiple keys with pattern
   */
  async delPattern(pattern) {
    try {
      const keys = await this.redis.keys(`homeaze:${pattern}`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Cache pattern delete error:', error);
      return false;
    }
  }

  /**
   * Cache user data
   */
  async cacheUser(userId, userData, ttl = this.TTL.LONG) {
    const key = this.generateKey('user', userId);
    return await this.set(key, userData, ttl);
  }

  async getCachedUser(userId) {
    const key = this.generateKey('user', userId);
    return await this.get(key);
  }

  async invalidateUser(userId) {
    const key = this.generateKey('user', userId);
    return await this.del(key);
  }

  /**
   * Cache booking data
   */
  async cacheBooking(bookingId, bookingData, ttl = this.TTL.MEDIUM) {
    const key = this.generateKey('booking', bookingId);
    return await this.set(key, bookingData, ttl);
  }

  async getCachedBooking(bookingId) {
    const key = this.generateKey('booking', bookingId);
    return await this.get(key);
  }

  async invalidateBooking(bookingId) {
    const key = this.generateKey('booking', bookingId);
    return await this.del(key);
  }

  /**
   * Cache service provider data
   */
  async cacheServiceProvider(providerId, providerData, ttl = this.TTL.LONG) {
    const key = this.generateKey('provider', providerId);
    return await this.set(key, providerData, ttl);
  }

  async getCachedServiceProvider(providerId) {
    const key = this.generateKey('provider', providerId);
    return await this.get(key);
  }

  async invalidateServiceProvider(providerId) {
    const key = this.generateKey('provider', providerId);
    return await this.del(key);
  }

  /**
   * Cache search results
   */
  async cacheSearchResults(searchQuery, results, ttl = this.TTL.SHORT) {
    const key = this.generateKey('search', JSON.stringify(searchQuery));
    return await this.set(key, results, ttl);
  }

  async getCachedSearchResults(searchQuery) {
    const key = this.generateKey('search', JSON.stringify(searchQuery));
    return await this.get(key);
  }

  /**
   * Cache API responses
   */
  async cacheApiResponse(endpoint, params, response, ttl = this.TTL.SHORT) {
    const identifier = `${endpoint}:${JSON.stringify(params)}`;
    const key = this.generateKey('api', identifier);
    return await this.set(key, response, ttl);
  }

  async getCachedApiResponse(endpoint, params) {
    const identifier = `${endpoint}:${JSON.stringify(params)}`;
    const key = this.generateKey('api', identifier);
    return await this.get(key);
  }

  /**
   * Cache analytics data
   */
  async cacheAnalytics(type, identifier, data, ttl = this.TTL.MEDIUM) {
    const key = this.generateKey(`analytics:${type}`, identifier);
    return await this.set(key, data, ttl);
  }

  async getCachedAnalytics(type, identifier) {
    const key = this.generateKey(`analytics:${type}`, identifier);
    return await this.get(key);
  }

  /**
   * Session management
   */
  async setSession(sessionId, sessionData, ttl = this.TTL.DAY) {
    const key = this.generateKey('session', sessionId);
    return await this.set(key, sessionData, ttl);
  }

  async getSession(sessionId) {
    const key = this.generateKey('session', sessionId);
    return await this.get(key);
  }

  async deleteSession(sessionId) {
    const key = this.generateKey('session', sessionId);
    return await this.del(key);
  }

  /**
   * Rate limiting with fallback
   */
  async getRateLimitCount(identifier) {
    try {
      const key = this.generateKey('ratelimit', identifier);
      
      if (this.redis && this.redisConnected) {
        const count = await this.redis.get(key);
        return parseInt(count) || 0;
      } else {
        // Memory fallback
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.data || 0;
        }
        return 0;
      }
    } catch (error) {
      console.error('Rate limit get error:', error);
      // Try memory fallback
      const key = this.generateKey('ratelimit', identifier);
      const cached = this.memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.data || 0;
      }
      return 0;
    }
  }

  async incrementRateLimit(identifier, window = 3600) {
    try {
      const key = this.generateKey('ratelimit', identifier);
      
      if (this.redis && this.redisConnected) {
        const multi = this.redis.multi();
        multi.incr(key);
        multi.expire(key, window);
        const results = await multi.exec();
        return parseInt(results[0][1]) || 0;
      } else {
        // Memory fallback
        const cached = this.memoryCache.get(key);
        const currentCount = cached && cached.expiry > Date.now() ? cached.data : 0;
        const newCount = currentCount + 1;
        const expiry = Date.now() + (window * 1000);
        
        this.memoryCache.set(key, { data: newCount, expiry });
        return newCount;
      }
    } catch (error) {
      console.error('Rate limit increment error:', error);
      // Fallback to memory
      try {
        const key = this.generateKey('ratelimit', identifier);
        const cached = this.memoryCache.get(key);
        const currentCount = cached && cached.expiry > Date.now() ? cached.data : 0;
        const newCount = currentCount + 1;
        const expiry = Date.now() + (window * 1000);
        
        this.memoryCache.set(key, { data: newCount, expiry });
        return newCount;
      } catch (memError) {
        console.error('Memory rate limit error:', memError);
        return 0;
      }
    }
  }

  /**
   * Notification tokens management
   */
  async cacheFCMToken(userId, token, ttl = this.TTL.WEEK) {
    const key = this.generateKey('fcm', userId);
    return await this.set(key, token, ttl);
  }

  async getCachedFCMToken(userId) {
    const key = this.generateKey('fcm', userId);
    return await this.get(key);
  }

  /**
   * Cache invalidation patterns
   */
  async invalidateUserRelatedCache(userId) {
    const patterns = [
      `user:${userId}`,
      `session:*:${userId}`,
      `booking:*:${userId}`,
      `analytics:user:${userId}`,
      `fcm:${userId}`
    ];

    for (const pattern of patterns) {
      await this.delPattern(pattern);
    }
  }

  async invalidateServiceRelatedCache(serviceId) {
    const patterns = [
      `service:${serviceId}`,
      `search:*${serviceId}*`,
      `analytics:service:${serviceId}`
    ];

    for (const pattern of patterns) {
      await this.delPattern(pattern);
    }
  }

  /**
   * Cache warming utilities
   */
  async warmCache(type, data) {
    try {
      switch (type) {
        case 'popular_services':
          await this.set('popular_services', data, this.TTL.LONG);
          break;
        case 'trending_searches':
          await this.set('trending_searches', data, this.TTL.MEDIUM);
          break;
        case 'top_providers':
          await this.set('top_providers', data, this.TTL.LONG);
          break;
        default:
          console.warn('Unknown cache warming type:', type);
      }
    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }

  /**
   * Cache statistics
   */
  async getCacheStats() {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      const stats = await this.redis.info('stats');
      
      return {
        memory: this.parseRedisInfo(info),
        keyspace: this.parseRedisInfo(keyspace),
        stats: this.parseRedisInfo(stats),
        connected: this.redis.status === 'ready'
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { connected: false, error: error.message };
    }
  }

  parseRedisInfo(info) {
    const lines = info.split('\r\n');
    const result = {};
    
    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          result[key] = isNaN(value) ? value : Number(value);
        }
      }
    }
    
    return result;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;
      
      return {
        status: 'healthy',
        latency: `${latency}ms`,
        connected: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        connected: false
      };
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    try {
      await this.redis.quit();
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
}

module.exports = new CacheService();
