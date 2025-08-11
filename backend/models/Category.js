const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Category Hierarchy
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  level: {
    type: Number,
    default: 0, // 0 = root level, 1 = first level subcategory, etc.
    min: 0,
    max: 3
  },
  path: {
    type: String, // e.g., "Home Improvement > Plumbing > Pipe Repair"
    trim: true
  },

  // Visual Elements
  media: {
    icon: {
      type: String, // URL to icon or icon class name
      default: 'default-service-icon'
    },
    image: {
      type: String, // URL to category image
    },
    color: {
      type: String, // Hex color code for category branding
      default: '#007bff'
    },
    bannerImage: String
  },

  // Pricing Information
  pricing: {
    averagePrice: {
      type: Number,
      default: 0
    },
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 1000 }
    },
    pricingModel: {
      type: String,
      enum: ['fixed', 'hourly', 'per_service', 'quote_based', 'varies'],
      default: 'varies'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },

  // Category Metadata
  metadata: {
    keywords: [String], // SEO keywords
    tags: [String],     // General tags for filtering
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'difficult', 'expert'],
      default: 'moderate'
    },
    timeEstimate: {
      min: Number, // in minutes
      max: Number, // in minutes
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days'],
        default: 'hours'
      }
    },
    seasonality: {
      peak: [{ // Peak months (0-11, where 0 = January)
        type: Number,
        min: 0,
        max: 11
      }],
      demand: {
        type: String,
        enum: ['year-round', 'seasonal', 'emergency'],
        default: 'year-round'
      }
    }
  },

  // Business Rules
  businessRules: {
    requiresLicense: { type: Boolean, default: false },
    requiresInsurance: { type: Boolean, default: false },
    requiresBackground: { type: Boolean, default: false },
    minimumExperience: { type: Number, default: 0 }, // in years
    emergencyService: { type: Boolean, default: false },
    bookingWindow: {
      advance: { type: Number, default: 24 }, // hours in advance
      leadTime: { type: Number, default: 2 }   // minimum hours before service
    }
  },

  // Service Requirements
  requirements: {
    tools: [String],        // Required tools/equipment
    materials: [String],    // Common materials needed
    skills: [String],       // Required skills
    certifications: [String] // Preferred certifications
  },

  // Statistics and Analytics
  analytics: {
    totalServices: { type: Number, default: 0 },
    activeProviders: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    popularityScore: { type: Number, default: 0 }, // Algorithm-based popularity
    searchVolume: { type: Number, default: 0 },    // How often searched
    conversionRate: { type: Number, default: 0 },  // Booking/view ratio
    cancelationRate: { type: Number, default: 0 },
    customerSatisfaction: { type: Number, default: 0 }
  },

  // SEO and Content
  seo: {
    metaTitle: String,
    metaDescription: String,
    canonicalUrl: String,
    structuredData: Object // JSON-LD structured data
  },
  content: {
    longDescription: String,
    howItWorks: [String], // Step-by-step process
    tips: [String],       // Tips for customers
    faqs: [{
      question: String,
      answer: String
    }],
    relatedCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }]
  },

  // Availability and Scheduling
  scheduling: {
    defaultDuration: { type: Number, default: 60 }, // in minutes
    bufferTime: { type: Number, default: 15 },      // buffer between bookings
    maxAdvanceBooking: { type: Number, default: 30 }, // days
    availableTimeSlots: [{
      dayOfWeek: { type: Number, min: 0, max: 6 },
      startTime: String,
      endTime: String
    }],
    blackoutPeriods: [{
      start: Date,
      end: Date,
      reason: String
    }]
  },

  // Commission and Financial
  commission: {
    rate: { type: Number, default: 15 }, // percentage
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    minimumFee: { type: Number, default: 0 }
  },

  // Status and Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'coming_soon', 'deprecated'],
    default: 'active'
  },
  visibility: {
    isVisible: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }
  },
  
  // Regional Availability
  availability: {
    regions: [String], // e.g., ['US', 'CA', 'UK']
    cities: [String],  // Specific cities if limited
    isGlobal: { type: Boolean, default: true }
  },

  // Quality Control
  qualityMetrics: {
    averageCompletionTime: Number, // in hours
    onTimeRate: { type: Number, default: 0 }, // percentage
    customerReturnRate: { type: Number, default: 0 },
    issueResolutionRate: { type: Number, default: 100 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ 'analytics.popularityScore': -1 });
categorySchema.index({ 'analytics.averageRating': -1 });
categorySchema.index({ status: 1, 'visibility.isVisible': 1 });
categorySchema.index({ 'visibility.isFeatured': 1, 'visibility.displayOrder': 1 });

// Virtual for breadcrumb
categorySchema.virtual('breadcrumb').get(function() {
  return this.path ? this.path.split(' > ') : [this.name];
});

// Virtual for full URL slug
categorySchema.virtual('fullSlug').get(function() {
  if (this.parentCategory && this.populated('parentCategory')) {
    return `${this.parentCategory.slug}/${this.slug}`;
  }
  return this.slug;
});

// Method to check if category is root level
categorySchema.methods.isRootLevel = function() {
  return this.level === 0 && !this.parentCategory;
};

// Method to get all descendants
categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  const queue = [...this.subcategories];
  
  while (queue.length > 0) {
    const categoryId = queue.shift();
    const category = await this.constructor.findById(categoryId).populate('subcategories');
    if (category) {
      descendants.push(category);
      queue.push(...category.subcategories);
    }
  }
  
  return descendants;
};

// Method to get full category path
categorySchema.methods.getFullPath = async function() {
  const path = [this.name];
  let current = this;
  
  while (current.parentCategory) {
    current = await this.constructor.findById(current.parentCategory);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }
  
  return path.join(' > ');
};

// Method to update analytics
categorySchema.methods.updateAnalytics = function(metrics) {
  Object.assign(this.analytics, metrics);
  
  // Calculate popularity score based on various factors
  const weights = {
    bookings: 0.3,
    providers: 0.2,
    rating: 0.2,
    searchVolume: 0.2,
    conversion: 0.1
  };
  
  this.analytics.popularityScore = (
    (this.analytics.totalBookings * weights.bookings) +
    (this.analytics.activeProviders * weights.providers) +
    (this.analytics.averageRating * 20 * weights.rating) + // Scale rating to 0-100
    (Math.log(this.analytics.searchVolume + 1) * weights.searchVolume) +
    (this.analytics.conversionRate * weights.conversion)
  );
};

// Pre-save middleware to generate slug and path
categorySchema.pre('save', async function(next) {
  // Generate slug if not provided
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Generate path
  if (this.isModified('name') || this.isModified('parentCategory')) {
    this.path = await this.getFullPath();
  }
  
  next();
});

// Static method to get category hierarchy
categorySchema.statics.getHierarchy = async function() {
  const rootCategories = await this.find({ level: 0 })
    .populate({
      path: 'subcategories',
      populate: {
        path: 'subcategories',
        populate: {
          path: 'subcategories'
        }
      }
    })
    .sort({ 'visibility.displayOrder': 1, name: 1 });
    
  return rootCategories;
};

// Static method to search categories
categorySchema.statics.search = async function(query, options = {}) {
  const {
    limit = 20,
    skip = 0,
    sortBy = 'popularityScore',
    level = null,
    status = 'active'
  } = options;
  
  const searchCriteria = {
    status,
    'visibility.isVisible': true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { 'metadata.keywords': { $in: [new RegExp(query, 'i')] } },
      { 'metadata.tags': { $in: [new RegExp(query, 'i')] } }
    ]
  };
  
  if (level !== null) {
    searchCriteria.level = level;
  }
  
  const sortOptions = {};
  if (sortBy === 'popularityScore') {
    sortOptions['analytics.popularityScore'] = -1;
  } else if (sortBy === 'alphabetical') {
    sortOptions.name = 1;
  } else if (sortBy === 'rating') {
    sortOptions['analytics.averageRating'] = -1;
  }
  
  return await this.find(searchCriteria)
    .sort(sortOptions)
    .limit(limit)
    .skip(skip)
    .populate('parentCategory', 'name slug');
};

module.exports = mongoose.model('Category', categorySchema);
