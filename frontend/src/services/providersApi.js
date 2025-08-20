// Providers API service
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ProvidersAPI {
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
   * Get all providers with optional filters
   * @param {Object} filters - Optional filters (location, category, rating, etc.)
   * @returns {Promise} API response with providers list
   */
  static async getProviders(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/providers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch providers');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get provider by ID
   * @param {string} providerId - Provider ID
   * @returns {Promise} API response with provider details
   */
  static async getProviderById(providerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/${providerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch provider details');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get provider profile (for authenticated provider)
   * @returns {Promise} API response with provider profile
   */
  static async getProviderProfile() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/providers/profile`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch provider profile');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update provider profile
   * @param {Object} profileData - Provider profile data
   * @returns {Promise} API response with updated profile
   */
  static async updateProviderProfile(profileData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/providers/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update provider profile');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get provider's services
   * @param {string} providerId - Provider ID (optional, uses current user if not provided)
   * @returns {Promise} API response with provider's services
   */
  static async getProviderServices(providerId = null) {
    try {
      const headers = await this.getAuthHeaders();
      
      const url = providerId 
        ? `${API_BASE_URL}/providers/${providerId}/services`
        : `${API_BASE_URL}/services/provider`;
      
      const response = await fetch(url, {
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
   * Get provider's bookings
   * @param {Object} filters - Optional filters (status, date range, etc.)
   * @returns {Promise} API response with provider's bookings
   */
  static async getProviderBookings(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      // Backend exposes unified /bookings; role in auth determines provider/customer scope
      const url = `${API_BASE_URL}/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch provider bookings');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update provider availability
   * @param {Object} availabilityData - Availability schedule data
   * @returns {Promise} API response with updated availability
   */
  static async updateAvailability(availabilityData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/providers/availability`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(availabilityData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update availability');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get provider availability
   * @param {string} providerId - Provider ID (optional, uses current user if not provided)
   * @param {string} date - Specific date (optional)
   * @returns {Promise} API response with provider availability
   */
  static async getProviderAvailability(providerId = null, date = null) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      
      const url = providerId 
        ? `${API_BASE_URL}/providers/${providerId}/availability${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        : `${API_BASE_URL}/providers/availability${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch provider availability');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get provider reviews
   * @param {string} providerId - Provider ID
   * @param {Object} filters - Optional filters (rating, date, etc.)
   * @returns {Promise} API response with provider reviews
   */
  static async getProviderReviews(providerId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/providers/${providerId}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch provider reviews');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get provider stats/analytics
   * @param {Object} filters - Optional filters (date range, etc.)
   * @returns {Promise} API response with provider statistics
   */
  static async getProviderStats(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      // Use dashboard overview to avoid 404s; map into expected shape
      const url = `${API_BASE_URL}/dashboard/overview${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to fetch provider stats');
      }

      const d = payload.data || {};
      const mapped = {
        todayEarnings: 0,
        weeklyEarnings: 0,
        monthlyEarnings: d.thisMonth?.revenue || 0,
        averageRating: 0,
        totalReviews: d.totalReviews || 0,
      };

      return mapped;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search providers
   * @param {string} query - Search query
   * @param {Object} filters - Optional filters (location, category, etc.)
   * @returns {Promise} API response with search results
   */
  static async searchProviders(query, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        ...filters
      });

      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.set(key, filters[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/providers/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search providers');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get featured/top-rated providers
   * @param {number} limit - Number of providers to fetch
   * @returns {Promise} API response with featured providers
   */
  static async getFeaturedProviders(limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/providers/featured?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch featured providers');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get providers by category
   * @param {string} category - Service category
   * @param {Object} filters - Additional filters
   * @returns {Promise} API response with providers in category
   */
  static async getProvidersByCategory(category, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        category,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/providers/category?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch providers by category');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get nearby providers
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {number} radius - Search radius in kilometers
   * @param {Object} filters - Additional filters
   * @returns {Promise} API response with nearby providers
   */
  static async getNearbyProviders(latitude, longitude, radius = 10, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        lat: latitude,
        lng: longitude,
        radius,
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/providers/nearby?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch nearby providers');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default ProvidersAPI;
