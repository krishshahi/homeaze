import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserProfile, updateUserProfile, updateProviderProfile, updateCustomerPreferences, uploadAvatar } from '../../services/profileApi';

// Async thunks for profile operations
export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('🔍 Fetching user profile...');
      const response = await fetchUserProfile(token);
      console.log('✅ Profile fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('🔄 Updating user profile...', profileData);
      const response = await updateUserProfile(profileData, token);
      console.log('✅ Profile updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const updateProviderProfileThunk = createAsyncThunk(
  'user/updateProviderProfile',
  async (providerData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('🔄 Updating provider profile...', providerData);
      const response = await updateProviderProfile(providerData, token);
      console.log('✅ Provider profile updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Provider profile update error:', error);
      return rejectWithValue(error.message || 'Failed to update provider profile');
    }
  }
);

export const updateCustomerPreferencesThunk = createAsyncThunk(
  'user/updateCustomerPreferences',
  async (preferences, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('🔄 Updating customer preferences...', preferences);
      const response = await updateCustomerPreferences(preferences, token);
      console.log('✅ Customer preferences updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Customer preferences update error:', error);
      return rejectWithValue(error.message || 'Failed to update customer preferences');
    }
  }
);

export const uploadAvatarThunk = createAsyncThunk(
  'user/uploadAvatar',
  async (avatarUrl, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('📸 Uploading avatar...', avatarUrl);
      const response = await uploadAvatar(avatarUrl, token);
      console.log('✅ Avatar uploaded:', response);
      return response;
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      return rejectWithValue(error.message || 'Failed to upload avatar');
    }
  }
);

const initialState = {
  profile: {
    id: null,
    name: '',
    email: '',
    phone: '',
    avatar: null,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: null,
    },
  },
  preferences: {
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
    theme: 'light',
    language: 'en',
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile(state, action) {
      state.profile = { ...state.profile, ...action.payload };
      state.loading = false;
      state.error = null;
    },
    setUserPreferences(state, action) {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
    resetUser(state) {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user) {
          state.profile = {
            ...state.profile,
            ...action.payload.user,
            id: action.payload.user._id || action.payload.user.id,
          };
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user) {
          state.profile = {
            ...state.profile,
            ...action.payload.user,
            id: action.payload.user._id || action.payload.user.id,
          };
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Provider Profile
      .addCase(updateProviderProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProviderProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user) {
          state.profile = {
            ...state.profile,
            ...action.payload.user,
            id: action.payload.user._id || action.payload.user.id,
          };
        }
      })
      .addCase(updateProviderProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Customer Preferences
      .addCase(updateCustomerPreferencesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerPreferencesThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user) {
          state.profile = {
            ...state.profile,
            ...action.payload.user,
            id: action.payload.user._id || action.payload.user.id,
          };
        }
      })
      .addCase(updateCustomerPreferencesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload Avatar
      .addCase(uploadAvatarThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatarThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.avatar) {
          state.profile.avatar = action.payload.avatar;
        }
      })
      .addCase(uploadAvatarThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setUserProfile,
  setUserPreferences,
  setLoading,
  setError,
  clearError,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;
