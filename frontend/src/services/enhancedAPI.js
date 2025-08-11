import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base Configuration
const API_BASE_URL = 'https://homeaze-api.com/v1';

// Helper function to get auth token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};

// ================================
// ENHANCED SERVICES API
// ================================

export const servicesAPI = {
  // Get all services with filtering and pagination
  getServices: async (filters = {}) => {
    const queryParams = new URLSearchParams({
      page: filters.page || 1,
      limit: filters.limit || 20,
      ...(filters.category && { category: filters.category }),
      ...(filters.search && { search: filters.search }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.location && { location: filters.location }),
      ...(filters.featuredOnly && { featured: filters.featuredOnly }),
    });

    return await apiRequest(`/services?${queryParams}`);
  },

  // Get service categories
  getCategories: async () => {
    return await apiRequest('/services/categories');
  },

  // Get service details
  getServiceDetails: async (serviceId) => {
    return await apiRequest(`/services/${serviceId}`);
  },

  // Search services
  searchServices: async (query, filters = {}) => {
    const searchParams = {
      q: query,
      ...filters,
    };
    
    return await apiRequest('/services/search', {
      method: 'POST',
      body: JSON.stringify(searchParams),
    });
  },

  // Get featured services
  getFeaturedServices: async (limit = 10) => {
    return await apiRequest(`/services/featured?limit=${limit}`);
  },

  // Get popular services
  getPopularServices: async (limit = 10) => {
    return await apiRequest(`/services/popular?limit=${limit}`);
  },
};

// ================================
// ENHANCED BOOKINGS API
// ================================

export const bookingsAPI = {
  // Get user bookings with filtering
  getBookings: async (filters = {}) => {
    const queryParams = new URLSearchParams({
      page: filters.page || 1,
      limit: filters.limit || 20,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
    });

    return await apiRequest(`/bookings?${queryParams}`);
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    return await apiRequest(`/bookings/${bookingId}`);
  },

  // Create new booking
  createBooking: async (bookingData) => {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason = '') => {
    return await apiRequest(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Reschedule booking
  rescheduleBooking: async (bookingId, newDate, newTime) => {
    return await apiRequest(`/bookings/${bookingId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ 
        scheduledDate: newDate, 
        scheduledTime: newTime 
      }),
    });
  },

  // Rate and review booking
  rateBooking: async (bookingId, rating, review) => {
    return await apiRequest(`/bookings/${bookingId}/review`, {
      method: 'POST',
      body: JSON.stringify({ 
        rating, 
        review,
        reviewDate: new Date().toISOString(),
      }),
    });
  },

  // Get booking statistics
  getBookingStats: async () => {
    return await apiRequest('/bookings/statistics');
  },
};

// ================================
// ENHANCED PROVIDER SERVICES API
// ================================

export const providerServicesAPI = {
  // Get provider services
  getProviderServices: async (providerId) => {
    return await apiRequest(`/providers/${providerId}/services`);
  },

  // Create service (Enhanced)
  createService: async (serviceData) => {
    // Validate required fields
    const requiredFields = ['name', 'description', 'category', 'price'];
    for (const field of requiredFields) {
      if (!serviceData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    const payload = {
      ...serviceData,
      createdAt: new Date().toISOString(),
      status: 'pending', // Services need approval
      isActive: false,
    };

    return await apiRequest('/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Update service
  updateService: async (serviceId, updates) => {
    return await apiRequest(`/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...updates,
        updatedAt: new Date().toISOString(),
      }),
    });
  },

  // Delete service
  deleteService: async (serviceId) => {
    return await apiRequest(`/services/${serviceId}`, {
      method: 'DELETE',
    });
  },

  // Toggle service status (active/inactive)
  toggleServiceStatus: async (serviceId, isActive) => {
    return await apiRequest(`/services/${serviceId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ isActive }),
    });
  },

  // Get service analytics
  getServiceAnalytics: async (serviceId) => {
    return await apiRequest(`/services/${serviceId}/analytics`);
  },
};

// ================================
// ENHANCED PROFILE API
// ================================

export const profileAPI = {
  // Get user profile
  getProfile: async () => {
    return await apiRequest('/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify({
        ...profileData,
        updatedAt: new Date().toISOString(),
      }),
    });
  },

  // Upload profile avatar
  uploadAvatar: async (imageUri) => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    });

    return await apiRequest('/profile/avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  },

  // Get profile statistics
  getProfileStats: async () => {
    return await apiRequest('/profile/statistics');
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    return await apiRequest('/profile/notifications', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest('/profile/password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  },

  // Delete account
  deleteAccount: async (password, reason = '') => {
    return await apiRequest('/profile/delete', {
      method: 'POST',
      body: JSON.stringify({
        password,
        reason,
        deletedAt: new Date().toISOString(),
      }),
    });
  },
};

// ================================
// PAYMENT METHODS API
// ================================

export const paymentAPI = {
  // Get payment methods
  getPaymentMethods: async () => {
    return await apiRequest('/payment/methods');
  },

  // Add payment method
  addPaymentMethod: async (paymentData) => {
    return await apiRequest('/payment/methods', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Update payment method
  updatePaymentMethod: async (methodId, updates) => {
    return await apiRequest(`/payment/methods/${methodId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete payment method
  deletePaymentMethod: async (methodId) => {
    return await apiRequest(`/payment/methods/${methodId}`, {
      method: 'DELETE',
    });
  },

  // Set default payment method
  setDefaultPaymentMethod: async (methodId) => {
    return await apiRequest(`/payment/methods/${methodId}/default`, {
      method: 'POST',
    });
  },

  // Process payment
  processPayment: async (paymentData) => {
    return await apiRequest('/payment/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Get payment history
  getPaymentHistory: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return await apiRequest(`/payment/history?${queryParams}`);
  },
};

// ================================
// UTILITY FUNCTIONS
// ================================

export const utilityAPI = {
  // Upload file/image
  uploadFile: async (file, type = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return await apiRequest('/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  },

  // Get app configuration
  getAppConfig: async () => {
    return await apiRequest('/config');
  },

  // Send feedback
  sendFeedback: async (feedback) => {
    return await apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        ...feedback,
        timestamp: new Date().toISOString(),
      }),
    });
  },

  // Report issue
  reportIssue: async (issue) => {
    return await apiRequest('/support/report', {
      method: 'POST',
      body: JSON.stringify({
        ...issue,
        timestamp: new Date().toISOString(),
      }),
    });
  },
};

// ================================
// ERROR HANDLING
// ================================

export const APIError = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
};

export const handleAPIError = (error) => {
  if (!error.response) {
    return {
      type: APIError.NETWORK_ERROR,
      message: 'Network connection error. Please check your internet connection.',
    };
  }

  switch (error.response.status) {
    case 401:
      return {
        type: APIError.UNAUTHORIZED,
        message: 'Your session has expired. Please log in again.',
      };
    case 403:
      return {
        type: APIError.FORBIDDEN,
        message: 'You do not have permission to perform this action.',
      };
    case 404:
      return {
        type: APIError.NOT_FOUND,
        message: 'The requested resource was not found.',
      };
    case 422:
      return {
        type: APIError.VALIDATION_ERROR,
        message: 'Please check your input and try again.',
        details: error.response.data?.errors || {},
      };
    case 500:
      return {
        type: APIError.SERVER_ERROR,
        message: 'Server error. Please try again later.',
      };
    default:
      return {
        type: APIError.SERVER_ERROR,
        message: 'Something went wrong. Please try again.',
      };
  }
};

// ================================
// MOCK DATA HELPERS (for development)
// ================================

export const mockAPI = {
  // Enable/disable mock mode
  enabled: __DEV__, // Only in development

  // Mock responses
  services: {
    getServices: () => Promise.resolve({
      data: [
        {
          id: '1',
          name: 'Professional House Cleaning',
          description: 'Deep cleaning service for your home',
          category: 'cleaning',
          price: 75,
          rating: 4.8,
          reviewCount: 124,
          provider: {
            id: '1',
            name: 'Sarah Johnson',
            avatar: 'https://via.placeholder.com/50',
          },
          images: ['https://via.placeholder.com/300x200'],
          featured: true,
        },
        // Add more mock services...
      ],
      total: 15,
      page: 1,
      totalPages: 2,
    }),
  },
  
  bookings: {
    getBookings: () => Promise.resolve({
      data: [
        {
          id: '1',
          serviceId: '1',
          serviceName: 'Professional House Cleaning',
          providerName: 'Sarah Johnson',
          status: 'upcoming',
          scheduledDate: '2024-01-15',
          scheduledTime: '10:00 AM',
          location: '123 Main St, City',
          price: 75,
          hasReview: false,
        },
        // Add more mock bookings...
      ],
      total: 8,
    }),
  },

  profile: {
    getProfile: () => Promise.resolve({
      data: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        avatar: 'https://via.placeholder.com/120',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        memberSince: '2023-01-15',
      },
    }),
    
    getProfileStats: () => Promise.resolve({
      data: {
        completedBookings: 12,
        totalSpent: 890,
        savedAmount: 156,
        averageRating: 4.9,
      },
    }),
  },
};

export default {
  servicesAPI,
  bookingsAPI,
  providerServicesAPI,
  profileAPI,
  paymentAPI,
  utilityAPI,
  handleAPIError,
  mockAPI,
};
