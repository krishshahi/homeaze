const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  // Basic Location Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['country', 'state', 'city', 'neighborhood', 'zipcode', 'address', 'landmark'],
    required: true
  },
  
  // Address Components
  address: {
    street: String,
    streetNumber: String,
    apartmentUnit: String,
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    stateCode: {
      type: String,
      uppercase: true,
      trim: true
    },
    country: {
      type: String,
      default: 'United States',
      trim: true
    },
    countryCode: {
      type: String,
      default: 'US',
      uppercase: true,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    zipCodeExtension: String,
    formattedAddress: String // Full formatted address
  },

  // Geographic Coordinates
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    }
  },

  // Bounds and Geometry
  bounds: {
    northeast: {
      lat: Number,
      lng: Number
    },
    southwest: {
      lat: Number,
      lng: Number
    }
  },
  geometry: {
    type: Object, // GeoJSON geometry for complex shapes
    default: null
  },

  // Hierarchy and Relationships
  hierarchy: {
    country: String,
    state: String,
    city: String,
    neighborhood: String,
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    children: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    }]
  },

  // External IDs and References
  externalIds: {
    googlePlaceId: String,
    yelpId: String,
    foursquareId: String,
    facebookPlaceId: String,
    osmId: String,
    censusId: String,
    fipsCode: String
  },

  // Service Availability
  serviceInfo: {
    isServiceArea: { type: Boolean, default: true },
    activeProviders: { type: Number, default: 0 },
    totalServices: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // in minutes
    demandLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high'],
      default: 'medium'
    },
    popularServices: [String],
    serviceRadius: { type: Number, default: 15 } // miles
  },

  // Demographics and Statistics
  demographics: {
    population: Number,
    households: Number,
    medianIncome: Number,
    averageAge: Number,
    homeOwnershipRate: Number,
    averageHomeValue: Number,
    averageRent: Number,
    educationLevel: String,
    employmentRate: Number
  },

  // Weather and Climate
  climate: {
    zone: String, // e.g., 'temperate', 'tropical', 'arid'
    averageTemperature: {
      summer: Number,
      winter: Number,
      annual: Number
    },
    precipitation: {
      annual: Number, // inches
      rainyDays: Number
    },
    seasonality: [{
      season: {
        type: String,
        enum: ['spring', 'summer', 'fall', 'winter']
      },
      demand: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      popularServices: [String]
    }]
  },

  // Business and Economic Data
  economic: {
    businessCount: Number,
    unemploymentRate: Number,
    costOfLiving: Number, // index compared to national average
    marketSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'metro'],
      default: 'medium'
    },
    competitionLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    averageServicePrice: Number
  },

  // Time Zone Information
  timeZone: {
    name: String, // e.g., 'America/New_York'
    abbreviation: String, // e.g., 'EST', 'PST'
    utcOffset: Number, // offset from UTC in hours
    observesDST: { type: Boolean, default: true }
  },

  // Transportation and Accessibility
  transportation: {
    publicTransit: {
      available: { type: Boolean, default: false },
      types: [String], // ['bus', 'subway', 'train', 'light_rail']
      score: Number // 0-100 accessibility score
    },
    parking: {
      availability: {
        type: String,
        enum: ['limited', 'moderate', 'abundant'],
        default: 'moderate'
      },
      averageCost: Number,
      restrictions: [String]
    },
    walkability: {
      score: Number, // 0-100 walkability score
      bikeability: Number // 0-100 bike-friendly score
    }
  },

  // Safety and Quality Metrics
  safety: {
    crimeRate: Number, // per 1000 residents
    safetyScore: Number, // 0-100
    emergencyServices: {
      police: { available: Boolean, responseTime: Number },
      fire: { available: Boolean, responseTime: Number },
      medical: { available: Boolean, responseTime: Number }
    }
  },

  // Marketing and Targeting Data
  marketing: {
    targetAudience: [String], // demographic segments
    marketingChannels: [String], // effective channels for this area
    seasonalCampaigns: [{
      season: String,
      services: [String],
      budget: Number
    }],
    competitorAnalysis: [{
      competitor: String,
      marketShare: Number,
      strengths: [String]
    }]
  },

  // Service Analytics
  analytics: {
    bookingVolume: {
      daily: { type: Number, default: 0 },
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 }
    },
    topServiceCategories: [{
      category: String,
      percentage: Number,
      growth: Number
    }],
    customerSatisfaction: { type: Number, default: 0 },
    averageJobValue: { type: Number, default: 0 },
    seasonalTrends: [{
      month: { type: Number, min: 1, max: 12 },
      demand: Number,
      averagePrice: Number
    }]
  },

  // Status and Metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'restricted', 'coming_soon'],
    default: 'active'
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verificationDate: Date,
    verificationSource: String,
    lastUpdated: { type: Date, default: Date.now }
  },
  tags: [String], // For custom categorization
  
  // Search and SEO
  searchOptimization: {
    keywords: [String],
    alternateNames: [String],
    popularSearches: [String],
    seoData: {
      title: String,
      description: String,
      canonicalUrl: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
locationSchema.index({ 'coordinates.coordinates': '2dsphere' });
locationSchema.index({ 'address.city': 1, 'address.state': 1 });
locationSchema.index({ 'address.zipCode': 1 });
locationSchema.index({ type: 1, status: 1 });
locationSchema.index({ 'externalIds.googlePlaceId': 1 });
locationSchema.index({ 'hierarchy.parent': 1 });
locationSchema.index({ 'serviceInfo.demandLevel': 1 });
locationSchema.index({ 'analytics.bookingVolume.monthly': -1 });

// Virtual for latitude
locationSchema.virtual('latitude').get(function() {
  return this.coordinates && this.coordinates.coordinates ? this.coordinates.coordinates[1] : null;
});

// Virtual for longitude
locationSchema.virtual('longitude').get(function() {
  return this.coordinates && this.coordinates.coordinates ? this.coordinates.coordinates[0] : null;
});

// Virtual for full address
locationSchema.virtual('fullAddress').get(function() {
  if (this.address.formattedAddress) {
    return this.address.formattedAddress;
  }
  
  const parts = [];
  if (this.address.streetNumber) parts.push(this.address.streetNumber);
  if (this.address.street) parts.push(this.address.street);
  if (this.address.city) parts.push(this.address.city);
  if (this.address.stateCode) parts.push(this.address.stateCode);
  if (this.address.zipCode) parts.push(this.address.zipCode);
  
  return parts.join(', ');
});

// Method to calculate distance to another location
locationSchema.methods.distanceTo = function(otherLocation) {
  const [lon1, lat1] = this.coordinates.coordinates;
  const [lon2, lat2] = otherLocation.coordinates.coordinates;
  
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

// Method to check if location is within service area
locationSchema.methods.isInServiceArea = function(serviceRadius = null) {
  const radius = serviceRadius || this.serviceInfo.serviceRadius;
  return this.serviceInfo.isServiceArea && radius > 0;
};

// Method to get nearby locations
locationSchema.methods.findNearby = async function(radius = 25, limit = 50) {
  return await this.constructor.find({
    'coordinates.coordinates': {
      $near: {
        $geometry: this.coordinates,
        $maxDistance: radius * 1609.34 // Convert miles to meters
      }
    },
    _id: { $ne: this._id },
    status: 'active'
  }).limit(limit);
};

// Method to update service metrics
locationSchema.methods.updateServiceMetrics = function(metrics) {
  Object.assign(this.serviceInfo, metrics);
  Object.assign(this.analytics, metrics);
  this.verification.lastUpdated = new Date();
};

// Static method to find locations by bounds
locationSchema.statics.findInBounds = function(bounds, options = {}) {
  const { ne, sw } = bounds;
  const { limit = 100, type = null, serviceArea = true } = options;
  
  const query = {
    'coordinates.coordinates': {
      $geoWithin: {
        $box: [
          [sw.lng, sw.lat], // Southwest corner
          [ne.lng, ne.lat]  // Northeast corner
        ]
      }
    },
    status: 'active'
  };
  
  if (type) query.type = type;
  if (serviceArea) query['serviceInfo.isServiceArea'] = true;
  
  return this.find(query).limit(limit);
};

// Static method to search locations
locationSchema.statics.search = async function(query, options = {}) {
  const {
    limit = 20,
    skip = 0,
    type = null,
    coordinates = null,
    radius = null,
    sortBy = 'relevance'
  } = options;
  
  let searchCriteria = {
    status: 'active',
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { 'address.city': { $regex: query, $options: 'i' } },
      { 'address.state': { $regex: query, $options: 'i' } },
      { 'address.zipCode': { $regex: query, $options: 'i' } },
      { 'searchOptimization.alternateNames': { $in: [new RegExp(query, 'i')] } }
    ]
  };
  
  if (type) searchCriteria.type = type;
  
  let mongoQuery = this.find(searchCriteria);
  
  // Add geographic search if coordinates provided
  if (coordinates && radius) {
    mongoQuery = this.find({
      ...searchCriteria,
      'coordinates.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: radius * 1609.34 // Convert miles to meters
        }
      }
    });
  }
  
  // Apply sorting
  if (sortBy === 'popularity') {
    mongoQuery = mongoQuery.sort({ 'analytics.bookingVolume.monthly': -1 });
  } else if (sortBy === 'alphabetical') {
    mongoQuery = mongoQuery.sort({ name: 1 });
  }
  
  return mongoQuery.limit(limit).skip(skip);
};

// Static method to get popular locations
locationSchema.statics.getPopular = function(limit = 10, type = null) {
  const query = { status: 'active' };
  if (type) query.type = type;
  
  return this.find(query)
    .sort({ 'analytics.bookingVolume.monthly': -1, 'serviceInfo.activeProviders': -1 })
    .limit(limit);
};

// Pre-save middleware
locationSchema.pre('save', function(next) {
  // Generate formatted address if not provided
  if (!this.address.formattedAddress && this.address.city) {
    this.address.formattedAddress = this.fullAddress;
  }
  
  // Update verification timestamp
  if (this.isModified()) {
    this.verification.lastUpdated = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Location', locationSchema);
