// Profile API Service
import { apiGet, apiPut, apiPost } from '../config/api';

// Profile API endpoints
const PROFILE_ENDPOINTS = {
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  UPDATE_PROVIDER_PROFILE: '/users/provider-profile',
  UPDATE_CUSTOMER_PREFERENCES: '/users/customer-preferences',
  UPLOAD_AVATAR: '/users/upload-avatar',
  DELETE_ACCOUNT: '/users/account',
  GET_PUBLIC_PROFILE: (userId) => `/users/${userId}/public`,
};

/**
 * Fetch current user profile
 * @param {string} token - Authentication token
 * @returns {Promise} User profile data
 */
export const fetchUserProfile = async (token) => {
  try {
    const response = await apiGet(PROFILE_ENDPOINTS.GET_PROFILE, token);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile (basic information)
 * @param {Object} profileData - Profile data to update
 * @param {string} token - Authentication token
 * @returns {Promise} Updated user profile
 */
export const updateUserProfile = async (profileData, token) => {
  try {
    const response = await apiPut(PROFILE_ENDPOINTS.UPDATE_PROFILE, profileData, token);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update provider-specific profile
 * @param {Object} providerData - Provider profile data
 * @param {string} token - Authentication token
 * @returns {Promise} Updated provider profile
 */
export const updateProviderProfile = async (providerData, token) => {
  try {
    const response = await apiPut(PROFILE_ENDPOINTS.UPDATE_PROVIDER_PROFILE, providerData, token);
    return response.data;
  } catch (error) {
    console.error('Error updating provider profile:', error);
    throw error;
  }
};

/**
 * Update customer preferences
 * @param {Object} preferences - Customer preferences
 * @param {string} token - Authentication token
 * @returns {Promise} Updated customer preferences
 */
export const updateCustomerPreferences = async (preferences, token) => {
  try {
    const response = await apiPut(PROFILE_ENDPOINTS.UPDATE_CUSTOMER_PREFERENCES, preferences, token);
    return response.data;
  } catch (error) {
    console.error('Error updating customer preferences:', error);
    throw error;
  }
};

/**
 * Upload user avatar
 * @param {string} avatarUrl - Avatar URL
 * @param {string} token - Authentication token
 * @returns {Promise} Avatar upload result
 */
export const uploadAvatar = async (avatarUrl, token) => {
  try {
    const response = await apiPost(PROFILE_ENDPOINTS.UPLOAD_AVATAR, { avatarUrl }, token);
    return response.data;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Get public profile of a user
 * @param {string} userId - User ID
 * @returns {Promise} Public profile data
 */
export const fetchPublicProfile = async (userId) => {
  try {
    const response = await apiGet(PROFILE_ENDPOINTS.GET_PUBLIC_PROFILE(userId));
    return response.data;
  } catch (error) {
    console.error('Error fetching public profile:', error);
    throw error;
  }
};

/**
 * Delete user account
 * @param {string} password - User password for confirmation
 * @param {string} reason - Reason for account deletion (optional)
 * @param {string} token - Authentication token
 * @returns {Promise} Account deletion result
 */
export const deleteAccount = async (password, reason, token) => {
  try {
    const response = await apiPost(PROFILE_ENDPOINTS.DELETE_ACCOUNT, { password, reason }, token);
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

export default {
  fetchUserProfile,
  updateUserProfile,
  updateProviderProfile,
  updateCustomerPreferences,
  uploadAvatar,
  fetchPublicProfile,
  deleteAccount,
};
