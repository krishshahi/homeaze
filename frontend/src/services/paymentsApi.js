import { apiGet, apiPost, API_ENDPOINTS } from '../config/api';

/**
 * Payment API Service
 * Handles all payment-related API calls
 */

// Process a new payment
export const processPayment = async (paymentData, token) => {
  try {
    const response = await apiPost(API_ENDPOINTS.PAYMENTS.PROCESS, paymentData, token);
    return response;
  } catch (error) {
    console.error('Process payment error:', error);
    throw error;
  }
};

// Get payment details
export const getPaymentDetails = async (paymentId, token) => {
  try {
    const response = await apiGet(API_ENDPOINTS.PAYMENTS.DETAILS(paymentId), token);
    return response;
  } catch (error) {
    console.error('Get payment details error:', error);
    throw error;
  }
};

// Get payment history
export const getPaymentHistory = async (params = {}, token) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
    }).toString();
    
    const endpoint = `${API_ENDPOINTS.PAYMENTS.HISTORY}?${queryParams}`;
    const response = await apiGet(endpoint, token);
    return response;
  } catch (error) {
    console.error('Get payment history error:', error);
    throw error;
  }
};

// Process refund
export const processRefund = async (paymentId, refundData, token) => {
  try {
    const response = await apiPost(API_ENDPOINTS.PAYMENTS.REFUND(paymentId), refundData, token);
    return response;
  } catch (error) {
    console.error('Process refund error:', error);
    throw error;
  }
};

// Get payment statistics (for providers)
export const getPaymentStats = async (period = 'month', token) => {
  try {
    const endpoint = `${API_ENDPOINTS.PAYMENTS.STATS}?period=${period}`;
    const response = await apiGet(endpoint, token);
    return response;
  } catch (error) {
    console.error('Get payment stats error:', error);
    throw error;
  }
};

// Create payment intent
export const createPaymentIntent = async (intentData, token) => {
  try {
    const response = await apiPost(API_ENDPOINTS.PAYMENTS.CREATE_INTENT, intentData, token);
    return response;
  } catch (error) {
    console.error('Create payment intent error:', error);
    throw error;
  }
};

// Helper function to format payment amounts
export const formatPaymentAmount = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Helper function to get payment status color
export const getPaymentStatusColor = (status) => {
  const statusColors = {
    pending: '#FFA500',      // Orange
    processing: '#4169E1',   // Royal Blue
    completed: '#32CD32',    // Lime Green
    failed: '#DC143C',       // Crimson
    refunded: '#9370DB',     // Medium Purple
    cancelled: '#808080',    // Gray
  };
  
  return statusColors[status?.toLowerCase()] || '#808080';
};

// Helper function to get payment method icon
export const getPaymentMethodIcon = (method) => {
  const methodIcons = {
    credit_card: '💳',
    debit_card: '💳',
    paypal: '🅿️',
    apple_pay: '🍎',
    google_pay: '🟢',
    bank_transfer: '🏦',
    cash: '💵',
  };
  
  return methodIcons[method?.toLowerCase()] || '💳';
};

export default {
  processPayment,
  getPaymentDetails,
  getPaymentHistory,
  processRefund,
  getPaymentStats,
  createPaymentIntent,
  formatPaymentAmount,
  getPaymentStatusColor,
  getPaymentMethodIcon,
};
