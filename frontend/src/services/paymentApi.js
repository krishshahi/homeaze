// Enhanced Payment API service - Production Ready
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class PaymentAPI {
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
   * Process a payment for a booking
   * @param {Object} paymentData - Payment information
   * @returns {Promise} API response with payment result
   */
  static async processPayment(paymentData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment processing failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment methods for user
   * @returns {Promise} API response with saved payment methods
   */
  static async getPaymentMethods() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/methods`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment methods');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save a new payment method
   * @param {Object} paymentMethodData - Payment method details
   * @returns {Promise} API response
   */
  static async savePaymentMethod(paymentMethodData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/methods`, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentMethodData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save payment method');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a payment method
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise} API response
   */
  static async deletePaymentMethod(paymentMethodId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete payment method');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set default payment method
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise} API response
   */
  static async setDefaultPaymentMethod(paymentMethodId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/methods/${paymentMethodId}/default`, {
        method: 'PUT',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to set default payment method');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment history
   * @param {Object} filters - Optional filters
   * @returns {Promise} API response with payment history
   */
  static async getPaymentHistory(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/payments/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment history');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment details by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise} API response with payment details
   */
  static async getPaymentById(paymentId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment details');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process a refund
   * @param {string} paymentId - Payment ID
   * @param {Object} refundData - Refund details
   * @returns {Promise} API response
   */
  static async processRefund(paymentId, refundData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers,
        body: JSON.stringify(refundData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Refund processing failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate service cost with taxes and fees
   * @param {Object} costData - Service cost calculation data
   * @returns {Promise} API response with cost breakdown
   */
  static async calculateServiceCost(costData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/calculate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(costData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to calculate service cost');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get payment intent for client-side processing (Stripe, etc.)
   * @param {Object} paymentIntentData - Payment intent details
   * @returns {Promise} API response with payment intent
   */
  static async createPaymentIntent(paymentIntentData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/intent`, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentIntentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment intent');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Confirm payment intent after client-side completion
   * @param {string} paymentIntentId - Payment intent ID
   * @param {Object} confirmationData - Confirmation details
   * @returns {Promise} API response
   */
  static async confirmPaymentIntent(paymentIntentId, confirmationData = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/intent/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers,
        body: JSON.stringify(confirmationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm payment');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get provider earnings/payouts
   * @param {Object} filters - Optional filters
   * @returns {Promise} API response with earnings data
   */
  static async getProviderEarnings(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/payments/earnings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch earnings');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request payout to provider's bank account
   * @param {Object} payoutData - Payout request data
   * @returns {Promise} API response
   */
  static async requestPayout(payoutData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/payments/payout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payoutData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request payout');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate card details using Luhn algorithm
   * @param {string} cardNumber - Card number to validate
   * @returns {boolean} Whether card number is valid
   */
  static validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    let sum = 0;
    let alternate = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let n = parseInt(cleaned.charAt(i), 10);
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return (sum % 10) === 0;
  }

  /**
   * Get card type from card number
   * @param {string} cardNumber - Card number
   * @returns {string} Card type (visa, mastercard, amex, discover, etc.)
   */
  static getCardType(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3[068]/,
      jcb: /^35/,
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleaned)) {
        return type;
      }
    }
    
    return 'unknown';
  }

  /**
   * Format card number for display with spaces
   * @param {string} cardNumber - Raw card number
   * @returns {string} Formatted card number
   */
  static formatCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Max length: 16 digits + 3 spaces
  }

  /**
   * Validate CVV
   * @param {string} cvv - CVV to validate
   * @param {string} cardType - Card type
   * @returns {boolean} Whether CVV is valid
   */
  static validateCVV(cvv, cardType) {
    const cleaned = cvv.replace(/\D/g, '');
    
    if (cardType === 'amex') {
      return cleaned.length === 4;
    } else {
      return cleaned.length === 3;
    }
  }

  /**
   * Validate expiry date
   * @param {string} month - Expiry month (MM)
   * @param {string} year - Expiry year (YYYY or YY)
   * @returns {boolean} Whether expiry date is valid
   */
  static validateExpiryDate(month, year) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const expMonth = parseInt(month, 10);
    let expYear = parseInt(year, 10);
    
    if (year.length === 2) {
      expYear += 2000;
    }
    
    if (expMonth < 1 || expMonth > 12) {
      return false;
    }
    
    if (expYear < currentYear) {
      return false;
    }
    
    if (expYear === currentYear && expMonth < currentMonth) {
      return false;
    }
    
    return true;
  }
}

export default PaymentAPI;
