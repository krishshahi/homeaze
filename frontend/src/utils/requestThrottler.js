// Request Throttler Utility
// Prevents 429 errors by limiting concurrent requests and implementing retry logic

class RequestThrottler {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 3; // Max concurrent requests
    this.delayBetweenRequests = options.delayBetweenRequests || 100; // ms delay between requests
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000; // Base retry delay in ms
    this.cache = new Map(); // Request cache
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // Cache TTL (5 minutes)
    
    this.activeRequests = 0;
    this.requestQueue = [];
    this.debouncedRequests = new Map();
  }

  /**
   * Generate cache key for request
   */
  getCacheKey(url, options) {
    const key = `${options.method || 'GET'}:${url}`;
    if (options.body) {
      return `${key}:${JSON.stringify(options.body)}`;
    }
    return key;
  }

  /**
   * Check if cached response is still valid
   */
  getCachedResponse(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache response
   */
  setCacheResponse(cacheKey, data) {
    this.cache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
  }

  /**
   * Debounce requests - prevents duplicate requests
   */
  debounceRequest(key, requestFn, delay = 300) {
    if (this.debouncedRequests.has(key)) {
      clearTimeout(this.debouncedRequests.get(key));
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        this.debouncedRequests.delete(key);
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);

      this.debouncedRequests.set(key, timeoutId);
    });
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute request with retry logic and exponential backoff
   */
  async executeWithRetry(requestFn, attempt = 1) {
    try {
      return await requestFn();
    } catch (error) {
      // Check if it's a rate limit error (429) or server error (5xx)
      const isRetryable = error.message?.includes('429') || 
                         error.message?.includes('Too Many Requests') ||
                         (error.status >= 500 && error.status < 600);

      if (isRetryable && attempt <= this.retryAttempts) {
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.log(`🔄 Retrying request (attempt ${attempt}/${this.retryAttempts}) after ${delay}ms`);
        
        await this.sleep(delay);
        return this.executeWithRetry(requestFn, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Process queue with concurrency control
   */
  async processQueue() {
    while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const { requestFn, resolve, reject } = this.requestQueue.shift();
      this.activeRequests++;

      try {
        const result = await this.executeWithRetry(requestFn);
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.activeRequests--;
        
        // Add delay between requests to prevent overwhelming the server
        if (this.requestQueue.length > 0) {
          await this.sleep(this.delayBetweenRequests);
        }
        
        // Process next item in queue
        this.processQueue();
      }
    }
  }

  /**
   * Throttled fetch - main method to use instead of fetch
   */
  async fetch(url, options = {}) {
    const cacheKey = this.getCacheKey(url, options);
    
    // Check cache first (only for GET requests)
    if ((!options.method || options.method === 'GET')) {
      const cached = this.getCachedResponse(cacheKey);
      if (cached) {
        console.log(`📁 Using cached response for: ${url}`);
        return cached;
      }
    }

    // Create request function
    const requestFn = async () => {
      console.log(`🌐 Making throttled request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, options);
      
      // Handle 429 specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.retryDelay;
        
        throw new Error(`429 Too Many Requests - Retry after ${delay}ms`);
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache successful GET responses
      if ((!options.method || options.method === 'GET')) {
        this.setCacheResponse(cacheKey, data);
      }
      
      return data;
    };

    // Add to queue and process
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Batch requests with staggered execution
   */
  async batchRequests(requests, staggerDelay = 200) {
    const results = [];
    
    for (let i = 0; i < requests.length; i++) {
      try {
        const result = await this.fetch(requests[i].url, requests[i].options);
        results.push({ success: true, data: result, index: i });
      } catch (error) {
        console.error(`❌ Batch request ${i} failed:`, error);
        results.push({ success: false, error: error.message, index: i });
      }
      
      // Add stagger delay between requests (except for the last one)
      if (i < requests.length - 1) {
        await this.sleep(staggerDelay);
      }
    }
    
    return results;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Request cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const throttler = new RequestThrottler({
  maxConcurrent: 3,      // Limit to 3 concurrent requests
  delayBetweenRequests: 150, // 150ms delay between requests
  retryAttempts: 3,      // Retry up to 3 times
  retryDelay: 1000,      // Start with 1s retry delay
  cacheTTL: 5 * 60 * 1000 // Cache for 5 minutes
});

export default throttler;

// Export class for custom instances if needed
export { RequestThrottler };
