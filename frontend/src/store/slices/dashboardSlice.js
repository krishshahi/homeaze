import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { fetchCompleteDashboardData, fetchUserStats as fetchUserStatsAPI } from '../../services/dashboardApi';

// Async thunks for API calls
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      console.log('🔍 Dashboard fetch - Auth state:', { 
        isAuthenticated: auth.isAuthenticated, 
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN'
      });
      
      if (!token) {
        console.error('❌ No authentication token found');
        throw new Error('No authentication token');
      }

      console.log('🌐 Fetching dashboard data from API...');
      // Fetch real dashboard data from API
      const response = await fetchCompleteDashboardData(token);
      
      console.log('✅ Dashboard data received:', response);
      return response;
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'dashboard/fetchUserStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token');
      }

      // Fetch real user stats from API
      const response = await fetchUserStatsAPI(token);

      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user stats');
    }
  }
);

const initialState = {
  stats: {
    totalBookings: 0,
    completedServices: 0,
    totalSpent: 0,
    savedAmount: 0,
    averageRating: 0,
    favoriteCategory: null,
  },
  recentBookings: [],
  upcomingServices: [],
  recentActivity: [],
  recommendations: [],
  loading: {
    dashboard: false,
    stats: false,
  },
  error: {
    dashboard: null,
    stats: null,
  },
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType && state.error[errorType]) {
        state.error[errorType] = null;
      } else {
        // Clear all errors
        Object.keys(state.error).forEach(key => {
          state.error[key] = null;
        });
      }
    },
    updateRecentActivity: (state, action) => {
      const newActivity = action.payload;
      state.recentActivity.unshift(newActivity);
      // Keep only the latest 10 activities
      if (state.recentActivity.length > 10) {
        state.recentActivity = state.recentActivity.slice(0, 10);
      }
    },
    markRecommendationViewed: (state, action) => {
      const recommendationId = action.payload;
      const recommendation = state.recommendations.find(r => r.id === recommendationId);
      if (recommendation) {
        recommendation.viewed = true;
      }
    },
    resetDashboard: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading.dashboard = true;
        state.error.dashboard = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.stats = action.payload.stats;
        state.recentBookings = action.payload.recentBookings;
        state.upcomingServices = action.payload.upcomingServices;
        state.recentActivity = action.payload.recentActivity;
        state.recommendations = action.payload.recommendations;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error.dashboard = action.payload;
      })
      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = { ...state.stats, ...action.payload };
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload;
      });
  },
});

export const {
  clearError,
  updateRecentActivity,
  markRecommendationViewed,
  resetDashboard,
} = dashboardSlice.actions;

// Selectors
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectRecentBookings = (state) => state.dashboard.recentBookings;
export const selectUpcomingServices = (state) => state.dashboard.upcomingServices;
export const selectRecentActivity = (state) => state.dashboard.recentActivity;
export const selectRecommendations = (state) => state.dashboard.recommendations;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectDashboardLastUpdated = (state) => state.dashboard.lastUpdated;

export default dashboardSlice.reducer;
