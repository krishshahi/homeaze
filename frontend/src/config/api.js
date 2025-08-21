// API Configuration for Homeaze Frontend

// Centralized API configuration
// For Expo development, use these options:
// Option 1: localhost (works for web/simulator)
// Option 2: Your computer's IP (works for physical device on same network)
// Option 3: Expo tunnel (works for any device)
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.43.180:3001/api'  // Development server (use your computer's IP for device access)
  : 'https://your-production-api-url.com/api'; // Production server

// Standard token storage key
export const TOKEN_STORAGE_KEY = 'token';

console.log('🔧 API Base URL:', API_BASE_URL);

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
    DELETE_ACCOUNT: '/users/account',
  },
  
  // Services
  SERVICES: {
    LIST: '/services',
    SEARCH: '/services/search',
    DETAILS: (id) => `/services/${id}`,
    BY_CATEGORY: (category) => `/services/category/${category}`,
    FEATURED: '/services/featured',
    CREATE: '/services',
    UPDATE: (id) => `/services/${id}`,
    DELETE: (id) => `/services/${id}`,
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    DETAILS: (id) => `/bookings/${id}`,
    UPDATE_STATUS: (id) => `/bookings/${id}/status`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
    RESCHEDULE: (id) => `/bookings/${id}/reschedule`,
    ADD_REVIEW: (id) => `/bookings/${id}/review`,
  },
  
  // Providers
  PROVIDERS: {
    LIST: '/providers',
    SEARCH: '/providers/search',
    DETAILS: (id) => `/providers/${id}`,
    SERVICES: (id) => `/providers/${id}/services`,
    AVAILABILITY: (id) => `/providers/${id}/availability`,
  },
  
  // Payments
  PAYMENTS: {
    PROCESS: '/payments/process',
    DETAILS: (id) => `/payments/${id}`,
    HISTORY: '/payments/history',
    REFUND: (id) => `/payments/${id}/refund`,
    STATS: '/payments/stats',
    CREATE_INTENT: '/payments/create-intent',
  },
  
  // Reviews
  REVIEWS: {
    LIST: '/reviews',
    CREATE: '/reviews',
    DETAILS: (id) => `/reviews/${id}`,
    UPDATE: (id) => `/reviews/${id}`,
    RESPOND: (id) => `/reviews/${id}/respond`,
    HELPFUL: (id) => `/reviews/${id}/helpful`,
    FLAG: (id) => `/reviews/${id}/flag`,
    TRENDING: '/reviews/trending',
    MY_REVIEWS: '/reviews/my-reviews',
  },
  
  // Chatbot
  CHATBOT: {
    CHAT: '/chatbot/chat',
  },
  
  // Recommendations
  RECOMMENDATIONS: {
    SERVICES: '/recommendations/services',
    PROVIDERS: '/recommendations/providers',
    TRENDING: '/recommendations/trending',
  },
  
  // Dashboard
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    ANALYTICS: '/dashboard/analytics',
    RECENT_BOOKINGS: '/dashboard/recent-bookings',
    REVENUE_STATS: '/dashboard/revenue-stats',
    USER_STATS: '/dashboard/user-stats',
  },
  
  // Health check
  HEALTH: '/health',
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// Request headers
export const getHeaders = (authToken = null, contentType = 'application/json') => {
  const headers = {
    'Content-Type': contentType,
  };
  
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Import request throttler
import throttler from '../utils/requestThrottler';

// API request wrapper with error handling and throttling
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    method: options.method || HTTP_METHODS.GET,
    headers: getHeaders(options.token, options.contentType),
    ...options,
  };
  
  if (options.body && typeof options.body === 'object' && config.headers['Content-Type'] === 'application/json') {
    config.body = JSON.stringify(options.body);
  }
  
  try {
    // Use throttler instead of direct fetch to prevent 429 errors
    const data = await throttler.fetch(url, config);
    console.log(`✅ API Response: ${config.method} ${url}`, data);
    
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${config.method} ${url}`, error);
    throw error;
  }
};

// Convenience methods for common HTTP operations
export const apiGet = (endpoint, token = null) => 
  apiRequest(endpoint, { method: HTTP_METHODS.GET, token });

export const apiPost = (endpoint, body, token = null) => 
  apiRequest(endpoint, { method: HTTP_METHODS.POST, body, token });

export const apiPut = (endpoint, body, token = null) => 
  apiRequest(endpoint, { method: HTTP_METHODS.PUT, body, token });

export const apiPatch = (endpoint, body, token = null) => 
  apiRequest(endpoint, { method: HTTP_METHODS.PATCH, body, token });

export const apiDelete = (endpoint, token = null) => 
  apiRequest(endpoint, { method: HTTP_METHODS.DELETE, token });

// File upload helper
export const apiUpload = (endpoint, file, token = null) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiRequest(endpoint, {
    method: HTTP_METHODS.POST,
    body: formData,
    token,
    contentType: null, // Let the browser set the content type for FormData
  });
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  HTTP_METHODS,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUpload,
};
