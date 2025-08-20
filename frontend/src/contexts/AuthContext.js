import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';

import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Set token in API headers
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        // Fetch user profile
        const response = await api.get('/api/auth/me');
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      // Store token
      await AsyncStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/signup', userData);
      const { token, user } = response.data.data;
      
      // Store token
      await AsyncStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed');
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      await AsyncStorage.removeItem('token');
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset link');
      return { success: false, error: error.response?.data?.message || 'Failed to send reset link' };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/reset-password', { token, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      setError(error.response?.data?.message || 'Password reset failed');
      return { success: false, error: error.response?.data?.message || 'Password reset failed' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await api.put('/api/users/profile', profileData);
      setUser(response.data.data.user);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      return { success: false, error: error.response?.data?.message || 'Profile update failed' };
    }
  };

  const socialLogin = async (provider, accessToken) => {
    try {
      setError(null);
      const response = await api.post(`/api/auth/${provider}`, { accessToken });
      const { token, user } = response.data.data;
      
      // Store token
      await AsyncStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || `${provider} login failed`);
      return { success: false, error: error.response?.data?.message || `${provider} login failed` };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        socialLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
