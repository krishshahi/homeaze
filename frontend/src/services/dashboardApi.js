// Dashboard API Service
import { apiGet, API_BASE_URL } from '../config/api';
import throttler from '../utils/requestThrottler';

// Dashboard API endpoints
const DASHBOARD_ENDPOINTS = {
  OVERVIEW: '/dashboard/overview',
  ANALYTICS: '/dashboard/analytics',
  RECENT_BOOKINGS: '/dashboard/recent-bookings',
  REVENUE_STATS: '/dashboard/revenue-stats',
  USER_STATS: '/dashboard/user-stats',
};

/**
 * Fetch dashboard overview statistics
 * @param {string} token - Authentication token
 * @returns {Promise} Dashboard overview data
 */
export const fetchDashboardOverview = async (token) => {
  try {
    const response = await apiGet(DASHBOARD_ENDPOINTS.OVERVIEW, token);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

/**
 * Fetch detailed analytics for charts and graphs
 * @param {string} token - Authentication token
 * @returns {Promise} Analytics data
 */
export const fetchDashboardAnalytics = async (token) => {
  try {
    const response = await apiGet(DASHBOARD_ENDPOINTS.ANALYTICS, token);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw error;
  }
};

/**
 * Fetch recent bookings for dashboard
 * @param {string} token - Authentication token
 * @param {number} limit - Number of bookings to fetch (default: 10)
 * @returns {Promise} Recent bookings data
 */
export const fetchRecentBookings = async (token, limit = 10) => {
  try {
    const endpoint = `${DASHBOARD_ENDPOINTS.RECENT_BOOKINGS}?limit=${limit}`;
    const response = await apiGet(endpoint, token);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    throw error;
  }
};

/**
 * Fetch revenue statistics
 * @param {string} token - Authentication token
 * @returns {Promise} Revenue statistics data
 */
export const fetchRevenueStats = async (token) => {
  try {
    const response = await apiGet(DASHBOARD_ENDPOINTS.REVENUE_STATS, token);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    throw error;
  }
};

/**
 * Fetch user statistics
 * @param {string} token - Authentication token
 * @returns {Promise} User statistics data
 */
export const fetchUserStats = async (token) => {
  try {
    const response = await apiGet(DASHBOARD_ENDPOINTS.USER_STATS, token);
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Fetch complete dashboard data (combines multiple endpoints)
 * @param {string} token - Authentication token
 * @returns {Promise} Complete dashboard data
 */
export const fetchCompleteDashboardData = async (token) => {
  try {
    // Use staggered batch requests instead of Promise.all to prevent 429 errors
    const requests = [
      { url: `${API_BASE_URL}${DASHBOARD_ENDPOINTS.OVERVIEW}`, options: { headers: { Authorization: `Bearer ${token}` } } },
      { url: `${API_BASE_URL}${DASHBOARD_ENDPOINTS.ANALYTICS}`, options: { headers: { Authorization: `Bearer ${token}` } } },
      { url: `${API_BASE_URL}${DASHBOARD_ENDPOINTS.RECENT_BOOKINGS}?limit=5`, options: { headers: { Authorization: `Bearer ${token}` } } },
      { url: `${API_BASE_URL}${DASHBOARD_ENDPOINTS.REVENUE_STATS}`, options: { headers: { Authorization: `Bearer ${token}` } } },
      { url: `${API_BASE_URL}${DASHBOARD_ENDPOINTS.USER_STATS}`, options: { headers: { Authorization: `Bearer ${token}` } } },
    ];

    const results = await throttler.batchRequests(requests, 300); // 300ms stagger
    
    // Extract successful responses and handle failures gracefully
    const overview = results[0]?.success ? results[0].data.data : {};
    const analytics = results[1]?.success ? results[1].data.data : { recentActivity: [] };
    const recentBookings = results[2]?.success ? results[2].data.data : [];
    const revenueStats = results[3]?.success ? results[3].data.data : {};
    const userStats = results[4]?.success ? results[4].data.data : {};

    // Transform the data to match frontend expectations
    return {
      stats: {
        totalUsers: overview.totalUsers,
        totalCustomers: overview.totalCustomers,
        totalProviders: overview.totalProviders,
        totalServices: overview.totalServices,
        totalBookings: overview.totalBookings,
        totalPayments: overview.totalPayments,
        totalReviews: overview.totalReviews,
        activeBookings: overview.activeBookings,
        currentRevenue: overview.currentRevenue,
        growth: overview.growth,
        
        // For customer dashboard - map from user perspective
        completedServices: overview.totalBookings, // Approximate
        totalSpent: overview.currentRevenue,
        savedAmount: overview.currentRevenue * 0.15, // Approximate 15% savings
      },
      recentBookings: recentBookings.map(booking => ({
        id: booking._id,
        serviceTitle: booking.serviceDetails?.title || booking.serviceId?.title || 'Service',
        serviceIcon: getCategoryIcon(booking.serviceDetails?.category || booking.serviceId?.category),
        providerName: booking.providerId?.providerProfile?.businessName || booking.providerId?.name || 'Provider',
        status: booking.status,
        scheduledDate: booking.scheduledDate,
        totalCost: booking.pricing?.estimatedCost || booking.pricing?.finalCost || 0,
        location: `${booking.location?.address?.street || ''}, ${booking.location?.address?.city || ''}, ${booking.location?.address?.state || ''}`.trim(),
      })),
      upcomingServices: recentBookings
        .filter(booking => new Date(booking.scheduledDate) > new Date() && ['confirmed', 'pending'].includes(booking.status))
        .map(booking => ({
          id: booking._id,
          serviceTitle: booking.serviceDetails?.title || booking.serviceId?.title || 'Service',
          serviceIcon: getCategoryIcon(booking.serviceDetails?.category || booking.serviceId?.category),
          providerName: booking.providerId?.providerProfile?.businessName || booking.providerId?.name || 'Provider',
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime?.start || '10:00 AM',
          location: `${booking.location?.address?.street || ''}, ${booking.location?.address?.city || ''}, ${booking.location?.address?.state || ''}`.trim(),
        })),
      recentActivity: analytics.recentActivity?.map(activity => ({
        id: activity._id,
        type: getActivityType(activity.status),
        title: getActivityTitle(activity.status),
        description: `${activity.serviceDetails?.title || activity.serviceId?.title || 'Service'} by ${activity.providerId?.providerProfile?.businessName || activity.providerId?.name || 'Provider'}`,
        timestamp: activity.createdAt,
        icon: getActivityIcon(activity.status),
      })) || [],
      recommendations: [], // This would come from a separate recommendations API
      revenue: revenueStats,
      analytics: analytics,
    };
  } catch (error) {
    console.error('Error fetching complete dashboard data:', error);
    throw error;
  }
};

// Helper functions
const getCategoryIcon = (category) => {
  const icons = {
    cleaning: '🧹',
    plumbing: '🔧',
    electrical: '⚡',
    hvac: '❄️',
    painting: '🎨',
    carpentry: '🔨',
    gardening: '🌱',
    'pest-control': '🐛',
    'appliance-repair': '🔧',
    handyman: '🛠️',
  };
  return icons[category] || '🏠';
};

const getActivityType = (status) => {
  const types = {
    completed: 'booking_completed',
    confirmed: 'booking_confirmed',
    cancelled: 'booking_cancelled',
    'in-progress': 'booking_in_progress',
  };
  return types[status] || 'booking_update';
};

const getActivityTitle = (status) => {
  const titles = {
    completed: 'Service Completed',
    confirmed: 'Booking Confirmed',
    cancelled: 'Booking Cancelled',
    'in-progress': 'Service In Progress',
  };
  return titles[status] || 'Booking Update';
};

const getActivityIcon = (status) => {
  const icons = {
    completed: '✅',
    confirmed: '📅',
    cancelled: '❌',
    'in-progress': '🔄',
  };
  return icons[status] || '📋';
};

export default {
  fetchDashboardOverview,
  fetchDashboardAnalytics,
  fetchRecentBookings,
  fetchRevenueStats,
  fetchUserStats,
  fetchCompleteDashboardData,
};
