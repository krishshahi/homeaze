// Enhanced Bookings API service - Production Ready
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';
const WEBSOCKET_URL = 'http://localhost:5000';

class BookingsAPI {
  static socket = null;

  /**
   * Get authorization header with token
   * @returns {Promise<Object>} Authorization headers
   */
  static async getAuthHeaders() {
    try {
      const token = await AsyncStorage.getItem('userToken');
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
   * Initialize WebSocket connection for real-time booking updates
   */
  static async initializeWebSocket(onBookingUpdate, onNotification) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      this.socket = io(WEBSOCKET_URL, {
        auth: {
          token
        },
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to booking WebSocket');
      });

      this.socket.on('bookingUpdate', onBookingUpdate);
      this.socket.on('notification', onNotification);
      
      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from booking WebSocket');
      });

    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }
  }

  /**
   * Disconnect WebSocket
   */
  static disconnectWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking details
   * @returns {Promise} API response with created booking
   */
  static async createBooking(bookingData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's bookings (both customer and provider)
   * @param {Object} filters - Optional filters (status, page, limit, etc.)
   * @returns {Promise} API response with user's bookings
   */
  static async getUserBookings(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise} API response with booking details
   */
  static async getBookingById(bookingId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch booking details');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update booking status (Provider confirms/rejects)
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status (confirmed/cancelled)
   * @param {string} providerNotes - Optional provider notes
   * @returns {Promise} API response with updated booking
   */
  static async updateBookingStatus(bookingId, status, providerNotes = '') {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status, providerNotes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update booking status');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Start service (Provider marks booking as in-progress)
   * @param {string} bookingId - Booking ID
   * @returns {Promise} API response
   */
  static async startService(bookingId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/start`, {
        method: 'PUT',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start service');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete service (Provider marks booking as completed)
   * @param {string} bookingId - Booking ID
   * @param {Object} completionData - Service completion details
   * @returns {Promise} API response
   */
  static async completeService(bookingId, completionData = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(completionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete service');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel a booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} API response
   */
  static async cancelBooking(bookingId, reason = '') {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add message to booking communication
   * @param {string} bookingId - Booking ID
   * @param {string} message - Message content
   * @param {Array} attachments - Optional attachments
   * @returns {Promise} API response
   */
  static async addMessage(bookingId, message, attachments = []) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message, attachments }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get booking messages
   * @param {string} bookingId - Booking ID
   * @returns {Promise} API response with messages
   */
  static async getMessages(bookingId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/messages`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch messages');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reschedule a booking
   * @param {string} bookingId - Booking ID
   * @param {Object} newSchedule - New date and time
   * @returns {Promise} API response with updated booking
   */
  static async rescheduleBooking(bookingId, newSchedule) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reschedule`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(newSchedule),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reschedule booking');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available time slots for a service
   * @param {string} serviceId - Service ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} providerId - Provider ID (optional)
   * @returns {Promise} API response with available slots
   */
  static async getAvailableSlots(serviceId, date, providerId = null) {
    try {
      const queryParams = new URLSearchParams({
        serviceId,
        date,
        ...(providerId && { providerId })
      });

      const response = await fetch(`${API_BASE_URL}/bookings/available-slots?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch available slots');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rate and review a completed booking
   * @param {string} bookingId - Booking ID
   * @param {Object} reviewData - Rating and review details
   * @returns {Promise} API response
   */
  static async rateBooking(bookingId, reviewData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/review`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get booking history with optional filters
   * @param {Object} filters - Filters like date range, status, etc.
   * @returns {Promise} API response with booking history
   */
  static async getBookingHistory(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/bookings/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch booking history');
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

      const url = `${API_BASE_URL}/bookings/provider${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
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
   * Get customer's bookings
   * @param {Object} filters - Optional filters (status, date range, etc.)
   * @returns {Promise} API response with customer's bookings
   */
  static async getCustomerBookings(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/bookings/customer${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch customer bookings');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default BookingsAPI;
