import { apiGet, apiPost, apiPut, API_ENDPOINTS } from '../config/api';

/**
 * Reviews API Service
 * Handles all review-related API calls
 */

// Create a new review
export const createReview = async (reviewData, token) => {
  try {
    const response = await apiPost(API_ENDPOINTS.REVIEWS.CREATE, reviewData, token);
    return response;
  } catch (error) {
    console.error('Create review error:', error);
    throw error;
  }
};

// Get reviews with filtering and pagination
export const getReviews = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.providerId && { providerId: params.providerId }),
      ...(params.serviceId && { serviceId: params.serviceId }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
      ...(params.rating && { rating: params.rating }),
      ...(params.verified && { verified: params.verified }),
    }).toString();
    
    const endpoint = `${API_ENDPOINTS.REVIEWS.LIST}?${queryParams}`;
    const response = await apiGet(endpoint);
    return response;
  } catch (error) {
    console.error('Get reviews error:', error);
    throw error;
  }
};

// Get single review details
export const getReviewDetails = async (reviewId) => {
  try {
    const response = await apiGet(API_ENDPOINTS.REVIEWS.DETAILS(reviewId));
    return response;
  } catch (error) {
    console.error('Get review details error:', error);
    throw error;
  }
};

// Update a review
export const updateReview = async (reviewId, reviewData, token) => {
  try {
    const response = await apiPut(API_ENDPOINTS.REVIEWS.UPDATE(reviewId), reviewData, token);
    return response;
  } catch (error) {
    console.error('Update review error:', error);
    throw error;
  }
};

// Respond to a review (provider only)
export const respondToReview = async (reviewId, responseData, token) => {
  try {
    const response = await apiPost(API_ENDPOINTS.REVIEWS.RESPOND(reviewId), responseData, token);
    return response;
  } catch (error) {
    console.error('Respond to review error:', error);
    throw error;
  }
};

// Mark review as helpful/unhelpful
export const toggleReviewHelpfulness = async (reviewId, helpfulData, token) => {
  try {
    const response = await apiPost(API_ENDPOINTS.REVIEWS.HELPFUL(reviewId), helpfulData, token);
    return response;
  } catch (error) {
    console.error('Toggle review helpfulness error:', error);
    throw error;
  }
};

// Flag a review for moderation
export const flagReview = async (reviewId, flagData, token) => {
  try {
    const response = await apiPost(API_ENDPOINTS.REVIEWS.FLAG(reviewId), flagData, token);
    return response;
  } catch (error) {
    console.error('Flag review error:', error);
    throw error;
  }
};

// Get trending reviews
export const getTrendingReviews = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      limit: params.limit || 10,
      period: params.period || 30,
    }).toString();
    
    const endpoint = `${API_ENDPOINTS.REVIEWS.TRENDING}?${queryParams}`;
    const response = await apiGet(endpoint);
    return response;
  } catch (error) {
    console.error('Get trending reviews error:', error);
    throw error;
  }
};

// Get user's own reviews (written or received)
export const getMyReviews = async (params = {}, token) => {
  try {
    const queryParams = new URLSearchParams({
      type: params.type || 'written',
      page: params.page || 1,
      limit: params.limit || 10,
    }).toString();
    
    const endpoint = `${API_ENDPOINTS.REVIEWS.MY_REVIEWS}?${queryParams}`;
    const response = await apiGet(endpoint, token);
    return response;
  } catch (error) {
    console.error('Get my reviews error:', error);
    throw error;
  }
};

// Helper function to render star rating
export const renderStarRating = (rating, maxStars = 5) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
  
  return {
    full: '⭐'.repeat(fullStars),
    half: hasHalfStar ? '⭐' : '', // You might want to use a half-star emoji
    empty: '☆'.repeat(emptyStars),
    string: '⭐'.repeat(fullStars) + '☆'.repeat(emptyStars)
  };
};

// Helper function to get rating color
export const getRatingColor = (rating) => {
  if (rating >= 4.5) return '#4CAF50'; // Green
  if (rating >= 3.5) return '#8BC34A'; // Light Green
  if (rating >= 2.5) return '#FFC107'; // Amber
  if (rating >= 1.5) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

// Helper function to format review date
export const formatReviewDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
};

// Helper function to get review verification status
export const getVerificationBadge = (isVerified) => {
  return isVerified ? '✅ Verified' : '';
};

// Helper function to truncate review text
export const truncateReviewText = (text, maxLength = 150) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Helper function to calculate average rating from multiple aspects
export const calculateAverageRating = (ratings) => {
  const validRatings = Object.values(ratings).filter(rating => 
    rating !== null && rating !== undefined && !isNaN(rating)
  );
  
  if (validRatings.length === 0) return 0;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / validRatings.length) * 10) / 10; // Round to 1 decimal place
};

// Helper function to get flag reason display text
export const getFlagReasonText = (reason) => {
  const reasonTexts = {
    spam: '🚫 Spam',
    inappropriate: '⚠️ Inappropriate Content',
    fake: '🔍 Suspected Fake Review',
    offensive: '😡 Offensive Language',
    other: '❓ Other Issue'
  };
  
  return reasonTexts[reason] || reason;
};

export default {
  createReview,
  getReviews,
  getReviewDetails,
  updateReview,
  respondToReview,
  toggleReviewHelpfulness,
  flagReview,
  getTrendingReviews,
  getMyReviews,
  renderStarRating,
  getRatingColor,
  formatReviewDate,
  getVerificationBadge,
  truncateReviewText,
  calculateAverageRating,
  getFlagReasonText,
};
