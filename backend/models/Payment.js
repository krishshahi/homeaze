const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    unique: true,
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    gross: {
      type: Number,
      required: true,
      min: 0
    },
    fees: {
      platform: Number,
      payment: Number,
      total: Number
    },
    net: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'wallet'],
      required: true
    },
    details: {
      cardLastFour: String,
      cardBrand: String,
      paypalEmail: String,
      bankName: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refund'],
    default: 'pending'
  },
  transactionIds: {
    gateway: String, // Stripe payment intent ID, PayPal transaction ID, etc.
    internal: String, // Our internal transaction ID
    reference: String // Customer reference number
  },
  timestamps: {
    initiated: {
      type: Date,
      default: Date.now
    },
    completed: Date,
    failed: Date,
    refunded: Date
  },
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundId: String,
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  gatewayResponse: {
    raw: mongoose.Schema.Types.Mixed, // Store raw gateway response
    errorCode: String,
    errorMessage: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  invoice: {
    invoiceNumber: String,
    invoiceUrl: String,
    generated: Date
  },
  splits: [{
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    percentage: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    transferId: String,
    transferredAt: Date
  }],
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    disputeId: String,
    reason: String,
    status: String,
    disputedAt: Date,
    resolvedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ customerId: 1, status: 1 });
paymentSchema.index({ providerId: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ 'transactionIds.gateway': 1 });

// Pre-save middleware to generate payment ID
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.paymentId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.paymentId = `PAY-${timestamp.slice(-8)}-${random}`;
  }
  this.updatedAt = new Date();
  next();
});

// Method to calculate platform fees
paymentSchema.methods.calculateFees = function() {
  const grossAmount = this.amount.gross;
  const platformFeeRate = 0.05; // 5% platform fee
  const paymentFeeRate = 0.029; // 2.9% payment processing fee
  
  const platformFee = grossAmount * platformFeeRate;
  const paymentFee = grossAmount * paymentFeeRate + 0.30; // $0.30 fixed fee
  const totalFees = platformFee + paymentFee;
  const netAmount = grossAmount - totalFees;
  
  this.amount.fees = {
    platform: Math.round(platformFee * 100) / 100,
    payment: Math.round(paymentFee * 100) / 100,
    total: Math.round(totalFees * 100) / 100
  };
  this.amount.net = Math.round(netAmount * 100) / 100;
  
  return this.amount.fees;
};

// Method to process refund
paymentSchema.methods.processRefund = function(refundAmount, reason, initiatedBy) {
  this.refund = {
    amount: refundAmount,
    reason,
    refundedAt: new Date(),
    initiatedBy
  };
  
  if (refundAmount >= this.amount.gross) {
    this.status = 'refunded';
  } else {
    this.status = 'partial_refund';
  }
  
  return this.save();
};

// Method to update payment status
paymentSchema.methods.updateStatus = function(newStatus, gatewayResponse = null) {
  this.status = newStatus;
  this.updatedAt = new Date();
  
  if (gatewayResponse) {
    this.gatewayResponse = gatewayResponse;
  }
  
  // Update timestamps based on status
  switch (newStatus) {
    case 'completed':
      this.timestamps.completed = new Date();
      break;
    case 'failed':
      this.timestamps.failed = new Date();
      break;
    case 'refunded':
      this.timestamps.refunded = new Date();
      break;
  }
  
  return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = function(providerId, period = 'month') {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return this.aggregate([
    {
      $match: {
        providerId: new mongoose.Types.ObjectId(providerId),
        status: 'completed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount.net' },
        totalTransactions: { $sum: 1 },
        averageAmount: { $avg: '$amount.gross' }
      }
    }
  ]);
};

// Static method to get monthly revenue trend
paymentSchema.statics.getRevenueTrend = function(providerId, months = 6) {
  const now = new Date();
  const startDate = new Date();
  startDate.setMonth(now.getMonth() - months);
  
  return this.aggregate([
    {
      $match: {
        providerId: new mongoose.Types.ObjectId(providerId),
        status: 'completed',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$amount.net' },
        transactions: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
