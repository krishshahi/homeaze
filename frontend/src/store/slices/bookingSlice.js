import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BookingsAPI from '../../services/bookingsApi';

const initialState = {
  currentBooking: {
    service: null,
    provider: null,
    date: null,
    time: null,
    address: null,
    notes: '',
    totalPrice: 0,
  },
  bookings: [],
  bookingHistory: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching user bookings from API with filters:', filters);
      const response = await BookingsAPI.getUserBookings(filters);
      console.log('✅ Bookings fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      // Fallback to mock data if API fails
      return mockBookings;
    }
  }
);

export const createNewBooking = createAsyncThunk(
  'bookings/createNewBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      console.log('📡 Creating new booking:', bookingData);
      const response = await BookingsAPI.createBooking(bookingData);
      console.log('✅ Booking created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      return rejectWithValue(error.message || 'Failed to create booking');
    }
  }
);

export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async ({ bookingId, status }, { rejectWithValue }) => {
    try {
      console.log('📡 Updating booking status:', { bookingId, status });
      const response = await BookingsAPI.updateBookingStatus(bookingId, status);
      console.log('✅ Booking updated successfully:', response);
      return { bookingId, status, ...response };
    } catch (error) {
      console.error('❌ Error updating booking:', error);
      return rejectWithValue(error.message || 'Failed to update booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      console.log('📡 Cancelling booking:', { bookingId, reason });
      const response = await BookingsAPI.cancelBooking(bookingId, reason);
      console.log('✅ Booking cancelled successfully:', response);
      return { bookingId, ...response };
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      return rejectWithValue(error.message || 'Failed to cancel booking');
    }
  }
);

export const fetchBookingHistory = createAsyncThunk(
  'bookings/fetchBookingHistory',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching booking history from API with filters:', filters);
      const response = await BookingsAPI.getBookingHistory(filters);
      console.log('✅ Booking history fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching booking history:', error);
      // Fallback to completed bookings from mock data
      return mockBookings.filter(booking => booking.status === 'completed');
    }
  }
);

// Mock bookings data
const mockBookings = [
  {
    id: '1',
    serviceTitle: 'Deep House Cleaning',
    serviceIcon: '🧹',
    providerName: 'CleanPro Services',
    status: 'confirmed',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    totalCost: 120,
    location: '123 Main St, New York, NY',
    hasReview: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    serviceTitle: 'Plumbing Repair',
    serviceIcon: '🔧',
    providerName: 'FixIt Plumbing',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    totalCost: 85,
    location: '456 Oak Ave, Brooklyn, NY',
    hasReview: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    serviceTitle: 'Electrical Installation',
    serviceIcon: '⚡',
    providerName: 'PowerUp Electric',
    status: 'in-progress',
    scheduledDate: new Date().toISOString(), // Today
    totalCost: 250,
    location: '789 Pine St, Manhattan, NY',
    hasReview: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    serviceTitle: 'Garden Maintenance',
    serviceIcon: '🌱',
    providerName: 'Green Thumb Gardens',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    totalCost: 75,
    location: '321 Garden Ave, Queens, NY',
    hasReview: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    serviceTitle: 'HVAC Maintenance',
    serviceIcon: '❄️',
    providerName: 'Cool Air Services',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    totalCost: 150,
    location: '654 Climate St, Bronx, NY',
    hasReview: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCurrentBooking(state, action) {
      state.currentBooking = { ...state.currentBooking, ...action.payload };
    },
    clearCurrentBooking(state) {
      state.currentBooking = initialState.currentBooking;
    },
    addBooking(state, action) {
      const booking = {
        id: Date.now().toString(),
        ...action.payload,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      state.bookings.push(booking);
    },
    updateBookingStatus(state, action) {
      const { bookingId, status } = action.payload;
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = status;
        booking.updatedAt = new Date().toISOString();
      }
    },
    setBookings(state, action) {
      state.bookings = action.payload;
    },
    setBookingHistory(state, action) {
      state.bookingHistory = action.payload;
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
    // Initialize with mock data (deprecated - use fetchUserBookings instead)
    initializeBookings(state) {
      state.bookings = mockBookings;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch User Bookings
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = Array.isArray(action.payload) ? action.payload : action.payload.bookings || [];
        state.error = null;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        // Use mock data as fallback
        state.bookings = mockBookings;
      })
      // Create New Booking
      .addCase(createNewBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewBooking.fulfilled, (state, action) => {
        state.loading = false;
        const newBooking = action.payload;
        state.bookings.unshift(newBooking); // Add to beginning of array
        state.currentBooking = initialState.currentBooking; // Clear current booking
        state.error = null;
      })
      .addCase(createNewBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId, status } = action.payload;
        const booking = state.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = status;
          booking.updatedAt = new Date().toISOString();
        }
        state.error = null;
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const { bookingId } = action.payload;
        const booking = state.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = 'cancelled';
          booking.updatedAt = new Date().toISOString();
        }
        state.error = null;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Fetch Booking History
      .addCase(fetchBookingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingHistory = Array.isArray(action.payload) ? action.payload : action.payload.bookings || [];
        state.error = null;
      })
      .addCase(fetchBookingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        // Use mock data as fallback
        state.bookingHistory = mockBookings.filter(booking => booking.status === 'completed');
      });
  },
});

export const {
  setCurrentBooking,
  clearCurrentBooking,
  addBooking,
  updateBookingStatus,
  setBookings,
  setBookingHistory,
  setLoading,
  setError,
  clearError,
  initializeBookings,
} = bookingSlice.actions;

export default bookingSlice.reducer;
