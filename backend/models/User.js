const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  userType: {
    type: String,
    enum: ['customer', 'provider'],
    required: true,
    default: 'customer'
  },
  avatar: {
    type: String,
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // MFA and Security fields
  mfa: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    secret: {
      type: String,
      default: null
    },
    backupCodes: [{
      code: String,
      used: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    lastUsed: Date
  },
  emailVerification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    verificationAttempts: {
      type: Number,
      default: 0
    },
    lastVerificationAttempt: Date
  },
  phoneVerification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    verificationAttempts: {
      type: Number,
      default: 0
    },
    lastVerificationAttempt: Date
  },
  passwordReset: {
    token: String,
    expires: Date,
    attempts: {
      type: Number,
      default: 0
    },
    lastAttempt: Date
  },
  loginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    lockedUntil: Date
  },
  sessions: [{
    sessionId: String,
    deviceInfo: {
      userAgent: String,
      ip: String,
      platform: String,
      browser: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Social Authentication
  socialAuth: {
    googleId: String,
    facebookId: String,
    appleId: String,
    linkedinId: String,
    google: {
      id: String,
      email: String,
      name: String,
      picture: String,
      linkedAt: Date
    },
    facebook: {
      id: String,
      email: String,
      name: String,
      picture: String,
      linkedAt: Date
    },
    apple: {
      id: String,
      email: String,
      name: String,
      linkedAt: Date
    },
    linkedin: {
      id: String,
      email: String,
      name: String,
      picture: String,
      linkedAt: Date
    }
  },
  // Customer specific fields
  customerProfile: {
    preferences: {
      preferredServiceTypes: [String],
      preferredTimeSlots: [String],
      budgetRange: {
        min: Number,
        max: Number
      }
    },
    bookingHistory: [{
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      },
      providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      bookingDate: Date,
      rating: Number,
      review: String
    }]
  },
  // Provider specific fields
  providerProfile: {
    businessName: String,
    businessLicense: String,
    serviceCategories: [String],
    experienceYears: Number,
    description: String,
    pricing: {
      hourlyRate: Number,
      minimumCharge: Number
    },
    availability: {
      workingDays: [String],
      workingHours: {
        start: String,
        end: String
      }
    },
    verification: {
      backgroundCheck: {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending'
        },
        verifiedAt: Date
      },
      documents: [{
        documentType: String,
        url: String,
        verifiedAt: Date
      }]
    },
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
    portfolio: [{
      title: String,
      description: String,
      images: [String],
      completedAt: Date
    }]
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

// Index for geospatial queries (commented out temporarily)
// userSchema.index({ "address.coordinates": "2dsphere" });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
userSchema.pre(['save', 'findOneAndUpdate'], function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  try {
    const user = this.toObject();
    delete user.password;
    if (user.providerProfile && user.providerProfile.verification) {
      delete user.providerProfile.verification;
    }
    return user;
  } catch (error) {
    console.error('Error in getPublicProfile:', error);
    // Return basic profile if there's an error
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      userType: this.userType,
      isActive: this.isActive
    };
  }
};

// Method to get provider rating summary
userSchema.methods.getRatingSummary = function() {
  if (this.userType !== 'provider') return null;
  
  return {
    average: this.providerProfile?.rating?.average || 0,
    totalReviews: this.providerProfile?.rating?.totalReviews || 0
  };
};

module.exports = mongoose.model('User', userSchema);
