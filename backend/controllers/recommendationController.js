const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

// AI Recommendation Algorithm
class RecommendationEngine {
  
  // Calculate user preferences based on booking history
  static async getUserPreferences(userId) {
    try {
      const user = await User.findById(userId);
      const bookingHistory = await Booking.find({
        customerId: userId,
        status: 'completed'
      }).populate('serviceId', 'category pricing.type');

      const preferences = {
        preferredCategories: {},
        budgetRange: { min: 0, max: 1000 },
        preferredPricingType: 'hourly',
        avgRating: 4.0
      };

      // Analyze booking history
      if (bookingHistory.length > 0) {
        // Category preferences
        bookingHistory.forEach(booking => {
          const category = booking.serviceId.category;
          preferences.preferredCategories[category] = 
            (preferences.preferredCategories[category] || 0) + 1;
        });

        // Budget analysis
        const completedBookings = bookingHistory.filter(b => b.pricing.finalCost);
        if (completedBookings.length > 0) {
          const costs = completedBookings.map(b => b.pricing.finalCost);
          preferences.budgetRange.min = Math.min(...costs) * 0.8;
          preferences.budgetRange.max = Math.max(...costs) * 1.2;
        }

        // Pricing type preference
        const pricingTypes = bookingHistory.map(b => b.serviceId.pricing.type);
        const pricingTypeCount = pricingTypes.reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        preferences.preferredPricingType = Object.keys(pricingTypeCount)
          .reduce((a, b) => pricingTypeCount[a] > pricingTypeCount[b] ? a : b);
      }

      // Use explicit preferences from user profile if available
      if (user.customerProfile?.preferences) {
        const userPrefs = user.customerProfile.preferences;
        if (userPrefs.preferredServiceTypes?.length > 0) {
          userPrefs.preferredServiceTypes.forEach(type => {
            preferences.preferredCategories[type] = 
              (preferences.preferredCategories[type] || 0) + 2;
          });
        }
        
        if (userPrefs.budgetRange) {
          preferences.budgetRange = userPrefs.budgetRange;
        }
      }

      return preferences;
    } catch (error) {
      console.error('Error calculating user preferences:', error);
      return null;
    }
  }

  // Calculate service score for user
  static calculateServiceScore(service, userPreferences, userLocation) {
    let score = 0;

    // Category preference score (40%)
    const categoryScore = userPreferences.preferredCategories[service.category] || 0;
    score += (categoryScore / 10) * 40;

    // Rating score (25%)
    const ratingScore = (service.rating.average / 5) * 25;
    score += ratingScore;

    // Price compatibility score (20%)
    if (service.pricing.type !== 'quote') {
      const servicePrice = service.pricing.amount;
      const { min, max } = userPreferences.budgetRange;
      
      if (servicePrice >= min && servicePrice <= max) {
        score += 20;
      } else if (servicePrice < min) {
        score += 15; // Still good if cheaper
      } else {
        score += Math.max(0, 20 - ((servicePrice - max) / max) * 20);
      }
    } else {
      score += 15; // Neutral score for quote-based services
    }

    // Provider experience score (10%)
    const provider = service.providerId;
    if (provider && provider.providerProfile) {
      const experienceYears = provider.providerProfile.experienceYears || 0;
      score += Math.min(experienceYears, 10);
    }

    // Availability bonus (5%)
    if (service.availability.emergencyAvailable) {
      score += 2.5;
    }
    if (service.availability.workingDays.length >= 6) {
      score += 2.5;
    }

    // Location proximity bonus (would need geocoding in production)
    // For now, just add a small random factor
    score += Math.random() * 5;

    return Math.min(score, 100); // Cap at 100
  }

  // Get similar users (collaborative filtering)
  static async getSimilarUsers(userId, limit = 10) {
    try {
      const userBookings = await Booking.find({
        customerId: userId,
        status: 'completed'
      }).populate('serviceId', 'category');

      const userCategories = userBookings.map(b => b.serviceId.category);
      
      // Find users with similar booking patterns
      const similarUsers = await Booking.aggregate([
        {
          $match: {
            customerId: { $ne: userId },
            status: 'completed'
          }
        },
        {
          $lookup: {
            from: 'services',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'service'
          }
        },
        {
          $group: {
            _id: '$customerId',
            categories: { $push: { $arrayElemAt: ['$service.category', 0] } },
            bookingCount: { $sum: 1 }
          }
        },
        {
          $match: {
            categories: { $in: userCategories },
            bookingCount: { $gte: 2 }
          }
        },
        { $limit: limit }
      ]);

      return similarUsers.map(u => u._id);
    } catch (error) {
      console.error('Error finding similar users:', error);
      return [];
    }
  }
}

// @desc    Get personalized service recommendations
// @route   GET /api/recommendations/services
// @access  Private
const getServiceRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    const { category, limit = 10, location } = req.query;

    // Get user preferences
    const userPreferences = await RecommendationEngine.getUserPreferences(userId);
    
    if (!userPreferences) {
      return res.status(500).json({
        success: false,
        message: 'Error calculating recommendations'
      });
    }

    // Build query for services
    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    // Get services with populated provider data
    const services = await Service.find(query)
      .populate('providerId', 'name avatar providerProfile')
      .limit(parseInt(limit) * 2); // Get more to filter and rank

    // Calculate scores and rank services
    const scoredServices = services.map(service => ({
      ...service.toObject(),
      recommendationScore: RecommendationEngine.calculateServiceScore(
        service, 
        userPreferences, 
        location
      )
    }));

    // Sort by score and take top results
    const recommendations = scoredServices
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, parseInt(limit))
      .map(service => ({
        id: service._id,
        title: service.title,
        description: service.description,
        category: service.category,
        pricing: service.pricing,
        rating: service.rating,
        provider: {
          id: service.providerId._id,
          name: service.providerId.name,
          avatar: service.providerId.avatar,
          rating: service.providerId.providerProfile?.rating
        },
        images: service.images,
        recommendationScore: Math.round(service.recommendationScore),
        reasonForRecommendation: generateRecommendationReason(service, userPreferences)
      }));

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        userPreferences: {
          topCategories: Object.keys(userPreferences.preferredCategories)
            .sort((a, b) => userPreferences.preferredCategories[b] - userPreferences.preferredCategories[a])
            .slice(0, 3),
          budgetRange: userPreferences.budgetRange
        },
        total: recommendations.length
      }
    });

  } catch (error) {
    console.error('Service recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting service recommendations'
    });
  }
};

// @desc    Get provider recommendations
// @route   GET /api/recommendations/providers
// @access  Private
const getProviderRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    const { category, limit = 5 } = req.query;

    // Get user preferences
    const userPreferences = await RecommendationEngine.getUserPreferences(userId);

    // Find top-rated providers in preferred categories
    let matchStage = {
      userType: 'provider',
      isActive: true,
      'providerProfile.verification.backgroundCheck.status': 'approved'
    };

    if (category) {
      matchStage['providerProfile.serviceCategories'] = category;
    }

    const providers = await User.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          avgRating: '$providerProfile.rating.average',
          totalReviews: '$providerProfile.rating.totalReviews',
          experienceYears: '$providerProfile.experienceYears'
        }
      },
      {
        $addFields: {
          recommendationScore: {
            $add: [
              { $multiply: ['$avgRating', 20] }, // Rating weight
              { $multiply: [{ $min: ['$experienceYears', 10] }, 5] }, // Experience weight
              { $multiply: [{ $min: ['$totalReviews', 100] }, 0.3] } // Review count weight
            ]
          }
        }
      },
      { $sort: { recommendationScore: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: 1,
          avatar: 1,
          'providerProfile.rating': 1,
          'providerProfile.serviceCategories': 1,
          'providerProfile.experienceYears': 1,
          'providerProfile.description': 1,
          recommendationScore: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        providers: providers.map(provider => ({
          ...provider,
          recommendationScore: Math.round(provider.recommendationScore)
        })),
        total: providers.length
      }
    });

  } catch (error) {
    console.error('Provider recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting provider recommendations'
    });
  }
};

// @desc    Get trending services
// @route   GET /api/recommendations/trending
// @access  Public
const getTrendingServices = async (req, res) => {
  try {
    const { limit = 10, timeframe = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Get services with most bookings in timeframe
    const trendingServices = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['confirmed', 'in-progress', 'completed'] }
        }
      },
      {
        $group: {
          _id: '$serviceId',
          bookingCount: { $sum: 1 },
          avgRating: { $avg: '$review.rating' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'service.providerId',
          foreignField: '_id',
          as: 'provider'
        }
      },
      {
        $project: {
          service: { $arrayElemAt: ['$service', 0] },
          provider: { $arrayElemAt: ['$provider', 0] },
          bookingCount: 1,
          avgRating: 1
        }
      }
    ]);

    const formattedServices = trendingServices.map(item => ({
      id: item.service._id,
      title: item.service.title,
      category: item.service.category,
      pricing: item.service.pricing,
      rating: item.service.rating,
      provider: {
        name: item.provider.name,
        avatar: item.provider.avatar
      },
      trendingScore: item.bookingCount,
      recentBookings: item.bookingCount
    }));

    res.status(200).json({
      success: true,
      data: {
        trendingServices: formattedServices,
        timeframe: `${timeframe} days`,
        total: formattedServices.length
      }
    });

  } catch (error) {
    console.error('Trending services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting trending services'
    });
  }
};

// Generate reason for recommendation
const generateRecommendationReason = (service, userPreferences) => {
  const reasons = [];

  // Category preference
  if (userPreferences.preferredCategories[service.category] >= 2) {
    reasons.push(`You frequently book ${service.category} services`);
  }

  // High rating
  if (service.rating.average >= 4.5) {
    reasons.push('Highly rated by customers');
  }

  // Budget friendly
  if (service.pricing.type !== 'quote' && 
      service.pricing.amount <= userPreferences.budgetRange.max) {
    reasons.push('Within your budget range');
  }

  // Emergency availability
  if (service.availability.emergencyAvailable) {
    reasons.push('Available for emergency services');
  }

  return reasons.length > 0 ? reasons[0] : 'Recommended for you';
};

module.exports = {
  getServiceRecommendations,
  getProviderRecommendations,
  getTrendingServices
};
