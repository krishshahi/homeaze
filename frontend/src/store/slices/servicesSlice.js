import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import ServicesAPI from '../../services/servicesApi';

const initialState = {
  services: [],
  categories: [],
  featuredServices: [],
  searchResults: [],
  filters: {
    category: null,
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    location: null,
  },
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching services from API with filters:', filters);
      const response = await ServicesAPI.getAllServices(filters);
      console.log('✅ Services fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      return rejectWithValue(error.message || 'Failed to fetch services');
    }
  }
);

export const fetchFeaturedServices = createAsyncThunk(
  'services/fetchFeaturedServices',
  async (limit = 10, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching featured services from API');
      const response = await ServicesAPI.getFeaturedServices(limit);
      console.log('✅ Featured services fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching featured services:', error);
      return rejectWithValue(error.message || 'Failed to fetch featured services');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'services/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching categories from API');
      const response = await ServicesAPI.getCategories();
      console.log('✅ Categories fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const searchServices = createAsyncThunk(
  'services/searchServices',
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      console.log('📡 Searching services:', { query, filters });
      const response = await ServicesAPI.searchServices(query, filters);
      console.log('✅ Service search completed:', response);
      return response;
    } catch (error) {
      console.error('❌ Error searching services:', error);
      return rejectWithValue(error.message || 'Failed to search services');
    }
  }
);

// Removed mock services data to keep project fully dynamic

// Helper to extract an array of services from various API shapes
const extractServicesArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.services)) return payload.services;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.services)) return payload.data.services;
  return [];
};

// Normalize a service object for the UI
const normalizeService = (s) => ({
  id: s.id || s._id,
  title: s.title || s.name || 'Service',
  description: s.description || s.details || '',
  category: s.category || s.categoryId || s.type || 'other',
  icon: s.icon || s.emoji || '🏠',
  startingPrice: s.startingPrice ?? s.price ?? s.pricing?.amount ?? s.basePrice ?? 0,
  price: s.price ?? s.pricing?.amount ?? s.basePrice ?? s.startingPrice ?? 0,
  rating: s.rating?.average ?? s.rating ?? s.averageRating ?? 0,
  featured: !!(s.featured || s.isFeatured),
  provider: s.provider || s.providerName || s.providerId?.providerProfile?.businessName || s.providerId?.name,
  availability: s.availability || s.schedule || null,
  tags: s.tags || s.labels || [],
  bookingsCount: s.bookingsCount || 0,
  createdAt: s.createdAt || null,
});

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices(state, action) {
      state.services = action.payload;
      state.loading = false;
    },
    setFeaturedServices(state, action) {
      state.featuredServices = action.payload;
    },
    setSearchResults(state, action) {
      state.searchResults = action.payload;
    },
    updateFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = initialState.filters;
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        const raw = extractServicesArray(action.payload);
        state.services = raw.map(normalizeService);
        state.error = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.services = [];
      })
      // Fetch Featured Services
      .addCase(fetchFeaturedServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedServices.fulfilled, (state, action) => {
        state.loading = false;
        const raw = extractServicesArray(action.payload);
        state.featuredServices = raw.map(normalizeService);
        state.error = null;
      })
      .addCase(fetchFeaturedServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.featuredServices = [];
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        const categories = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.categories || action.payload?.data?.categories || state.categories);
        state.categories = categories;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Search Services
      .addCase(searchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchServices.fulfilled, (state, action) => {
        state.loading = false;
        const raw = extractServicesArray(action.payload);
        state.searchResults = raw.map(normalizeService);
        state.error = null;
      })
      .addCase(searchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.searchResults = [];
      });
  },
});

export const {
  setServices,
  setFeaturedServices,
  setSearchResults,
  updateFilters,
  clearFilters,
  setLoading,
  setError,
  clearError,
} = servicesSlice.actions;

export default servicesSlice.reducer;
