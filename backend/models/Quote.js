const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  // Basic Quote Information
  quoteNumber: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },

  // Parties Involved
  customer: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    contactInfo: {
      name: String,
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: [Number] // [longitude, latitude]
      }
    }
  },
  serviceProvider: {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      required: true
    },
    businessName: String,
    contactInfo: {
      name: String,
      email: String,
      phone: String
    }
  },

  // Service Details
  serviceDetails: {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    serviceName: String,
    serviceDescription: String,
    urgency: {
      type: String,
      enum: ['low', 'normal', 'high', 'emergency'],
      default: 'normal'
    },
    complexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex', 'expert_level'],
      default: 'moderate'
    }
  },

  // Location Information
  serviceLocation: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      apartmentUnit: String,
      accessInstructions: String
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    locationType: {
      type: String,
      enum: ['residential', 'commercial', 'industrial', 'outdoor'],
      default: 'residential'
    },
    accessibility: {
      parkingAvailable: { type: Boolean, default: true },
      stairsRequired: { type: Boolean, default: false },
      elevatorAvailable: { type: Boolean, default: false },
      specialAccess: String
    }
  },

  // Pricing Breakdown
  pricing: {
    basePrice: {
      amount: { type: Number, required: true, min: 0 },
      description: String
    },
    laborCosts: [{
      description: String,
      hours: Number,
      hourlyRate: Number,
      totalAmount: Number
    }],
    materials: [{
      name: { type: String, required: true },
      description: String,
      quantity: { type: Number, required: true, min: 0 },
      unitPrice: { type: Number, required: true, min: 0 },
      totalPrice: { type: Number, required: true, min: 0 },
      supplier: String,
      brand: String,
      model: String,
      warranty: String
    }],
    additionalFees: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      description: String,
      isOptional: { type: Boolean, default: false }
    }],
    discounts: [{
      name: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
      },
      value: Number,
      amount: Number,
      reason: String,
      conditions: String
    }],
    taxes: [{
      name: String,
      rate: Number, // percentage
      amount: Number,
      description: String
    }],
    subtotal: { type: Number, required: true, min: 0 },
    totalDiscounts: { type: Number, default: 0 },
    totalTaxes: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' }
  },

  // Timeline and Scheduling
  timeline: {
    estimatedDuration: {
      value: Number,
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks'],
        default: 'hours'
      }
    },
    preferredStartDate: Date,
    preferredEndDate: Date,
    flexibility: {
      type: String,
      enum: ['fixed', 'flexible', 'very_flexible'],
      default: 'flexible'
    },
    availableTimeSlots: [{
      date: Date,
      startTime: String,
      endTime: String,
      isPreferred: { type: Boolean, default: false }
    }],
    milestones: [{
      name: String,
      description: String,
      estimatedDate: Date,
      paymentPercentage: Number
    }]
  },

  // Terms and Conditions
  terms: {
    validUntil: {
      type: Date,
      required: true
    },
    paymentTerms: {
      type: String,
      enum: ['upfront', 'on_completion', '50_50', 'milestone_based', 'net_30'],
      default: 'on_completion'
    },
    paymentMethods: [{
      type: String,
      enum: ['cash', 'check', 'card', 'bank_transfer', 'financing']
    }],
    warrantyPeriod: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'months', 'years'],
        default: 'months'
      }
    },
    cancellationPolicy: String,
    liability: String,
    specialConditions: [String],
    includedServices: [String],
    excludedServices: [String],
    requiresPermits: { type: Boolean, default: false },
    permitResponsibility: {
      type: String,
      enum: ['customer', 'provider', 'shared'],
      default: 'provider'
    }
  },

  // Status and Workflow
  status: {
    type: String,
    enum: [
      'draft',
      'sent',
      'viewed',
      'under_review',
      'negotiating',
      'revised',
      'accepted',
      'rejected',
      'expired',
      'cancelled',
      'converted_to_booking'
    ],
    default: 'draft'
  },
  workflow: {
    sentDate: Date,
    viewedDate: Date,
    respondedDate: Date,
    acceptedDate: Date,
    rejectedDate: Date,
    expiredDate: Date,
    lastModified: { type: Date, default: Date.now },
    revisionHistory: [{
      version: Number,
      changes: String,
      modifiedBy: String,
      modifiedDate: { type: Date, default: Date.now },
      reason: String
    }]
  },

  // Customer Response
  customerResponse: {
    response: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'counter_offer', 'needs_revision']
    },
    message: String,
    counterOffer: {
      proposedPrice: Number,
      proposedTimeline: String,
      modifications: String,
      conditions: [String]
    },
    requestedChanges: [{
      section: String,
      currentValue: String,
      requestedValue: String,
      reason: String
    }],
    questions: [{
      question: String,
      answer: String,
      answeredDate: Date
    }]
  },

  // Communication
  communications: [{
    from: {
      type: String,
      enum: ['customer', 'provider'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'revision_request', 'clarification', 'acceptance', 'rejection'],
      default: 'message'
    },
    attachments: [String]
  }],

  // Attachments and Documents
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['image', 'document', 'video', 'audio', 'other']
    },
    size: Number,
    uploadedBy: String,
    uploadedDate: { type: Date, default: Date.now },
    description: String
  }],

  // Analytics and Metrics
  analytics: {
    viewCount: { type: Number, default: 0 },
    timeToView: Number, // milliseconds from sent to first view
    timeToRespond: Number, // milliseconds from sent to response
    revisionCount: { type: Number, default: 0 },
    competitorQuotes: [{
      providerId: String,
      estimatedPrice: Number,
      notes: String
    }],
    conversionProbability: Number, // 0-100 percentage
    winReason: String, // if accepted
    lossReason: String // if rejected
  },

  // Related Records
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  originalQuote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  }, // For revised quotes
  
  // Internal Notes
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedDate: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: true }
  }],

  // Competitive Analysis
  competitive: {
    marketPrice: {
      low: Number,
      average: Number,
      high: Number
    },
    positionVsMarket: {
      type: String,
      enum: ['below_market', 'at_market', 'above_market', 'premium']
    },
    competitiveAdvantages: [String],
    priceJustification: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
quoteSchema.index({ quoteNumber: 1 });
quoteSchema.index({ 'customer.userId': 1, status: 1 });
quoteSchema.index({ 'serviceProvider.providerId': 1, status: 1 });
quoteSchema.index({ 'serviceDetails.serviceId': 1 });
quoteSchema.index({ status: 1, 'terms.validUntil': 1 });
quoteSchema.index({ 'serviceLocation.coordinates': '2dsphere' });
quoteSchema.index({ createdAt: -1 });
quoteSchema.index({ 'terms.validUntil': 1 }, { expireAfterSeconds: 0 }); // Auto-expire

// Virtual for days until expiration
quoteSchema.virtual('daysUntilExpiration').get(function() {
  if (!this.terms.validUntil) return null;
  const now = new Date();
  const expiry = new Date(this.terms.validUntil);
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for age of quote
quoteSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for profit margin
quoteSchema.virtual('profitMargin').get(function() {
  const costs = this.pricing.materials.reduce((total, material) => total + material.totalPrice, 0);
  const laborCosts = this.pricing.laborCosts.reduce((total, labor) => total + labor.totalAmount, 0);
  const totalCosts = costs + laborCosts;
  const revenue = this.pricing.finalTotal;
  
  if (revenue === 0) return 0;
  return ((revenue - totalCosts) / revenue) * 100;
});

// Pre-save middleware
quoteSchema.pre('save', function(next) {
  // Generate quote number if not provided
  if (!this.quoteNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.quoteNumber = `QT-${year}${month}${day}-${random}`;
  }
  
  // Calculate totals
  this.calculateTotals();
  
  // Update workflow dates based on status
  this.updateWorkflowDates();
  
  // Set expiry date if not provided
  if (!this.terms.validUntil) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
    this.terms.validUntil = expiryDate;
  }
  
  next();
});

// Method to calculate pricing totals
quoteSchema.methods.calculateTotals = function() {
  // Calculate subtotal
  let subtotal = this.pricing.basePrice.amount || 0;
  
  // Add labor costs
  subtotal += this.pricing.laborCosts.reduce((total, labor) => {
    labor.totalAmount = (labor.hours || 0) * (labor.hourlyRate || 0);
    return total + labor.totalAmount;
  }, 0);
  
  // Add materials
  subtotal += this.pricing.materials.reduce((total, material) => {
    material.totalPrice = (material.quantity || 0) * (material.unitPrice || 0);
    return total + material.totalPrice;
  }, 0);
  
  // Add additional fees
  subtotal += this.pricing.additionalFees.reduce((total, fee) => total + (fee.amount || 0), 0);
  
  this.pricing.subtotal = subtotal;
  
  // Calculate discounts
  this.pricing.totalDiscounts = this.pricing.discounts.reduce((total, discount) => {
    if (discount.type === 'percentage') {
      discount.amount = (subtotal * (discount.value || 0)) / 100;
    } else {
      discount.amount = discount.value || 0;
    }
    return total + discount.amount;
  }, 0);
  
  // Calculate taxes on discounted amount
  const taxableAmount = subtotal - this.pricing.totalDiscounts;
  this.pricing.totalTaxes = this.pricing.taxes.reduce((total, tax) => {
    tax.amount = (taxableAmount * (tax.rate || 0)) / 100;
    return total + tax.amount;
  }, 0);
  
  // Calculate final total
  this.pricing.finalTotal = taxableAmount + this.pricing.totalTaxes;
};

// Method to update workflow dates
quoteSchema.methods.updateWorkflowDates = function() {
  const now = new Date();
  
  switch (this.status) {
    case 'sent':
      if (!this.workflow.sentDate) this.workflow.sentDate = now;
      break;
    case 'viewed':
      if (!this.workflow.viewedDate) this.workflow.viewedDate = now;
      break;
    case 'under_review':
    case 'negotiating':
      if (!this.workflow.respondedDate) this.workflow.respondedDate = now;
      break;
    case 'accepted':
    case 'converted_to_booking':
      if (!this.workflow.acceptedDate) this.workflow.acceptedDate = now;
      break;
    case 'rejected':
      if (!this.workflow.rejectedDate) this.workflow.rejectedDate = now;
      break;
    case 'expired':
      if (!this.workflow.expiredDate) this.workflow.expiredDate = now;
      break;
  }
  
  this.workflow.lastModified = now;
};

// Method to add revision
quoteSchema.methods.addRevision = function(changes, modifiedBy, reason) {
  const version = this.workflow.revisionHistory.length + 1;
  this.workflow.revisionHistory.push({
    version,
    changes,
    modifiedBy,
    reason,
    modifiedDate: new Date()
  });
  this.analytics.revisionCount++;
  this.status = 'revised';
};

// Method to add communication
quoteSchema.methods.addCommunication = function(from, message, type = 'message', attachments = []) {
  this.communications.push({
    from,
    message,
    type,
    attachments
  });
};

// Method to check if quote is expired
quoteSchema.methods.isExpired = function() {
  return new Date() > this.terms.validUntil;
};

// Method to extend expiry date
quoteSchema.methods.extendExpiry = function(days) {
  const newExpiry = new Date(this.terms.validUntil);
  newExpiry.setDate(newExpiry.getDate() + days);
  this.terms.validUntil = newExpiry;
};

// Static method to find quotes by provider
quoteSchema.statics.findByProvider = function(providerId, status = null, options = {}) {
  const { limit = 50, skip = 0, sortBy = 'createdAt', sortOrder = -1 } = options;
  
  const query = { 'serviceProvider.providerId': providerId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip)
    .populate('customer.userId', 'firstName lastName email phone')
    .populate('serviceDetails.serviceId', 'name category')
    .populate('serviceDetails.categoryId', 'name');
};

// Static method to find quotes by customer
quoteSchema.statics.findByCustomer = function(userId, status = null, options = {}) {
  const { limit = 50, skip = 0, sortBy = 'createdAt', sortOrder = -1 } = options;
  
  const query = { 'customer.userId': userId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip)
    .populate('serviceProvider.providerId')
    .populate('serviceDetails.serviceId', 'name category')
    .populate('serviceDetails.categoryId', 'name');
};

// Static method to get expired quotes
quoteSchema.statics.getExpired = function() {
  return this.find({
    'terms.validUntil': { $lt: new Date() },
    status: { $nin: ['accepted', 'rejected', 'expired', 'cancelled', 'converted_to_booking'] }
  });
};

module.exports = mongoose.model('Quote', quoteSchema);
