// Quotes API Service - Frontend Integration for Quote Management
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, API_ENDPOINTS } from '../config/api';

// Create a new quote
export const createQuote = async (quoteData, token) => {
  try {
    console.log('📝 Creating quote:', quoteData);
    const response = await apiPost('/quotes', quoteData, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Create quote error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get quotes for user (customer or provider)
export const getUserQuotes = async (params = {}, token) => {
  try {
    console.log('📋 Fetching user quotes with params:', params);
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/quotes?${queryString}` : '/quotes';
    
    const response = await apiGet(endpoint, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Get user quotes error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get quote details by ID
export const getQuoteDetails = async (quoteId, token) => {
  try {
    console.log('🔍 Fetching quote details:', quoteId);
    const response = await apiGet(`/quotes/${quoteId}`, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get quote details error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update quote status
export const updateQuoteStatus = async (quoteId, status, token) => {
  try {
    console.log('🔄 Updating quote status:', quoteId, status);
    const response = await apiPatch(`/quotes/${quoteId}/status`, { status }, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Update quote status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Accept quote (customer)
export const acceptQuote = async (quoteId, token) => {
  try {
    console.log('✅ Accepting quote:', quoteId);
    const response = await apiPost(`/quotes/${quoteId}/accept`, {}, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Accept quote error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Reject quote (customer)
export const rejectQuote = async (quoteId, reason, token) => {
  try {
    console.log('❌ Rejecting quote:', quoteId, reason);
    const response = await apiPost(`/quotes/${quoteId}/reject`, { reason }, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Reject quote error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update quote (provider)
export const updateQuote = async (quoteId, updateData, token) => {
  try {
    console.log('📝 Updating quote:', quoteId, updateData);
    const response = await apiPut(`/quotes/${quoteId}`, updateData, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Update quote error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add note to quote
export const addQuoteNote = async (quoteId, noteData, token) => {
  try {
    console.log('📄 Adding note to quote:', quoteId, noteData);
    const response = await apiPost(`/quotes/${quoteId}/notes`, noteData, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Add quote note error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get quote timeline/history
export const getQuoteTimeline = async (quoteId, token) => {
  try {
    console.log('📊 Fetching quote timeline:', quoteId);
    const response = await apiGet(`/quotes/${quoteId}/timeline`, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get quote timeline error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get quote analytics (for providers)
export const getQuoteAnalytics = async (params = {}, token) => {
  try {
    console.log('📈 Fetching quote analytics:', params);
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/quotes/analytics?${queryString}` : '/quotes/analytics';
    
    const response = await apiGet(endpoint, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get quote analytics error:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
};

// Search quotes
export const searchQuotes = async (searchParams, token) => {
  try {
    console.log('🔍 Searching quotes:', searchParams);
    const response = await apiPost('/quotes/search', searchParams, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Search quotes error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Convert quote to booking
export const convertQuoteToBooking = async (quoteId, bookingData, token) => {
  try {
    console.log('🔄 Converting quote to booking:', quoteId, bookingData);
    const response = await apiPost(`/quotes/${quoteId}/convert-to-booking`, bookingData, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Convert quote to booking error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  createQuote,
  getUserQuotes,
  getQuoteDetails,
  updateQuoteStatus,
  acceptQuote,
  rejectQuote,
  updateQuote,
  addQuoteNote,
  getQuoteTimeline,
  getQuoteAnalytics,
  searchQuotes,
  convertQuoteToBooking
};
