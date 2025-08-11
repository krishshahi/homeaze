const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true
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
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceDetails: {
    title: String,
    description: String,
    category: String
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    start: String, // Format: "HH:MM"
    end: String,
    timeZone: String
  },
  status: {
    type: String,
    enum: [
      'pending',      // Awaiting provider confirmation
      'confirmed',    // Provider accepted
      'in-progress',  // Service is being performed
      'completed',    // Service completed
      'cancelled',    // Cancelled by customer or provider
      'no-show',      // Customer didn't show up
      'rescheduled'   // Booking was rescheduled
    ],
    default: 'pending'
  },
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      apartment: String,
      instructions: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  serviceRequirements: {
    description: String,
    materials: [String],
    specialInstructions: String,
    images: [String]
  },
  pricing: {
    estimatedCost: Number,
    finalCost: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    breakdown: [{
      item: String,
      cost: Number,
      quantity: Number
    }],
    discount: {
      amount: Number,
      reason: String
    },
    taxes: {
      amount: Number,
      percentage: Number
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  communication: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'status_update', 'system_notification'],
      default: 'message'
    },
    attachments: [String]
  }],
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  completion: {
    completedAt: Date,
    workPerformed: String,
    beforeImages: [String],
    afterImages: [String],
    materialUsed: [{
      item: String,
      quantity: Number,
      cost: Number
    }],
    additionalNotes: String,
    customerSignature: String,
    providerNotes: String
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    reviewDate: Date,
    response: {
      comment: String,
      responseDate: Date
    }
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    cancelledAt: Date,
    refundEligible: {
      type: Boolean,
      default: false
    }
  },
  rescheduling: {
    previousDate: Date,
    previousTime: {
      start: String,
      end: String
    },
    reason: String,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescheduledAt: Date
  },
  emergency: {
    type: Boolean,
    default: false
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly']
    },
    endDate: Date,
    parentBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
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
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ status: 1, scheduledDate: 1 });

// Pre-save middleware to generate booking number
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingNumber = `HMZ-${timestamp.slice(-8)}-${random}`;
  }
  this.updatedAt = new Date();
  next();
});

// Method to add timeline entry
bookingSchema.methods.addTimelineEntry = function(status, note, updatedBy) {
  this.timeline.push({
    status,
    note,
    updatedBy,
    timestamp: new Date()
  });
  this.status = status;
  return this.save();
};

// Method to add communication message
bookingSchema.methods.addMessage = function(senderId, message, type = 'message', attachments = []) {
  this.communication.push({
    senderId,
    message,
    type,
    attachments,
    timestamp: new Date()
  });
  return this.save();
};

// Method to calculate total cost
bookingSchema.methods.calculateTotalCost = function() {
  let total = this.pricing.finalCost || this.pricing.estimatedCost || 0;
  
  if (this.pricing.discount?.amount) {
    total -= this.pricing.discount.amount;
  }
  
  if (this.pricing.taxes?.amount) {
    total += this.pricing.taxes.amount;
  }
  
  return Math.max(0, total);
};

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const scheduledDateTime = new Date(this.scheduledDate);
  const hoursUntilService = (scheduledDateTime - now) / (1000 * 60 * 60);
  
  return ['pending', 'confirmed'].includes(this.status) && hoursUntilService > 24;
};

// Method to check if booking can be rescheduled
bookingSchema.methods.canBeRescheduled = function() {
  const now = new Date();
  const scheduledDateTime = new Date(this.scheduledDate);
  const hoursUntilService = (scheduledDateTime - now) / (1000 * 60 * 60);
  
  return ['pending', 'confirmed'].includes(this.status) && hoursUntilService > 48;
};

// Static method to get booking statistics
bookingSchema.statics.getStatistics = function(providerId, period = 'month') {
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
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.finalCost' }
      }
    }
  ]);
};

// Static method to find available time slots
bookingSchema.statics.findAvailableSlots = function(providerId, date, duration = 2) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    providerId,
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['confirmed', 'in-progress'] }
  }).select('scheduledTime scheduledDate');
};

module.exports = mongoose.model('Booking', bookingSchema);
