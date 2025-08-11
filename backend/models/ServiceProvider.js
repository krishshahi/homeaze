const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessDescription: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  businessType: {
    type: String,
    enum: ['individual', 'company', 'agency'],
    required: true
  },
  
  // Contact Information
  contactInfo: {
    primaryPhone: {
      type: String,
      required: true
    },
    secondaryPhone: String,
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String
    }
  },

  // Business Address
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'US' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },

  // Service Areas
  serviceAreas: [{
    city: String,
    state: String,
    zipCodes: [String],
    radius: { type: Number, default: 25 }, // miles
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  }],

  // Services Offered
  services: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    isActive: { type: Boolean, default: true },
    pricing: {
      type: {
        type: String,
        enum: ['fixed', 'hourly', 'per_service', 'custom'],
        default: 'fixed'
      },
      basePrice: { type: Number, default: 0 },
      hourlyRate: Number,
      minimumCharge: Number,
      additionalFees: [{
        name: String,
        amount: Number,
        description: String
      }]
    },
    experience: {
      years: { type: Number, default: 0 },
      description: String,
      specializations: [String]
    }
  }],

  // Availability
  availability: {
    schedule: [{
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6,
        required: true
      }, // 0 = Sunday, 6 = Saturday
      isAvailable: { type: Boolean, default: true },
      timeSlots: [{
        startTime: String, // "09:00"
        endTime: String,   // "17:00"
        isBooked: { type: Boolean, default: false }
      }]
    }],
    blackoutDates: [{
      date: Date,
      reason: String
    }],
    advanceBookingDays: { type: Number, default: 30 },
    emergencyAvailable: { type: Boolean, default: false }
  },

  // Ratings and Reviews
  ratings: {
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    ratingBreakdown: {
      fiveStars: { type: Number, default: 0 },
      fourStars: { type: Number, default: 0 },
      threeStars: { type: Number, default: 0 },
      twoStars: { type: Number, default: 0 },
      oneStars: { type: Number, default: 0 }
    },
    qualityScores: {
      punctuality: { type: Number, default: 0 },
      professionalism: { type: Number, default: 0 },
      valueForMoney: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      cleanliness: { type: Number, default: 0 }
    }
  },

  // Business Metrics
  businessMetrics: {
    totalJobs: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    cancelledJobs: { type: Number, default: 0 },
    repeatCustomers: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageJobValue: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // in minutes
    completionRate: { type: Number, default: 0 } // percentage
  },

  // Verification and Credentials
  verification: {
    isVerified: { type: Boolean, default: false },
    verificationDate: Date,
    documentsUploaded: {
      businessLicense: { type: Boolean, default: false },
      insurance: { type: Boolean, default: false },
      bondedCertificate: { type: Boolean, default: false },
      backgroundCheck: { type: Boolean, default: false }
    },
    certifications: [{
      name: String,
      issuingBody: String,
      issueDate: Date,
      expiryDate: Date,
      certificateNumber: String
    }],
    licenses: [{
      type: String,
      number: String,
      issuingState: String,
      issueDate: Date,
      expiryDate: Date
    }]
  },

  // Insurance Information
  insurance: {
    hasInsurance: { type: Boolean, default: false },
    provider: String,
    policyNumber: String,
    coverageAmount: Number,
    expiryDate: Date,
    isBonded: { type: Boolean, default: false },
    bondAmount: Number
  },

  // Financial Information
  financial: {
    taxId: String,
    bankAccountVerified: { type: Boolean, default: false },
    paymentMethods: [{
      type: {
        type: String,
        enum: ['bank_transfer', 'check', 'cash', 'card']
      },
      isPreferred: Boolean
    }],
    commission: {
      rate: { type: Number, default: 15 }, // percentage
      type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' }
    }
  },

  // Media and Portfolio
  media: {
    profilePicture: String,
    businessLogo: String,
    coverPhoto: String,
    gallery: [{
      url: String,
      caption: String,
      isBeforeAfter: Boolean,
      category: String,
      uploadDate: { type: Date, default: Date.now }
    }],
    videos: [{
      url: String,
      thumbnail: String,
      title: String,
      description: String
    }]
  },

  // Status and Settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended', 'rejected'],
    default: 'pending'
  },
  isOnline: { type: Boolean, default: false },
  lastSeen: Date,
  notificationPreferences: {
    newBookings: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    reviews: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    systemUpdates: { type: Boolean, default: true }
  },

  // Subscription and Premium Features
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
    featuresEnabled: {
      priorityListing: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      bulkBooking: { type: Boolean, default: false }
    }
  },

  // Timestamps
  joinedDate: { type: Date, default: Date.now },
  lastProfileUpdate: { type: Date, default: Date.now },
  lastActiveDate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
serviceProviderSchema.index({ 'address.coordinates': '2dsphere' });
serviceProviderSchema.index({ 'serviceAreas.coordinates': '2dsphere' });
serviceProviderSchema.index({ 'ratings.averageRating': -1 });
serviceProviderSchema.index({ 'services.serviceId': 1 });
serviceProviderSchema.index({ status: 1 });
serviceProviderSchema.index({ 'businessMetrics.totalJobs': -1 });
serviceProviderSchema.index({ 'verification.isVerified': 1 });

// Virtual for completion rate
serviceProviderSchema.virtual('completionRate').get(function() {
  if (this.businessMetrics.totalJobs === 0) return 0;
  return (this.businessMetrics.completedJobs / this.businessMetrics.totalJobs) * 100;
});

// Virtual for response rate
serviceProviderSchema.virtual('responseRate').get(function() {
  // This would be calculated based on how quickly they respond to messages/bookings
  return this.businessMetrics.responseTime < 60 ? 95 : this.businessMetrics.responseTime < 120 ? 85 : 75;
});

// Method to update ratings
serviceProviderSchema.methods.updateRating = function(newRating) {
  const breakdown = this.ratings.ratingBreakdown;
  const ratingKey = ['oneStars', 'twoStars', 'threeStars', 'fourStars', 'fiveStars'][newRating - 1];
  
  breakdown[ratingKey]++;
  this.ratings.totalReviews++;
  
  const totalRating = (
    breakdown.oneStars * 1 +
    breakdown.twoStars * 2 +
    breakdown.threeStars * 3 +
    breakdown.fourStars * 4 +
    breakdown.fiveStars * 5
  );
  
  this.ratings.averageRating = totalRating / this.ratings.totalReviews;
};

// Method to check if provider serves a location
serviceProviderSchema.methods.servesLocation = function(coordinates) {
  for (const area of this.serviceAreas) {
    if (area.coordinates && area.coordinates.length === 2) {
      const distance = this.calculateDistance(coordinates, area.coordinates);
      if (distance <= area.radius) {
        return true;
      }
    }
  }
  return false;
};

// Method to calculate distance between two coordinates
serviceProviderSchema.methods.calculateDistance = function(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Method to check availability for a specific date/time
serviceProviderSchema.methods.isAvailable = function(date, timeSlot) {
  const dayOfWeek = date.getDay();
  const daySchedule = this.availability.schedule.find(s => s.dayOfWeek === dayOfWeek);
  
  if (!daySchedule || !daySchedule.isAvailable) return false;
  
  // Check if the time slot is available
  const availableSlot = daySchedule.timeSlots.find(slot => 
    slot.startTime <= timeSlot && slot.endTime >= timeSlot && !slot.isBooked
  );
  
  return !!availableSlot;
};

// Pre-save middleware to update lastProfileUpdate
serviceProviderSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastProfileUpdate = new Date();
  }
  next();
});

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
