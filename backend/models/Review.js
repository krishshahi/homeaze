const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewId: {
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
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    aspects: {
      quality: {
        type: Number,
        min: 1,
        max: 5
      },
      punctuality: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5
      },
      valueForMoney: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  },
  comment: {
    title: String,
    content: {
      type: String,
      maxlength: 2000
    },
    pros: [String],
    cons: [String]
  },
  images: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  response: {
    comment: {
      type: String,
      maxlength: 1000
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'published', 'flagged', 'removed'],
    default: 'published'
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: true // Automatically verified if linked to completed booking
    },
    verifiedAt: Date,
    verificationMethod: {
      type: String,
      enum: ['booking_completion', 'manual_verification', 'photo_proof'],
      default: 'booking_completion'
    }
  },
  helpfulnessScore: {
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  flags: [{
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'offensive', 'irrelevant']
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  metadata: {
    platform: {
      type: String,
      enum: ['web', 'mobile_app', 'sms', 'email'],
      default: 'web'
    },
    deviceInfo: String,
    ipAddress: String,
    location: {
      city: String,
      state: String,
      country: String
    }
  },
  featured: {
    type: Boolean,
    default: false
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
reviewSchema.index({ reviewId: 1 });
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ providerId: 1, 'rating.overall': -1 });
reviewSchema.index({ serviceId: 1, 'rating.overall': -1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ featured: -1, 'rating.overall': -1 });

// Compound index for provider ratings
reviewSchema.index({ providerId: 1, status: 1, 'rating.overall': -1 });

// Pre-save middleware to generate review ID
reviewSchema.pre('save', async function(next) {
  if (this.isNew && !this.reviewId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.reviewId = `REV-${timestamp.slice(-8)}-${random}`;
  }
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to calculate overall rating from aspects
reviewSchema.pre('save', function(next) {
  if (this.rating.aspects && Object.keys(this.rating.aspects).length > 0) {
    const aspects = this.rating.aspects;
    const validRatings = Object.values(aspects).filter(rating => rating && rating > 0);
    
    if (validRatings.length > 0) {
      const sum = validRatings.reduce((total, rating) => total + rating, 0);
      this.rating.overall = Math.round((sum / validRatings.length) * 10) / 10;
    }
  }
  next();
});

// Post-save middleware to update provider and service ratings
reviewSchema.post('save', async function() {
  try {
    // Update provider rating
    await this.constructor.updateProviderRating(this.providerId);
    
    // Update service rating
    await this.constructor.updateServiceRating(this.serviceId);
  } catch (error) {
    console.error('Error updating ratings after review save:', error);
  }
});

// Method to add response
reviewSchema.methods.addResponse = function(comment, respondedBy) {
  this.response = {
    comment,
    respondedAt: new Date(),
    respondedBy
  };
  return this.save();
};

// Method to flag review
reviewSchema.methods.flagReview = function(reason, flaggedBy) {
  this.flags.push({
    reason,
    flaggedBy,
    flaggedAt: new Date()
  });
  
  // Auto-flag if multiple flags
  if (this.flags.length >= 3) {
    this.status = 'flagged';
  }
  
  return this.save();
};

// Method to mark as helpful/not helpful
reviewSchema.methods.markHelpfulness = function(isHelpful) {
  if (isHelpful) {
    this.helpfulnessScore.helpful += 1;
  } else {
    this.helpfulnessScore.notHelpful += 1;
  }
  this.helpfulnessScore.total = this.helpfulnessScore.helpful + this.helpfulnessScore.notHelpful;
  return this.save();
};

// Static method to update provider rating
reviewSchema.statics.updateProviderRating = async function(providerId) {
  try {
    const stats = await this.aggregate([
      {
        $match: {
          providerId: new mongoose.Types.ObjectId(providerId),
          status: 'published'
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating.overall' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating.overall'
          }
        }
      }
    ]);

    if (stats.length > 0) {
      const { averageRating, totalReviews, ratingDistribution } = stats[0];
      
      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratingDistribution.forEach(rating => {
        const roundedRating = Math.round(rating);
        distribution[roundedRating] = (distribution[roundedRating] || 0) + 1;
      });

      // Update user's provider profile
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(providerId, {
        'providerProfile.rating.average': Math.round(averageRating * 10) / 10,
        'providerProfile.rating.totalReviews': totalReviews,
        'providerProfile.rating.distribution': distribution
      });
    }
  } catch (error) {
    console.error('Error updating provider rating:', error);
  }
};

// Static method to update service rating
reviewSchema.statics.updateServiceRating = async function(serviceId) {
  try {
    const stats = await this.aggregate([
      {
        $match: {
          serviceId: new mongoose.Types.ObjectId(serviceId),
          status: 'published'
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating.overall' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      const { averageRating, totalReviews } = stats[0];
      
      // Update service rating
      const Service = mongoose.model('Service');
      await Service.findByIdAndUpdate(serviceId, {
        'rating.average': Math.round(averageRating * 10) / 10,
        'rating.totalReviews': totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating service rating:', error);
  }
};

// Static method to get review statistics
reviewSchema.statics.getReviewStats = function(providerId, period = 'month') {
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
        status: 'published',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating.overall' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating.overall'
        },
        aspectRatings: {
          quality: { $avg: '$rating.aspects.quality' },
          punctuality: { $avg: '$rating.aspects.punctuality' },
          communication: { $avg: '$rating.aspects.communication' },
          cleanliness: { $avg: '$rating.aspects.cleanliness' },
          valueForMoney: { $avg: '$rating.aspects.valueForMoney' }
        }
      }
    }
  ]);
};

// Static method to get trending reviews (most helpful)
reviewSchema.statics.getTrendingReviews = function(limit = 10) {
  return this.find({
    status: 'published',
    'helpfulnessScore.total': { $gte: 5 }
  })
  .populate('customerId', 'name avatar')
  .populate('providerId', 'name')
  .populate('serviceId', 'title category')
  .sort({ 'helpfulnessScore.helpful': -1, 'rating.overall': -1 })
  .limit(limit);
};

module.exports = mongoose.model('Review', reviewSchema);
