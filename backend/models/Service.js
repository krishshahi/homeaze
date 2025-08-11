const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'cleaning',
      'plumbing',
      'electrical',
      'hvac',
      'painting',
      'carpentry',
      'gardening',
      'pest-control',
      'appliance-repair',
      'handyman',
      'other'
    ]
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pricing: {
    type: {
      type: String,
      enum: ['hourly', 'fixed', 'quote'],
      required: true
    },
    amount: {
      type: Number,
      required: function() {
        return this.pricing.type !== 'quote';
      },
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    minimumCharge: Number
  },
  duration: {
    estimated: {
      hours: Number,
      minutes: Number
    },
    maximum: {
      hours: Number,
      minutes: Number
    }
  },
  serviceAreas: [{
    city: String,
    state: String,
    zipCodes: [String],
    radiusKm: Number
  }],
  requirements: {
    materials: {
      provided: {
        type: Boolean,
        default: false
      },
      list: [String]
    },
    access: [String], // e.g., 'electricity', 'water', 'parking'
    preparation: [String] // What customer needs to prepare
  },
  availability: {
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    workingHours: {
      start: String, // Format: "HH:MM"
      end: String
    },
    emergencyAvailable: {
      type: Boolean,
      default: false
    },
    advanceBookingDays: {
      type: Number,
      default: 1
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ providerId: 1 });
serviceSchema.index({ 'rating.average': -1 });
serviceSchema.index({ featured: -1, 'rating.average': -1 });
serviceSchema.index({ 'serviceAreas.city': 1, 'serviceAreas.state': 1 });

// Update the updatedAt field before saving
serviceSchema.pre(['save', 'findOneAndUpdate'], function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for starting price display
serviceSchema.virtual('startingPrice').get(function() {
  if (this.pricing.type === 'quote') {
    return 'Get Quote';
  }
  return `$${this.pricing.amount}${this.pricing.type === 'hourly' ? '/hr' : ''}`;
});

// Method to check if service is available in a location
serviceSchema.methods.isAvailableInLocation = function(city, state, zipCode) {
  return this.serviceAreas.some(area => {
    if (area.city && area.state) {
      return area.city.toLowerCase() === city.toLowerCase() && 
             area.state.toLowerCase() === state.toLowerCase();
    }
    if (area.zipCodes && zipCode) {
      return area.zipCodes.includes(zipCode);
    }
    return false;
  });
};

// Method to calculate distance-based availability
serviceSchema.methods.isWithinServiceRadius = function(latitude, longitude) {
  // This would typically use geospatial queries
  // For now, return true if coordinates are provided
  return latitude && longitude;
};

// Method to get service summary for listings
serviceSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description.substring(0, 150) + '...',
    category: this.category,
    pricing: this.pricing,
    rating: this.rating,
    featured: this.featured,
    primaryImage: this.images.find(img => img.isPrimary)?.url || this.images[0]?.url,
    provider: this.providerId
  };
};

// Static method to get featured services
serviceSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ featured: true, isActive: true })
    .populate('providerId', 'name avatar providerProfile.rating')
    .sort({ 'rating.average': -1 })
    .limit(limit);
};

// Static method to search services
serviceSchema.statics.searchServices = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    ...filters
  };

  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  return this.find(searchQuery)
    .populate('providerId', 'name avatar providerProfile.rating address')
    .sort({ featured: -1, 'rating.average': -1 });
};

module.exports = mongoose.model('Service', serviceSchema);
