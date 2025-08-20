import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { apiPost, API_ENDPOINTS, TOKEN_STORAGE_KEY } from '../../config/api';

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });
      
      console.log('🔍 Login response:', response);
      
      if (response.data && response.data.token) {
        console.log('🔐 Storing token...');
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        console.log('✅ Token stored');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiPost(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await apiPost(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Loading stored auth...');
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const userData = await AsyncStorage.getItem('userData');
      
      console.log('🔍 Stored auth data:', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'None'
      });
      
      if (token && userData) {
        const user = JSON.parse(userData);
        console.log('✅ Auth data loaded successfully');
        return {
          token,
          user
        };
      }
      
      console.log('⚠️ No stored auth data found');
      return null;
    } catch (error) {
      console.error('❌ Error loading stored auth:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🚪 Clearing stored auth data...');
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      await AsyncStorage.removeItem('userData');
      console.log('✅ Auth data cleared successfully');
      return null;
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null,
  forgotPassword: {
    loading: false,
    success: false,
    error: null,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPasswordResetState(state) {
      state.forgotPassword.loading = false;
      state.forgotPassword.success = false;
      state.forgotPassword.error = null;
    },
    logout: (state) => {
      console.log('🔄 Synchronous logout - clearing Redux auth state...');
      state.loading = false;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;
      console.log('✅ Redux auth state cleared synchronously');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('🔄 Updating Redux state with login data:', action.payload);
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
        console.log('✅ Redux state updated - authenticated:', state.isAuthenticated, 'hasToken:', !!state.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      })
      
      // Register user
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload;
      })
      
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPassword.loading = true;
        state.forgotPassword.error = null;
        state.forgotPassword.success = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPassword.loading = false;
        state.forgotPassword.success = true;
        state.forgotPassword.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPassword.loading = false;
        state.forgotPassword.success = false;
        state.forgotPassword.error = action.payload;
      })
      
      // Load stored auth
      .addCase(loadStoredAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      
      // Logout user
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        console.log('🔄 Clearing Redux auth state...');
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
        console.log('✅ User logged out successfully');
      })
      .addCase(logoutUser.rejected, (state) => {
        // Still logout even if storage clearing fails
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

export const { 
  clearError,
  resetPasswordResetState,
  logout 
} = authSlice.actions;

export default authSlice.reducer;
