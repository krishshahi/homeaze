import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as paymentsApi from '../../services/paymentsApi';

// Async thunks for payment operations

// Process payment
export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async ({ paymentData, token }, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.processPayment(paymentData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get payment details
export const getPaymentDetails = createAsyncThunk(
  'payment/getPaymentDetails',
  async ({ paymentId, token }, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.getPaymentDetails(paymentId, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get payment history
export const getPaymentHistory = createAsyncThunk(
  'payment/getPaymentHistory',
  async ({ params, token }, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.getPaymentHistory(params, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Process refund
export const processRefund = createAsyncThunk(
  'payment/processRefund',
  async ({ paymentId, refundData, token }, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.processRefund(paymentId, refundData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get payment statistics
export const getPaymentStats = createAsyncThunk(
  'payment/getPaymentStats',
  async ({ period, token }, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.getPaymentStats(period, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create payment intent
export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async ({ intentData, token }, { rejectWithValue }) => {
    try {
      const response = await paymentsApi.createPaymentIntent(intentData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Payment processing
  currentPayment: null,
  paymentIntent: null,
  
  // Payment history
  payments: [],
  paymentHistory: {
    payments: [],
    pagination: {
      current: 1,
      pages: 1,
      total: 0
    }
  },
  
  // Payment statistics (for providers)
  stats: {
    totalRevenue: 0,
    totalTransactions: 0,
    averageAmount: 0,
    revenueTrend: []
  },
  
  // UI states
  loading: {
    processing: false,
    history: false,
    stats: false,
    refund: false,
    intent: false
  },
  
  error: {
    processing: null,
    history: null,
    stats: null,
    refund: null,
    intent: null
  },
  
  // Success messages
  successMessage: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    // Clear errors
    clearPaymentError: (state, action) => {
      const errorType = action.payload;
      if (errorType) {
        state.error[errorType] = null;
      } else {
        state.error = {
          processing: null,
          history: null,
          stats: null,
          refund: null,
          intent: null
        };
      }
    },
    
    // Clear success message
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    // Reset payment state
    resetPaymentState: (state) => {
      state.currentPayment = null;
      state.paymentIntent = null;
      state.successMessage = null;
      state.error = {
        processing: null,
        history: null,
        stats: null,
        refund: null,
        intent: null
      };
    },
    
    // Update payment status (for real-time updates)
    updatePaymentStatus: (state, action) => {
      const { paymentId, status } = action.payload;
      
      // Update in current payment
      if (state.currentPayment && state.currentPayment.paymentId === paymentId) {
        state.currentPayment.status = status;
      }
      
      // Update in payment history
      const paymentIndex = state.paymentHistory.payments.findIndex(
        payment => payment.paymentId === paymentId
      );
      if (paymentIndex !== -1) {
        state.paymentHistory.payments[paymentIndex].status = status;
      }
    },
  },
  
  extraReducers: (builder) => {
    // Process Payment
    builder
      .addCase(processPayment.pending, (state) => {
        state.loading.processing = true;
        state.error.processing = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading.processing = false;
        state.currentPayment = action.payload;
        state.successMessage = 'Payment processed successfully!';
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading.processing = false;
        state.error.processing = action.payload;
      });
      
    // Get Payment Details
    builder
      .addCase(getPaymentDetails.pending, (state) => {
        state.loading.processing = true;
        state.error.processing = null;
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.loading.processing = false;
        state.currentPayment = action.payload.payment;
      })
      .addCase(getPaymentDetails.rejected, (state, action) => {
        state.loading.processing = false;
        state.error.processing = action.payload;
      });
      
    // Get Payment History
    builder
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading.history = true;
        state.error.history = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading.history = false;
        state.paymentHistory = action.payload;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading.history = false;
        state.error.history = action.payload;
      });
      
    // Process Refund
    builder
      .addCase(processRefund.pending, (state) => {
        state.loading.refund = true;
        state.error.refund = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.loading.refund = false;
        state.successMessage = 'Refund processed successfully!';
        
        // Update payment status if it's a full refund
        const { paymentId, amount } = action.payload;
        if (state.currentPayment && state.currentPayment.paymentId === paymentId) {
          state.currentPayment.status = amount >= state.currentPayment.amount.gross ? 'refunded' : 'partially_refunded';
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.loading.refund = false;
        state.error.refund = action.payload;
      });
      
    // Get Payment Stats
    builder
      .addCase(getPaymentStats.pending, (state) => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(getPaymentStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload;
      });
      
    // Create Payment Intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading.intent = true;
        state.error.intent = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading.intent = false;
        state.paymentIntent = action.payload.paymentIntent;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading.intent = false;
        state.error.intent = action.payload;
      });
  },
});

export const {
  clearPaymentError,
  clearSuccessMessage,
  resetPaymentState,
  updatePaymentStatus,
} = paymentSlice.actions;

// Selectors
export const selectCurrentPayment = (state) => state.payment.currentPayment;
export const selectPaymentHistory = (state) => state.payment.paymentHistory;
export const selectPaymentStats = (state) => state.payment.stats;
export const selectPaymentIntent = (state) => state.payment.paymentIntent;
export const selectPaymentLoading = (state) => state.payment.loading;
export const selectPaymentError = (state) => state.payment.error;
export const selectPaymentSuccessMessage = (state) => state.payment.successMessage;

export default paymentSlice.reducer;
