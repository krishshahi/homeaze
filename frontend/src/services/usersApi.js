import api from './api';

export const usersApi = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', imageFile);
      
      const response = await api.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID (for viewing other users)
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/users/preferences', preferences);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's addresses
  getAddresses: async () => {
    try {
      const response = await api.get('/users/addresses');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add new address
  addAddress: async (addressData) => {
    try {
      const response = await api.post('/users/addresses', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/users/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/users/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    try {
      const response = await api.put(`/users/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/users/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.put(`/users/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    try {
      const response = await api.put('/users/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      const response = await api.delete('/users/account');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user statistics (for providers)
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's favorite services
  getFavorites: async () => {
    try {
      const response = await api.get('/users/favorites');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add service to favorites
  addToFavorites: async (serviceId) => {
    try {
      const response = await api.post(`/users/favorites/${serviceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove service from favorites
  removeFromFavorites: async (serviceId) => {
    try {
      const response = await api.delete(`/users/favorites/${serviceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default usersApi;
