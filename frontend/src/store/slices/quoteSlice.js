// Quote Redux Slice - State Management for Quote System
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import * as quotesApi from '../../services/quotesApi';

// Async thunks for API calls
export const fetchUserQuotes = createAsyncThunk(
  'quotes/fetchUserQuotes',
  async ({ params, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.getUserQuotes(params, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createQuote = createAsyncThunk(
  'quotes/createQuote',
  async ({ quoteData, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.createQuote(quoteData, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuoteDetails = createAsyncThunk(
  'quotes/fetchQuoteDetails',
  async ({ quoteId, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.getQuoteDetails(quoteId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuoteStatus = createAsyncThunk(
  'quotes/updateQuoteStatus',
  async ({ quoteId, status, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.updateQuoteStatus(quoteId, status, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { quoteId, status, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptQuote = createAsyncThunk(
  'quotes/acceptQuote',
  async ({ quoteId, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.acceptQuote(quoteId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { quoteId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectQuote = createAsyncThunk(
  'quotes/rejectQuote',
  async ({ quoteId, reason, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.rejectQuote(quoteId, reason, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { quoteId, reason, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuote = createAsyncThunk(
  'quotes/updateQuote',
  async ({ quoteId, updateData, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.updateQuote(quoteId, updateData, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { quoteId, updateData, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addQuoteNote = createAsyncThunk(
  'quotes/addQuoteNote',
  async ({ quoteId, noteData, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.addQuoteNote(quoteId, noteData, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { quoteId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuoteTimeline = createAsyncThunk(
  'quotes/fetchQuoteTimeline',
  async ({ quoteId, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.getQuoteTimeline(quoteId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { quoteId, timeline: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuoteAnalytics = createAsyncThunk(
  'quotes/fetchQuoteAnalytics',
  async ({ params, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.getQuoteAnalytics(params, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchQuotes = createAsyncThunk(
  'quotes/searchQuotes',
  async ({ searchParams, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.searchQuotes(searchParams, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const convertQuoteToBooking = createAsyncThunk(
  'quotes/convertQuoteToBooking',
  async ({ quoteId, bookingData, token }, { rejectWithValue }) => {
    try {
      const response = await quotesApi.convertQuoteToBooking(quoteId, bookingData, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { quoteId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Quote lists
  quotes: [],
  totalQuotes: 0,
  quotePagination: {
    page: 1,
    limit: 10,
    totalPages: 1
  },

  // Search results
  searchResults: [],
  searchPagination: {
    page: 1,
    limit: 10,
    totalPages: 1
  },

  // Current quote details
  currentQuote: null,
  quoteTimeline: {},

  // Analytics
  analytics: {
    totalQuotes: 0,
    pendingQuotes: 0,
    acceptedQuotes: 0,
    rejectedQuotes: 0,
    averageQuoteValue: 0,
    conversionRate: 0,
    responseTime: 0,
    monthlyStats: []
  },

  // UI state
  loading: {
    quotes: false,
    details: false,
    create: false,
    update: false,
    search: false,
    analytics: false,
    timeline: false
  },

  // Error state
  error: {
    quotes: null,
    details: null,
    create: null,
    update: null,
    search: null,
    analytics: null,
    timeline: null
  },

  // Filters and sorting
  filters: {
    status: 'all',
    dateRange: 'all',
    serviceType: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

const quoteSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    // Clear quote errors
    clearQuoteErrors: (state) => {
      state.error = {
        quotes: null,
        details: null,
        create: null,
        update: null,
        search: null,
        analytics: null,
        timeline: null
      };
    },

    // Set quote filters
    setQuoteFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = {
        page: 1,
        limit: 10,
        totalPages: 1
      };
    },

    // Set current quote
    setCurrentQuote: (state, action) => {
      state.currentQuote = action.payload;
    },

    // Clear current quote
    clearCurrentQuote: (state) => {
      state.currentQuote = null;
      state.quoteTimeline = {};
    },

    // Update quote in list
    updateQuoteInList: (state, action) => {
      const { quoteId, updates } = action.payload;
      const index = state.quotes.findIndex(quote => quote.id === quoteId);
      if (index !== -1) {
        state.quotes[index] = { ...state.quotes[index], ...updates };
      }
    },

    // Remove quote from list
    removeQuoteFromList: (state, action) => {
      const quoteId = action.payload;
      state.quotes = state.quotes.filter(quote => quote.id !== quoteId);
      state.totalQuotes = Math.max(0, state.totalQuotes - 1);
    },

    // Reset quote state
    resetQuoteState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    // Fetch user quotes
    builder
      .addCase(fetchUserQuotes.pending, (state) => {
        state.loading.quotes = true;
        state.error.quotes = null;
      })
      .addCase(fetchUserQuotes.fulfilled, (state, action) => {
        state.loading.quotes = false;
        state.quotes = action.payload.data;
        state.totalQuotes = action.payload.total;
        if (action.payload.pagination) {
          state.quotePagination = action.payload.pagination;
        }
      })
      .addCase(fetchUserQuotes.rejected, (state, action) => {
        state.loading.quotes = false;
        state.error.quotes = action.payload;
      });

    // Create quote
    builder
      .addCase(createQuote.pending, (state) => {
        state.loading.create = true;
        state.error.create = null;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.loading.create = false;
        state.quotes.unshift(action.payload.data);
        state.totalQuotes += 1;
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.loading.create = false;
        state.error.create = action.payload;
      });

    // Fetch quote details
    builder
      .addCase(fetchQuoteDetails.pending, (state) => {
        state.loading.details = true;
        state.error.details = null;
      })
      .addCase(fetchQuoteDetails.fulfilled, (state, action) => {
        state.loading.details = false;
        state.currentQuote = action.payload.data;
      })
      .addCase(fetchQuoteDetails.rejected, (state, action) => {
        state.loading.details = false;
        state.error.details = action.payload;
      });

    // Update quote status
    builder
      .addCase(updateQuoteStatus.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
      })
      .addCase(updateQuoteStatus.fulfilled, (state, action) => {
        state.loading.update = false;
        const { quoteId, status } = action.payload;
        
        // Update in quotes list
        const index = state.quotes.findIndex(quote => quote.id === quoteId);
        if (index !== -1) {
          state.quotes[index].status = status;
          state.quotes[index].updatedAt = new Date().toISOString();
        }
        
        // Update current quote if it matches
        if (state.currentQuote && state.currentQuote.id === quoteId) {
          state.currentQuote.status = status;
          state.currentQuote.updatedAt = new Date().toISOString();
        }
      })
      .addCase(updateQuoteStatus.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload;
      });

    // Accept quote
    builder
      .addCase(acceptQuote.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
      })
      .addCase(acceptQuote.fulfilled, (state, action) => {
        state.loading.update = false;
        const { quoteId } = action.payload;
        
        // Update quote status to accepted
        const index = state.quotes.findIndex(quote => quote.id === quoteId);
        if (index !== -1) {
          state.quotes[index].status = 'accepted';
          state.quotes[index].acceptedAt = new Date().toISOString();
          state.quotes[index].updatedAt = new Date().toISOString();
        }
        
        if (state.currentQuote && state.currentQuote.id === quoteId) {
          state.currentQuote.status = 'accepted';
          state.currentQuote.acceptedAt = new Date().toISOString();
          state.currentQuote.updatedAt = new Date().toISOString();
        }
      })
      .addCase(acceptQuote.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload;
      });

    // Reject quote
    builder
      .addCase(rejectQuote.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
      })
      .addCase(rejectQuote.fulfilled, (state, action) => {
        state.loading.update = false;
        const { quoteId, reason } = action.payload;
        
        // Update quote status to rejected
        const index = state.quotes.findIndex(quote => quote.id === quoteId);
        if (index !== -1) {
          state.quotes[index].status = 'rejected';
          state.quotes[index].rejectedAt = new Date().toISOString();
          state.quotes[index].rejectionReason = reason;
          state.quotes[index].updatedAt = new Date().toISOString();
        }
        
        if (state.currentQuote && state.currentQuote.id === quoteId) {
          state.currentQuote.status = 'rejected';
          state.currentQuote.rejectedAt = new Date().toISOString();
          state.currentQuote.rejectionReason = reason;
          state.currentQuote.updatedAt = new Date().toISOString();
        }
      })
      .addCase(rejectQuote.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload;
      });

    // Update quote
    builder
      .addCase(updateQuote.fulfilled, (state, action) => {
        const { quoteId, updateData } = action.payload;
        
        // Update in quotes list
        const index = state.quotes.findIndex(quote => quote.id === quoteId);
        if (index !== -1) {
          state.quotes[index] = { ...state.quotes[index], ...updateData, updatedAt: new Date().toISOString() };
        }
        
        // Update current quote if it matches
        if (state.currentQuote && state.currentQuote.id === quoteId) {
          state.currentQuote = { ...state.currentQuote, ...updateData, updatedAt: new Date().toISOString() };
        }
      });

    // Fetch quote timeline
    builder
      .addCase(fetchQuoteTimeline.pending, (state) => {
        state.loading.timeline = true;
        state.error.timeline = null;
      })
      .addCase(fetchQuoteTimeline.fulfilled, (state, action) => {
        state.loading.timeline = false;
        const { quoteId, timeline } = action.payload;
        state.quoteTimeline[quoteId] = timeline;
      })
      .addCase(fetchQuoteTimeline.rejected, (state, action) => {
        state.loading.timeline = false;
        state.error.timeline = action.payload;
      });

    // Fetch quote analytics
    builder
      .addCase(fetchQuoteAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.error.analytics = null;
      })
      .addCase(fetchQuoteAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.analytics = action.payload.data;
      })
      .addCase(fetchQuoteAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.error.analytics = action.payload;
      });

    // Search quotes
    builder
      .addCase(searchQuotes.pending, (state) => {
        state.loading.search = true;
        state.error.search = null;
      })
      .addCase(searchQuotes.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults = action.payload.data;
        if (action.payload.pagination) {
          state.searchPagination = action.payload.pagination;
        }
      })
      .addCase(searchQuotes.rejected, (state, action) => {
        state.loading.search = false;
        state.error.search = action.payload;
      });

    // Convert quote to booking
    builder
      .addCase(convertQuoteToBooking.fulfilled, (state, action) => {
        const { quoteId } = action.payload;
        
        // Update quote status to converted
        const index = state.quotes.findIndex(quote => quote.id === quoteId);
        if (index !== -1) {
          state.quotes[index].status = 'converted';
          state.quotes[index].convertedAt = new Date().toISOString();
          state.quotes[index].updatedAt = new Date().toISOString();
        }
        
        if (state.currentQuote && state.currentQuote.id === quoteId) {
          state.currentQuote.status = 'converted';
          state.currentQuote.convertedAt = new Date().toISOString();
          state.currentQuote.updatedAt = new Date().toISOString();
        }
      });
  }
});

export const {
  clearQuoteErrors,
  setQuoteFilters,
  clearSearchResults,
  setCurrentQuote,
  clearCurrentQuote,
  updateQuoteInList,
  removeQuoteFromList,
  resetQuoteState
} = quoteSlice.actions;

export default quoteSlice.reducer;
