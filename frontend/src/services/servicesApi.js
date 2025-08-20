// Services API service
import AsyncStorage from '@react-native-async-storage/async-storage';
import throttler from '../utils/requestThrottler';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ServicesAPI {
  /**
   * Get authorization header with token
   * @returns {Promise<Object>} Authorization headers
   */
  static async getAuthHeaders() {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      };
    } catch (error) {
      return {
        'Content-Type': 'application/json',
      };
    }
  }
  /**
   * Get all services with optional filters
   * @param {Object} filters - Optional filters (category, location, priceRange, etc.)
   * @returns {Promise} API response with services list
   */
  static async getAllServices(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const data = await throttler.fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get service by ID
   * @param {string} serviceId - Service ID
   * @returns {Promise} API response with service details
   */
  static async getServiceById(serviceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch service details');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search services by keyword
   * @param {string} query - Search query
   * @param {Object} filters - Optional additional filters
   * @returns {Promise} API response with search results
   */
  static async searchServices(query, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/services/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get services by category
   * @param {string} category - Service category
   * @param {Object} filters - Optional additional filters
   * @returns {Promise} API response with services in category
   */
  static async getServicesByCategory(category, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        category,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/services/category?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch services by category');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get featured/popular services
   * @param {number} limit - Number of services to return
   * @returns {Promise} API response with featured services
   */
  static async getFeaturedServices(limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/featured?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch featured services');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get service categories
   * @returns {Promise} API response with available categories
   */
  static async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/services/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch categories');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get provider's services
   * @returns {Promise} API response with provider's services
   */
  static async getProviderServices() {
    try {
      const headers = await this.getAuthHeaders();

      // Try current provider profile (singular route)
      let providerId = null;
      try {
        const profileRes = await fetch(`${API_BASE_URL}/provider/profile`, {
          method: 'GET',
          headers,
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          providerId = profileData?.data?._id || profileData?.data?.user?._id || profileData?.profile?._id || profileData?._id || null;
        }
      } catch (_) {
        // ignore and try fallbacks
      }

      // Fallback 1: decode userId from JWT in storage
      if (!providerId) {
        try {
          const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken')) || (await AsyncStorage.getItem('authToken'));
          if (token) {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(decodeBase64Url(parts[1]));
              providerId = payload?.userId || payload?._id || null;
            }
          }
        } catch (_) {}
      }

      if (!providerId) {
        throw new Error('Unable to determine provider ID');
      }

      // Now load services for this provider
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}/services`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch provider services');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get popular services
   * @param {number} limit - Number of services to return (default: 10)
   * @returns {Promise} API response with popular services
   */
  static async getPopularServices(limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/popular?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch popular services');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update service status (activate/deactivate)
   * @param {string} serviceId - Service ID
   * @param {string} status - New status (active/inactive)
   * @returns {Promise} API response with updated service
   */
  static async updateServiceStatus(serviceId, status) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update service status');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

// Helper: base64url decode to string
function decodeBase64Url(input) {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    if (typeof atob === 'function') {
      const decoded = atob(padded);
      try { return decodeURIComponent(escape(decoded)); } catch { return decoded; }
    }
    // Fallback using Buffer if available
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf-8');
    }
  } catch (_) {}
  return '';
}

export default ServicesAPI;
