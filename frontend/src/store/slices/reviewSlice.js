import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reviewsApi from '../../services/reviewsApi';

// Async thunks for review operations

// Create review
export const createReview = createAsyncThunk(
  'review/createReview',
  async ({ reviewData, token }, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.createReview(reviewData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get reviews
export const getReviews = createAsyncThunk(
  'review/getReviews',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.getReviews(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get review details
export const getReviewDetails = createAsyncThunk(
  'review/getReviewDetails',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.getReviewDetails(reviewId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update review
export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ reviewId, reviewData, token }, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.updateReview(reviewId, reviewData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Respond to review
export const respondToReview = createAsyncThunk(
  'review/respondToReview',
  async ({ reviewId, responseData, token }, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.respondToReview(reviewId, responseData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Toggle review helpfulness
export const toggleReviewHelpfulness = createAsyncThunk(
  'review/toggleHelpfulness',
  async ({ reviewId, helpfulData, token }, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.toggleReviewHelpfulness(reviewId, helpfulData, token);
      return { reviewId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Flag review
export const flagReview = createAsyncThunk(
  'review/flagReview',
  async ({ reviewId, flagData, token }, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.flagReview(reviewId, flagData, token);
      return { reviewId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get trending reviews
export const getTrendingReviews = createAsyncThunk(
  'review/getTrendingReviews',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.getTrendingReviews(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get my reviews
export const getMyReviews = createAsyncThunk(
  'review/getMyReviews',
  async ({ params, token }, { rejectWithValue }) => {
    try {
      const response = await reviewsApi.getMyReviews(params, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Reviews data
  reviews: [],
  currentReview: null,
  trendingReviews: [],
  myReviews: {
    reviews: [],
    type: 'written',
    pagination: {
      current: 1,
      pages: 1,
      total: 0
    }
  },
  
  // Review statistics
  statistics: {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {}
  },
  
  // Pagination
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  },
  
  // Filters
  filters: {
    providerId: null,
    serviceId: null,
    rating: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    verified: null
  },
  
  // UI states
  loading: {
    reviews: false,
    creating: false,
    updating: false,
    responding: false,
    flagging: false,
    trending: false,
    myReviews: false
  },
  
  error: {
    reviews: null,
    creating: null,
    updating: null,
    responding: null,
    flagging: null,
    trending: null,
    myReviews: null
  },
  
  // Success messages
  successMessage: null,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    // Clear errors
    clearReviewError: (state, action) => {
      const errorType = action.payload;
      if (errorType) {
        state.error[errorType] = null;
      } else {
        state.error = {
          reviews: null,
          creating: null,
          updating: null,
          responding: null,
          flagging: null,
          trending: null,
          myReviews: null
        };
      }
    },
    
    // Clear success message
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Set filters
    setReviewFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset filters
    resetReviewFilters: (state) => {
      state.filters = {
        providerId: null,
        serviceId: null,
        rating: null,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        verified: null
      };
    },
    
    // Clear current review
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    
    // Update review in list (for real-time updates)
    updateReviewInList: (state, action) => {
      const updatedReview = action.payload;
      const reviewIndex = state.reviews.findIndex(
        review => review._id === updatedReview._id
      );
      
      if (reviewIndex !== -1) {
        state.reviews[reviewIndex] = updatedReview;
      }
    },
    
    // Add new review to list
    addReviewToList: (state, action) => {
      state.reviews.unshift(action.payload);
      state.statistics.totalReviews += 1;
    },
  },
  
  extraReducers: (builder) => {
    // Create Review
    builder
      .addCase(createReview.pending, (state) => {
        state.loading.creating = true;
        state.error.creating = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.successMessage = 'Review created successfully!';
        state.reviews.unshift(action.payload.review);
        state.statistics.totalReviews += 1;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading.creating = false;
        state.error.creating = action.payload;
      });
      
    // Get Reviews
    builder
      .addCase(getReviews.pending, (state) => {
        state.loading.reviews = true;
        state.error.reviews = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.loading.reviews = false;
        state.reviews = action.payload.reviews;
        state.statistics = action.payload.statistics;
        state.pagination = action.payload.pagination;
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.loading.reviews = false;
        state.error.reviews = action.payload;
      });
      
    // Get Review Details
    builder
      .addCase(getReviewDetails.pending, (state) => {
        state.loading.reviews = true;
        state.error.reviews = null;
      })
      .addCase(getReviewDetails.fulfilled, (state, action) => {
        state.loading.reviews = false;
        state.currentReview = action.payload.review;
      })
      .addCase(getReviewDetails.rejected, (state, action) => {
        state.loading.reviews = false;
        state.error.reviews = action.payload;
      });
      
    // Update Review
    builder
      .addCase(updateReview.pending, (state) => {
        state.loading.updating = true;
        state.error.updating = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading.updating = false;
        state.successMessage = 'Review updated successfully!';
        
        const updatedReview = action.payload.review;
        const reviewIndex = state.reviews.findIndex(
          review => review._id === updatedReview._id
        );
        
        if (reviewIndex !== -1) {
          state.reviews[reviewIndex] = updatedReview;
        }
        
        if (state.currentReview && state.currentReview._id === updatedReview._id) {
          state.currentReview = updatedReview;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading.updating = false;
        state.error.updating = action.payload;
      });
      
    // Respond to Review
    builder
      .addCase(respondToReview.pending, (state) => {
        state.loading.responding = true;
        state.error.responding = null;
      })
      .addCase(respondToReview.fulfilled, (state, action) => {
        state.loading.responding = false;
        state.successMessage = 'Response added successfully!';
        
        const updatedReview = action.payload.review;
        const reviewIndex = state.reviews.findIndex(
          review => review._id === updatedReview._id
        );
        
        if (reviewIndex !== -1) {
          state.reviews[reviewIndex] = updatedReview;
        }
        
        if (state.currentReview && state.currentReview._id === updatedReview._id) {
          state.currentReview = updatedReview;
        }
      })
      .addCase(respondToReview.rejected, (state, action) => {
        state.loading.responding = false;
        state.error.responding = action.payload;
      });
      
    // Toggle Review Helpfulness
    builder
      .addCase(toggleReviewHelpfulness.pending, (state) => {
        // Don't show loading for this action as it should be instant
      })
      .addCase(toggleReviewHelpfulness.fulfilled, (state, action) => {
        const { reviewId, helpfulnessScore } = action.payload;
        
        // Update in reviews list
        const reviewIndex = state.reviews.findIndex(
          review => review._id === reviewId
        );
        if (reviewIndex !== -1) {
          state.reviews[reviewIndex].helpfulnessScore = helpfulnessScore;
        }
        
        // Update current review
        if (state.currentReview && state.currentReview._id === reviewId) {
          state.currentReview.helpfulnessScore = helpfulnessScore;
        }
      })
      .addCase(toggleReviewHelpfulness.rejected, (state, action) => {
        // Show error toast or handle silently
        console.error('Toggle helpfulness failed:', action.payload);
      });
      
    // Flag Review
    builder
      .addCase(flagReview.pending, (state) => {
        state.loading.flagging = true;
        state.error.flagging = null;
      })
      .addCase(flagReview.fulfilled, (state, action) => {
        state.loading.flagging = false;
        state.successMessage = 'Review flagged successfully. Thank you for your feedback!';
      })
      .addCase(flagReview.rejected, (state, action) => {
        state.loading.flagging = false;
        state.error.flagging = action.payload;
      });
      
    // Get Trending Reviews
    builder
      .addCase(getTrendingReviews.pending, (state) => {
        state.loading.trending = true;
        state.error.trending = null;
      })
      .addCase(getTrendingReviews.fulfilled, (state, action) => {
        state.loading.trending = false;
        state.trendingReviews = action.payload.reviews;
      })
      .addCase(getTrendingReviews.rejected, (state, action) => {
        state.loading.trending = false;
        state.error.trending = action.payload;
      });
      
    // Get My Reviews
    builder
      .addCase(getMyReviews.pending, (state) => {
        state.loading.myReviews = true;
        state.error.myReviews = null;
      })
      .addCase(getMyReviews.fulfilled, (state, action) => {
        state.loading.myReviews = false;
        state.myReviews = action.payload;
      })
      .addCase(getMyReviews.rejected, (state, action) => {
        state.loading.myReviews = false;
        state.error.myReviews = action.payload;
      });
  },
});

export const {
  clearReviewError,
  clearSuccessMessage,
  setReviewFilters,
  resetReviewFilters,
  clearCurrentReview,
  updateReviewInList,
  addReviewToList,
} = reviewSlice.actions;

// Selectors
export const selectReviews = (state) => state.review.reviews;
export const selectCurrentReview = (state) => state.review.currentReview;
export const selectTrendingReviews = (state) => state.review.trendingReviews;
export const selectMyReviews = (state) => state.review.myReviews;
export const selectReviewStatistics = (state) => state.review.statistics;
export const selectReviewPagination = (state) => state.review.pagination;
export const selectReviewFilters = (state) => state.review.filters;
export const selectReviewLoading = (state) => state.review.loading;
export const selectReviewError = (state) => state.review.error;
export const selectReviewSuccessMessage = (state) => state.review.successMessage;

export default reviewSlice.reducer;
