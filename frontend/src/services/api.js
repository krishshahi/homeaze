import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.129:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Try multiple keys to maximize compatibility across the app
    const token =
      (await AsyncStorage.getItem('token')) ||
      (await AsyncStorage.getItem('userToken')) ||
      (await AsyncStorage.getItem('authToken'));

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors (no refresh, backend has no refresh endpoint)
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // If unauthorized, let caller handle (e.g., prompt login)
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

// Provider Services API
export const providerServicesAPI = {
  // Note: The backend exposes generic service routes under /services
  // Adjusted to avoid 404s against non-existent /provider/services endpoints
  getServiceStats: () => api.get('/dashboard/overview'),
  getServiceAnalytics: (serviceId) => api.get(`/services/${serviceId}/analytics`), // backend may not implement yet
  updateServicePricing: (serviceId, pricingData) =>
    api.put(`/services/${serviceId}`, pricingData),
  updateServiceOptions: (serviceId, options) =>
    api.put(`/services/${serviceId}`, { options }),
  // Fetch services list (temporarily uses public services listing)
  getServices: (params) => api.get('/services', { params }),
  // Create, update, delete service use canonical /services routes
  addService: (serviceData) => {
    // Map UI payload to backend schema
    const allowedCategories = new Set([
      'cleaning','plumbing','electrical','hvac','painting','carpentry','gardening','pest-control','appliance-repair','handyman','other'
    ]);
    const category = allowedCategories.has((serviceData.category || '').toLowerCase())
      ? (serviceData.category || '').toLowerCase()
      : 'other';

    // Determine pricing type: use provided, else hourly if price given, else quote
    const validTypes = new Set(['hourly','fixed','quote']);
    const hasPrice = serviceData.price !== undefined && serviceData.price !== null && `${serviceData.price}`.trim() !== '';
    const pricingType = validTypes.has((serviceData.pricingType || '').toLowerCase())
      ? (serviceData.pricingType || '').toLowerCase()
      : (hasPrice ? 'hourly' : 'quote');

    const payload = {
      title: (serviceData.name || serviceData.title || 'Untitled Service').trim(),
      description: (serviceData.description || '').trim(),
      category,
      pricing: {
        type: pricingType,
        ...(pricingType !== 'quote' && hasPrice ? { amount: Number(serviceData.price) } : {})
      },
      // Pass through optional fields if backend ignores unknowns
      ...(serviceData.features ? { features: serviceData.features } : {}),
      ...(serviceData.requirements ? { requirements: serviceData.requirements } : {}),
      ...(serviceData.icon ? { icon: serviceData.icon } : {}),
    };

    return api.post('/services', payload);
  },
  updateService: (serviceId, serviceData) => {
    // Support updating via same mapped structure
    const patch = {};
    if (serviceData.name || serviceData.title) patch.title = serviceData.name || serviceData.title;
    if (serviceData.description) patch.description = serviceData.description;
    if (serviceData.category) {
      const allowed = new Set(['cleaning','plumbing','electrical','hvac','painting','carpentry','gardening','pest-control','appliance-repair','handyman','other']);
      patch.category = allowed.has(serviceData.category.toLowerCase()) ? serviceData.category.toLowerCase() : 'other';
    }
    if (serviceData.price !== undefined || serviceData.pricingType) {
      const validTypes = new Set(['hourly','fixed','quote']);
      const hasPrice = serviceData.price !== undefined && serviceData.price !== null && `${serviceData.price}`.trim() !== '';
      const type = validTypes.has((serviceData.pricingType || '').toLowerCase())
        ? (serviceData.pricingType || '').toLowerCase()
        : (hasPrice ? 'hourly' : 'quote');
      patch.pricing = {
        type,
        ...(type !== 'quote' && hasPrice ? { amount: Number(serviceData.price) } : {})
      };
    }
    return api.put(`/services/${serviceId}`, Object.keys(patch).length ? patch : serviceData);
  },
  deleteService: (serviceId) => api.delete(`/services/${serviceId}`),
  // Availability per-service is not supported; this is a noop mapping to PUT
  updateAvailability: (serviceId, available) =>
    api.put(`/services/${serviceId}`, { available }),
};

// Services API
export const servicesAPI = {
  getFeaturedServices: () => api.get('/services/featured'),
  getPopularServices: () => api.get('/services/popular'),
  getNearbyServices: (coords) => api.get('/services/nearby', { params: coords }),
  getServiceAvailability: (serviceId, date) =>
    api.get(`/services/${serviceId}/availability`, { params: { date } }),
  getAllServices: (params) => api.get('/services', { params }),
  getServiceDetails: (serviceId) => api.get(`/services/${serviceId}`),
  getCategories: () => api.get('/services/categories'),
  searchServices: (query) => api.get('/services/search', { params: { query } }),
};

// Bookings API
export const bookingsAPI = {
  checkAvailability: (bookingData) => api.post('/bookings/check-availability', bookingData),
  getBookingStats: () => api.get('/provider/bookings/stats'),
  updateBookingStatus: (bookingId, status) =>
    api.patch(`/bookings/${bookingId}/status`, { status }),
  rescheduleBooking: (bookingId, newTime) =>
    api.post(`/bookings/${bookingId}/reschedule`, { newTime }),
  getUpcomingBookings: () => api.get('/bookings/upcoming'),
  getPastBookings: () => api.get('/bookings/past'),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getBookingDetails: (bookingId) => api.get(`/bookings/${bookingId}`),
  updateBooking: (bookingId, bookingData) =>
    api.put(`/bookings/${bookingId}`, bookingData),
  cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
  getProviderBookings: () => api.get('/provider/bookings'),
  getCustomerBookings: () => api.get('/customer/bookings'),
};

// Reviews API
export const reviewsAPI = {
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getReviewDetails: (reviewId) => api.get(`/reviews/${reviewId}`),
  addResponse: (reviewId, response) =>
    api.post(`/reviews/${reviewId}/response`, { response }),
  getProviderReviews: () => api.get('/provider/reviews'),
  getServiceReviews: (serviceId) => api.get(`/services/${serviceId}/reviews`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) =>
    api.post(`/notifications/${notificationId}/read`),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
};

// Provider Profile API
export const providerProfileAPI = {
  getProfile: () => api.get('/provider/profile'),
  updateProfile: (profileData) => api.put('/provider/profile', profileData),
  uploadDocument: (documentData) =>
    api.post('/provider/documents', documentData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getDocuments: () => api.get('/provider/documents'),
  deleteDocument: (documentId) => api.delete(`/provider/documents/${documentId}`),
};

// Provider Availability API
export const providerAvailabilityAPI = {
  getAvailability: () => api.get('/provider/availability'),
  updateAvailability: (availabilityData) =>
    api.put('/provider/availability', availabilityData),
  addBreakTime: (breakData) => api.post('/provider/breaks', breakData),
  removeBreakTime: (breakId) => api.delete(`/provider/breaks/${breakId}`),
  getBlockedDates: () => api.get('/provider/blocked-dates'),
  blockDate: (dateData) => api.post('/provider/blocked-dates', dateData),
  unblockDate: (dateId) => api.delete(`/provider/blocked-dates/${dateId}`),
};

// Provider Earnings API
export const providerEarningsAPI = {
  getEarningsOverview: () => api.get('/provider/earnings/overview'),
  getEarningsHistory: (params) => api.get('/provider/earnings/history', { params }),
  getPayoutSettings: () => api.get('/provider/earnings/payout-settings'),
  updatePayoutSettings: (settings) =>
    api.put('/provider/earnings/payout-settings', settings),
  requestPayout: (payoutData) => api.post('/provider/earnings/request-payout', payoutData),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (paymentData) => api.post('/payments/intent', paymentData),
  confirmPayment: (paymentId, confirmationData) =>
    api.post(`/payments/confirm`, {
      paymentId,
      ...confirmationData,
    }),
  getPaymentMethods: () => api.get('/payments/methods'),
  addPaymentMethod: (paymentMethodData) =>
    api.post('/payments/methods', paymentMethodData),
  removePaymentMethod: (paymentMethodId) =>
    api.delete(`/payments/methods/${paymentMethodId}`),
};

export default api;
