import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ServicesAPI from '../../services/servicesApi';

const initialState = {
  services: [],
  categories: [
    { id: '1', title: 'Cleaning', icon: '🧹', color: '#1E88E5' },
    { id: '2', title: 'Repairs', icon: '🔧', color: '#FF6B35' },
    { id: '3', title: 'Garden', icon: '🌱', color: '#4CAF50' },
    { id: '4', title: 'Electric', icon: '⚡', color: '#FF9800' },
  ],
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
      // Fallback to mock data if API fails
      return mockServices;
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
      // Fallback to mock data if API fails
      return mockServices.filter(service => service.featured);
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
      // Return existing categories as fallback
      return [
        { id: '1', title: 'Cleaning', icon: '🧹', color: '#1E88E5' },
        { id: '2', title: 'Repairs', icon: '🔧', color: '#FF6B35' },
        { id: '3', title: 'Garden', icon: '🌱', color: '#4CAF50' },
        { id: '4', title: 'Electric', icon: '⚡', color: '#FF9800' },
      ];
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
      // Fallback to local search in mock data
      const filteredServices = mockServices.filter(service => 
        service.title.toLowerCase().includes(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase())
      );
      return filteredServices;
    }
  }
);

// Mock services data
const mockServices = [
  {
    id: '1',
    title: 'House Cleaning',
    icon: '🧹',
    description: 'Professional cleaning services for your home',
    rating: 4.8,
    startingPrice: 50,
    featured: true,
    category: 'cleaning',
    provider: {
      id: 'p1',
      name: 'CleanPro Services',
      avatar: null,
      rating: 4.9,
      reviewCount: 156,
    },
    images: [],
    services: ['Deep cleaning', 'Regular cleaning', 'Move-in/out cleaning'],
    availability: 'Available today',
  },
  {
    id: '2',
    title: 'Plumbing',
    icon: '🔧',
    description: 'Expert plumbing repairs and installations',
    rating: 4.7,
    startingPrice: 80,
    featured: false,
    category: 'repairs',
    provider: {
      id: 'p2',
      name: 'FixIt Plumbing',
      avatar: null,
      rating: 4.8,
      reviewCount: 89,
    },
    images: [],
    services: ['Leak repair', 'Pipe installation', 'Drain cleaning'],
    availability: 'Available tomorrow',
  },
  {
    id: '3',
    title: 'Electrical',
    icon: '⚡',
    description: 'Licensed electricians for all electrical needs',
    rating: 4.9,
    startingPrice: 90,
    featured: true,
    category: 'electric',
    provider: {
      id: 'p3',
      name: 'PowerUp Electric',
      avatar: null,
      rating: 4.9,
      reviewCount: 234,
    },
    images: [],
    services: ['Wiring', 'Outlet installation', 'Circuit breaker repair'],
    availability: 'Available today',
  },
  {
    id: '4',
    title: 'Gardening',
    icon: '🌱',
    description: 'Lawn care and garden maintenance',
    rating: 4.6,
    startingPrice: 40,
    featured: false,
    category: 'garden',
    provider: {
      id: 'p4',
      name: 'Green Thumb Gardens',
      avatar: null,
      rating: 4.7,
      reviewCount: 67,
    },
    images: [],
    services: ['Lawn mowing', 'Tree trimming', 'Garden design'],
    availability: 'Available this week',
  },
];

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
    // Initialize with mock data (deprecated - use fetchServices instead)
    initializeServices(state) {
      state.services = mockServices;
      state.featuredServices = mockServices.filter(service => service.featured);
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch Services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = Array.isArray(action.payload) ? action.payload : action.payload.services || [];
        state.error = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        // Use mock data as fallback
        state.services = mockServices;
      })
      // Fetch Featured Services
      .addCase(fetchFeaturedServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedServices.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredServices = Array.isArray(action.payload) ? action.payload : action.payload.services || [];
        state.error = null;
      })
      .addCase(fetchFeaturedServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        // Use mock data as fallback
        state.featuredServices = mockServices.filter(service => service.featured);
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = Array.isArray(action.payload) ? action.payload : action.payload.categories || state.categories;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        // Keep existing categories as fallback
      })
      // Search Services
      .addCase(searchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = Array.isArray(action.payload) ? action.payload : action.payload.services || [];
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
  initializeServices,
} = servicesSlice.actions;

export default servicesSlice.reducer;
