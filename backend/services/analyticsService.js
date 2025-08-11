const mongoose = require('mongoose');
// const tf = require('@tensorflow/tfjs-node'); // Disabled for now - requires Python build tools
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Analytics Event Schema
const analyticsEventSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  eventType: {
    type: String,
    enum: [
      'page_view', 'service_view', 'service_search', 'booking_started', 
      'booking_completed', 'payment_completed', 'review_submitted',
      'app_opened', 'feature_used', 'error_occurred', 'session_ended'
    ],
    required: true
  },
  eventData: {
    type: Object,
    default: {}
  },
  sessionId: String,
  deviceInfo: {
    platform: String,
    version: String,
    deviceId: String
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  index: [
    { userId: 1, timestamp: -1 },
    { eventType: 1, timestamp: -1 },
    { sessionId: 1 }
  ]
});

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

// User Behavior Profile Schema
const userBehaviorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    unique: true,
    required: true 
  },
  preferences: {
    serviceCategories: [{
      category: String,
      score: { type: Number, default: 0 }
    }],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 1000 }
    },
    timePreferences: [{
      dayOfWeek: { type: Number, min: 0, max: 6 },
      preferredHours: [{ type: Number, min: 0, max: 23 }]
    }],
    locationPreferences: [{
      address: String,
      frequency: { type: Number, default: 1 }
    }]
  },
  behaviorMetrics: {
    sessionDuration: { type: Number, default: 0 },
    pagesPerSession: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    avgBookingValue: { type: Number, default: 0 },
    bookingFrequency: { type: Number, default: 0 },
    loyaltyScore: { type: Number, default: 0 }
  },
  predictiveScores: {
    churnRisk: { type: Number, default: 0.5 },
    upsellProbability: { type: Number, default: 0.5 },
    referralLikelihood: { type: Number, default: 0.5 }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const UserBehavior = mongoose.model('UserBehavior', userBehaviorSchema);

class AnalyticsService {
  constructor() {
    this.models = new Map();
    this.initializeModels();
  }

  async initializeModels() {
    // Initialize TensorFlow models for different predictions
    try {
      // TODO: Re-enable when TensorFlow is properly installed
      // this.models.set('recommendation', await this.createRecommendationModel());
      // this.models.set('churn', await this.createChurnPredictionModel());
      // this.models.set('demand', await this.createDemandForecastingModel());
      
      console.log('Analytics models initialized successfully (TensorFlow disabled)');
    } catch (error) {
      console.error('Error initializing analytics models:', error);
    }
  }

  // Create recommendation model (collaborative filtering)
  async createRecommendationModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.embedding({
          inputDim: 10000, // Max user ID
          outputDim: 50,   // Embedding dimension
          inputLength: 1
        }),
        tf.layers.flatten(),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  // Create churn prediction model
  async createChurnPredictionModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          inputShape: [15], // 15 input features
          units: 64, 
          activation: 'relu' 
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Create demand forecasting model (LSTM)
  async createDemandForecastingModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 50,
          returnSequences: true,
          inputShape: [30, 5] // 30 time steps, 5 features
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({
          units: 50,
          returnSequences: false
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 25 }),
        tf.layers.dense({ units: 1 })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  // Track analytics event
  async trackEvent(eventData) {
    try {
      const event = new AnalyticsEvent(eventData);
      await event.save();

      // Update user behavior profile asynchronously
      if (eventData.userId) {
        this.updateUserBehavior(eventData.userId, eventData);
      }

      return event;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      throw error;
    }
  }

  // Update user behavior profile
  async updateUserBehavior(userId, eventData) {
    try {
      const behavior = await UserBehavior.findOneAndUpdate(
        { userId },
        { $setOnInsert: { userId } },
        { upsert: true, new: true }
      );

      // Update behavior based on event type
      switch (eventData.eventType) {
        case 'service_view':
          await this.updateServicePreferences(behavior, eventData);
          break;
        case 'booking_completed':
          await this.updateBookingBehavior(behavior, eventData);
          break;
        case 'session_ended':
          await this.updateSessionMetrics(behavior, eventData);
          break;
      }

      behavior.lastUpdated = new Date();
      await behavior.save();

      // Trigger predictive score updates
      await this.updatePredictiveScores(userId);

    } catch (error) {
      console.error('Error updating user behavior:', error);
    }
  }

  // Update service preferences
  async updateServicePreferences(behavior, eventData) {
    if (!eventData.eventData.serviceCategory) return;

    const category = eventData.eventData.serviceCategory;
    const categoryIndex = behavior.preferences.serviceCategories.findIndex(
      cat => cat.category === category
    );

    if (categoryIndex >= 0) {
      behavior.preferences.serviceCategories[categoryIndex].score += 1;
    } else {
      behavior.preferences.serviceCategories.push({
        category,
        score: 1
      });
    }

    // Sort by score and keep top 10
    behavior.preferences.serviceCategories.sort((a, b) => b.score - a.score);
    behavior.preferences.serviceCategories = behavior.preferences.serviceCategories.slice(0, 10);
  }

  // Update booking behavior
  async updateBookingBehavior(behavior, eventData) {
    const bookingValue = eventData.eventData.amount || 0;
    
    // Update average booking value
    behavior.behaviorMetrics.avgBookingValue = 
      (behavior.behaviorMetrics.avgBookingValue + bookingValue) / 2;

    // Update booking frequency
    behavior.behaviorMetrics.bookingFrequency += 1;

    // Update conversion rate
    const totalSessions = await AnalyticsEvent.countDocuments({
      userId: behavior.userId,
      eventType: 'app_opened'
    });

    const totalBookings = await AnalyticsEvent.countDocuments({
      userId: behavior.userId,
      eventType: 'booking_completed'
    });

    behavior.behaviorMetrics.conversionRate = totalSessions > 0 ? totalBookings / totalSessions : 0;
  }

  // Update session metrics
  async updateSessionMetrics(behavior, eventData) {
    const sessionDuration = eventData.eventData.duration || 0;
    const pagesViewed = eventData.eventData.pagesViewed || 0;

    behavior.behaviorMetrics.sessionDuration = 
      (behavior.behaviorMetrics.sessionDuration + sessionDuration) / 2;
    
    behavior.behaviorMetrics.pagesPerSession = 
      (behavior.behaviorMetrics.pagesPerSession + pagesViewed) / 2;
  }

  // Update predictive scores using ML models
  async updatePredictiveScores(userId) {
    try {
      const behavior = await UserBehavior.findOne({ userId });
      if (!behavior) return;

      // Prepare features for prediction
      const features = await this.prepareUserFeatures(userId);
      
      // Predict churn risk
      if (this.models.get('churn')) {
        const churnPrediction = await this.predictChurn(features);
        behavior.predictiveScores.churnRisk = churnPrediction;
      }

      // Update loyalty score based on behavior
      behavior.predictiveScores.loyaltyScore = this.calculateLoyaltyScore(behavior);

      await behavior.save();
    } catch (error) {
      console.error('Error updating predictive scores:', error);
    }
  }

  // Prepare user features for ML models
  async prepareUserFeatures(userId) {
    const user = await User.findById(userId);
    const behavior = await UserBehavior.findOne({ userId });
    const bookings = await Booking.find({ userId }).limit(10);
    const reviews = await Review.find({ userId }).limit(10);

    const daysSinceRegistration = user ? 
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24) : 0;

    const avgRating = reviews.length > 0 ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    return [
      daysSinceRegistration,
      behavior?.behaviorMetrics.sessionDuration || 0,
      behavior?.behaviorMetrics.pagesPerSession || 0,
      behavior?.behaviorMetrics.conversionRate || 0,
      behavior?.behaviorMetrics.avgBookingValue || 0,
      behavior?.behaviorMetrics.bookingFrequency || 0,
      bookings.length,
      reviews.length,
      avgRating,
      behavior?.preferences.serviceCategories.length || 0,
      // Add more features as needed
      0, 0, 0, 0, 0 // Placeholder features
    ];
  }

  // Predict churn risk
  async predictChurn(features) {
    try {
      const model = this.models.get('churn');
      if (!model) return 0.5;

      const prediction = model.predict(tf.tensor2d([features]));
      const score = await prediction.data();
      prediction.dispose();

      return score[0];
    } catch (error) {
      console.error('Error predicting churn:', error);
      return 0.5;
    }
  }

  // Calculate loyalty score
  calculateLoyaltyScore(behavior) {
    let score = 0;
    
    // Booking frequency weight (40%)
    score += Math.min(behavior.behaviorMetrics.bookingFrequency / 10, 1) * 0.4;
    
    // Average booking value weight (20%)
    score += Math.min(behavior.behaviorMetrics.avgBookingValue / 1000, 1) * 0.2;
    
    // Session engagement weight (20%)
    score += Math.min(behavior.behaviorMetrics.sessionDuration / 1800, 1) * 0.2; // 30 min max
    
    // Conversion rate weight (20%)
    score += behavior.behaviorMetrics.conversionRate * 0.2;
    
    return Math.min(score, 1);
  }

  // Get personalized service recommendations
  async getServiceRecommendations(userId, limit = 10) {
    try {
      const behavior = await UserBehavior.findOne({ userId });
      const user = await User.findById(userId);
      
      if (!behavior || !user) {
        // Return popular services for new users
        return await this.getPopularServices(limit);
      }

      // Get user's preferred categories
      const preferredCategories = behavior.preferences.serviceCategories
        .slice(0, 3)
        .map(cat => cat.category);

      // Get services from preferred categories
      let query = {};
      if (preferredCategories.length > 0) {
        query.category = { $in: preferredCategories };
      }

      // Filter by price range
      if (behavior.preferences.priceRange) {
        query.price = {
          $gte: behavior.preferences.priceRange.min,
          $lte: behavior.preferences.priceRange.max
        };
      }

      // Filter by location if available
      if (user.location && user.location.coordinates) {
        query.serviceArea = {
          $near: {
            $geometry: user.location,
            $maxDistance: 50000 // 50km radius
          }
        };
      }

      const services = await Service.find(query)
        .populate('providerId', 'name rating')
        .sort({ rating: -1, popularity: -1 })
        .limit(limit)
        .lean();

      // Add recommendation scores
      return services.map(service => ({
        ...service,
        recommendationScore: this.calculateRecommendationScore(service, behavior)
      })).sort((a, b) => b.recommendationScore - a.recommendationScore);

    } catch (error) {
      console.error('Error getting service recommendations:', error);
      return await this.getPopularServices(limit);
    }
  }

  // Calculate recommendation score
  calculateRecommendationScore(service, behavior) {
    let score = 0;

    // Category preference match
    const categoryMatch = behavior.preferences.serviceCategories.find(
      cat => cat.category === service.category
    );
    if (categoryMatch) {
      score += (categoryMatch.score / 10) * 0.4;
    }

    // Price range match
    const priceRange = behavior.preferences.priceRange;
    if (service.price >= priceRange.min && service.price <= priceRange.max) {
      score += 0.2;
    }

    // Service rating
    score += (service.rating / 5) * 0.2;

    // Provider rating
    if (service.providerId && service.providerId.rating) {
      score += (service.providerId.rating / 5) * 0.2;
    }

    return Math.min(score, 1);
  }

  // Get popular services (fallback)
  async getPopularServices(limit = 10) {
    try {
      return await Service.find({ isActive: true })
        .populate('providerId', 'name rating')
        .sort({ popularity: -1, rating: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error getting popular services:', error);
      return [];
    }
  }

  // Generate analytics dashboard data
  async getDashboardAnalytics(timeRange = '7d') {
    try {
      const startDate = this.getStartDate(timeRange);
      
      // User metrics
      const userMetrics = await this.getUserMetrics(startDate);
      
      // Booking metrics
      const bookingMetrics = await this.getBookingMetrics(startDate);
      
      // Revenue metrics
      const revenueMetrics = await this.getRevenueMetrics(startDate);
      
      // Service performance
      const servicePerformance = await this.getServicePerformance(startDate);
      
      // Geographic distribution
      const geographicData = await this.getGeographicDistribution(startDate);

      return {
        userMetrics,
        bookingMetrics,
        revenueMetrics,
        servicePerformance,
        geographicData,
        timestamp: new Date(),
        timeRange
      };
    } catch (error) {
      console.error('Error generating dashboard analytics:', error);
      throw error;
    }
  }

  // Get user metrics
  async getUserMetrics(startDate) {
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    const activeUsers = await AnalyticsEvent.distinct('userId', {
      timestamp: { $gte: startDate }
    }).then(users => users.length);

    const avgSessionDuration = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: 'session_ended',
          timestamp: { $gte: startDate },
          'eventData.duration': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$eventData.duration' }
        }
      }
    ]);

    return {
      totalUsers,
      newUsers,
      activeUsers,
      avgSessionDuration: avgSessionDuration[0]?.avgDuration || 0,
      userRetentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    };
  }

  // Get booking metrics
  async getBookingMetrics(startDate) {
    const totalBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate }
    });

    const completedBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate },
      status: 'completed'
    });

    const cancelledBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate },
      status: 'cancelled'
    });

    const conversionRate = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          eventType: { $in: ['service_view', 'booking_completed'] }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);

    const serviceViews = conversionRate.find(item => item._id === 'service_view')?.count || 0;
    const bookingCompletions = conversionRate.find(item => item._id === 'booking_completed')?.count || 0;

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
      conversionRate: serviceViews > 0 ? (bookingCompletions / serviceViews) * 100 : 0
    };
  }

  // Get revenue metrics
  async getRevenueMetrics(startDate) {
    const revenueData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          avgBookingValue: { $avg: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = revenueData[0] || {};

    return {
      totalRevenue: result.totalRevenue || 0,
      avgBookingValue: result.avgBookingValue || 0,
      totalTransactions: result.count || 0
    };
  }

  // Get service performance
  async getServicePerformance(startDate) {
    return await Service.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'serviceId',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          recentBookings: {
            $filter: {
              input: '$bookings',
              cond: { $gte: ['$$this.createdAt', startDate] }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          price: 1,
          rating: 1,
          bookingCount: { $size: '$recentBookings' },
          revenue: {
            $sum: {
              $map: {
                input: '$recentBookings',
                as: 'booking',
                in: '$$booking.totalAmount'
              }
            }
          }
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
  }

  // Get geographic distribution
  async getGeographicDistribution(startDate) {
    return await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          'location.address': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$location.address',
          count: { $sum: 1 },
          users: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          location: '$_id',
          eventCount: '$count',
          uniqueUsers: { $size: '$users' }
        }
      },
      {
        $sort: { eventCount: -1 }
      },
      {
        $limit: 20
      }
    ]);
  }

  // Forecast demand for services
  async forecastDemand(serviceId, days = 30) {
    try {
      // Get historical booking data
      const historicalData = await this.getHistoricalBookingData(serviceId, 90);
      
      if (historicalData.length < 30) {
        return { forecast: [], confidence: 0.3 };
      }

      // Prepare data for LSTM model
      const sequences = this.prepareTimeSeriesData(historicalData);
      
      const model = this.models.get('demand');
      if (!model) {
        return { forecast: [], confidence: 0.3 };
      }

      // Generate forecast
      const forecast = await this.generateForecast(model, sequences, days);
      
      return {
        forecast,
        confidence: this.calculateForecastConfidence(historicalData),
        historicalData: historicalData.slice(-30) // Last 30 days for context
      };
    } catch (error) {
      console.error('Error forecasting demand:', error);
      return { forecast: [], confidence: 0 };
    }
  }

  // Get historical booking data
  async getHistoricalBookingData(serviceId, days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Booking.aggregate([
      {
        $match: {
          serviceId: new mongoose.Types.ObjectId(serviceId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
  }

  // Helper methods
  getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '1d': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  prepareTimeSeriesData(data) {
    // Convert booking data to time series format for LSTM
    return data.map(item => [
      item.count,
      item.revenue,
      item._id.day,
      item._id.month,
      new Date(item._id.year, item._id.month - 1, item._id.day).getDay()
    ]);
  }

  calculateForecastConfidence(historicalData) {
    // Simple confidence calculation based on data consistency
    const counts = historicalData.map(d => d.count);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    
    // Higher consistency = higher confidence
    return Math.max(0, 1 - (stdDev / mean));
  }

  async generateForecast(model, sequences, days) {
    // Implement forecast generation logic
    // This is a simplified version - real implementation would be more complex
    const lastSequence = sequences.slice(-1)[0];
    const forecast = [];
    
    for (let i = 0; i < days; i++) {
      // Simple linear projection - replace with actual LSTM prediction
      const projected = lastSequence[0] * (0.9 + Math.random() * 0.2);
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        predictedBookings: Math.round(projected),
        confidence: 0.7
      });
    }
    
    return forecast;
  }
}

// Initialize service instance
const analyticsService = new AnalyticsService();

// Export service and models
module.exports = {
  analyticsService,
  AnalyticsEvent,
  UserBehavior
};
