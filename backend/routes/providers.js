const express = require('express');
const { query } = require('express-validator');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/providers
// @desc    Get all providers with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('city').optional().isString().withMessage('City must be a string'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Min rating must be between 0 and 5'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('verified').optional().isBoolean().withMessage('Verified must be a boolean')
], optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      city,
      state,
      minRating,
      search,
      verified,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filters = {
      isActive: true,
      userType: 'provider'
    };

    if (category) {
      filters['providerProfile.serviceCategories'] = category;
    }

    if (city) {
      filters['address.city'] = new RegExp(city, 'i');
    }

    if (state) {
      filters['address.state'] = new RegExp(state, 'i');
    }

    if (minRating) {
      filters['providerProfile.rating.average'] = { $gte: parseFloat(minRating) };
    }

    if (verified === 'true') {
      filters.isVerified = true;
    } else if (verified === 'false') {
      filters.isVerified = false;
    }

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'providerProfile.businessName': { $regex: search, $options: 'i' } },
        { 'providerProfile.description': { $regex: search, $options: 'i' } },
        { 'providerProfile.serviceCategories': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions['providerProfile.rating.average'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'experience') {
      sortOptions['providerProfile.experienceYears'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'reviews') {
      sortOptions['providerProfile.rating.totalReviews'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'newest') {
      sortOptions['createdAt'] = -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const providers = await User.find(filters)
      .select('name avatar address providerProfile isVerified createdAt')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await User.countDocuments(filters);

    // Add computed fields
    const formattedProviders = providers.map(provider => ({
      ...provider,
      rating: provider.providerProfile?.rating || { average: 0, totalReviews: 0 },
      serviceCount: 0 // This could be populated with actual service count
    }));

    // Get service counts for each provider
    for (let provider of formattedProviders) {
      const serviceCount = await Service.countDocuments({
        providerId: provider._id,
        isActive: true
      });
      provider.serviceCount = serviceCount;
    }

    res.json({
      success: true,
      data: {
        providers: formattedProviders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching providers'
    });
  }
});

// @route   GET /api/providers/featured
// @desc    Get featured providers
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const providers = await User.find({
      isActive: true,
      userType: 'provider',
      isVerified: true,
      'providerProfile.rating.average': { $gte: 4.0 }
    })
      .select('name avatar address providerProfile isVerified createdAt')
      .sort({ 'providerProfile.rating.average': -1, 'providerProfile.rating.totalReviews': -1 })
      .limit(parseInt(limit))
      .lean();

    // Add service counts
    for (let provider of providers) {
      const serviceCount = await Service.countDocuments({
        providerId: provider._id,
        isActive: true
      });
      provider.serviceCount = serviceCount;
    }

    res.json({
      success: true,
      data: {
        providers
      }
    });

  } catch (error) {
    console.error('Get featured providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured providers'
    });
  }
});

// @route   GET /api/providers/by-category
// @desc    Get providers grouped by categories
// @access  Public
router.get('/by-category', async (req, res) => {
  try {
    const categories = await User.aggregate([
      {
        $match: {
          isActive: true,
          userType: 'provider',
          'providerProfile.serviceCategories': { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$providerProfile.serviceCategories' },
      {
        $group: {
          _id: '$providerProfile.serviceCategories',
          count: { $sum: 1 },
          avgRating: { $avg: '$providerProfile.rating.average' },
          providers: {
            $push: {
              _id: '$_id',
              name: '$name',
              avatar: '$avatar',
              rating: '$providerProfile.rating',
              isVerified: '$isVerified'
            }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const categoryMap = {
      'cleaning': { name: 'Cleaning', icon: '🧹' },
      'plumbing': { name: 'Plumbing', icon: '🔧' },
      'electrical': { name: 'Electrical', icon: '⚡' },
      'hvac': { name: 'HVAC', icon: '❄️' },
      'painting': { name: 'Painting', icon: '🎨' },
      'carpentry': { name: 'Carpentry', icon: '🔨' },
      'gardening': { name: 'Gardening', icon: '🌱' },
      'pest-control': { name: 'Pest Control', icon: '🐛' },
      'appliance-repair': { name: 'Appliance Repair', icon: '🔧' },
      'handyman': { name: 'Handyman', icon: '🛠️' },
      'other': { name: 'Other', icon: '📋' }
    };

    const formattedCategories = categories.map(cat => ({
      id: cat._id,
      name: categoryMap[cat._id]?.name || cat._id,
      icon: categoryMap[cat._id]?.icon || '📋',
      count: cat.count,
      averageRating: Math.round(cat.avgRating * 10) / 10,
      topProviders: cat.providers.slice(0, 3)
    }));

    res.json({
      success: true,
      data: {
        categories: formattedCategories
      }
    });

  } catch (error) {
    console.error('Get providers by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching providers by category'
    });
  }
});

// @route   GET /api/providers/:id
// @desc    Get provider details by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const provider = await User.findById(req.params.id)
      .select('-password');

    if (!provider || provider.userType !== 'provider' || !provider.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Get provider's services
    const services = await Service.find({
      providerId: provider._id,
      isActive: true
    })
      .select('title description category pricing rating images featured')
      .sort({ featured: -1, 'rating.average': -1 })
      .limit(10);

    // Get recent reviews
    const recentBookings = await Booking.find({
      providerId: provider._id,
      status: 'completed',
      'review.rating': { $exists: true }
    })
      .populate('customerId', 'name avatar')
      .populate('serviceId', 'title')
      .select('review serviceId customerId createdAt')
      .sort({ 'review.reviewDate': -1 })
      .limit(10);

    const reviews = recentBookings.map(booking => ({
      _id: booking._id,
      rating: booking.review.rating,
      comment: booking.review.comment,
      reviewDate: booking.review.reviewDate,
      customer: booking.customerId,
      service: booking.serviceId,
      response: booking.review.response
    }));

    // Calculate additional stats
    const stats = await Booking.aggregate([
      { $match: { providerId: provider._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalCompletedJobs: { $sum: 1 },
          averageResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const providerStats = stats[0] || { totalCompletedJobs: 0, averageResponseTime: 0 };

    const providerResponse = {
      ...provider.toObject(),
      services,
      reviews,
      stats: {
        ...providerStats,
        totalServices: services.length,
        averageRating: provider.providerProfile?.rating?.average || 0,
        totalReviews: provider.providerProfile?.rating?.totalReviews || 0
      }
    };

    // Remove sensitive information
    delete providerResponse.providerProfile?.verification;

    res.json({
      success: true,
      data: {
        provider: providerResponse
      }
    });

  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching provider'
    });
  }
});

// @route   GET /api/providers/:id/services
// @desc    Get all services by a provider
// @access  Public
router.get('/:id/services', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;

    // Verify provider exists
    const provider = await User.findById(req.params.id);
    if (!provider || provider.userType !== 'provider' || !provider.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const filters = {
      providerId: req.params.id,
      isActive: true
    };

    if (category) {
      filters.category = category;
    }

    const services = await Service.find(filters)
      .populate('providerId', 'name avatar providerProfile.rating')
      .sort({ featured: -1, 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(filters);

    const formattedServices = services.map(service => ({
      ...service.toObject(),
      startingPrice: service.pricing.type === 'quote' ? 'Get Quote' : 
        `$${service.pricing.amount}${service.pricing.type === 'hourly' ? '/hr' : ''}`,
      primaryImage: service.images?.find(img => img.isPrimary)?.url || service.images?.[0]?.url
    }));

    res.json({
      success: true,
      data: {
        services: formattedServices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get provider services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching provider services'
    });
  }
});

// @route   GET /api/providers/:id/reviews
// @desc    Get all reviews for a provider
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;

    // Verify provider exists
    const provider = await User.findById(req.params.id);
    if (!provider || provider.userType !== 'provider' || !provider.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const filters = {
      providerId: req.params.id,
      status: 'completed',
      'review.rating': { $exists: true }
    };

    if (rating) {
      filters['review.rating'] = parseInt(rating);
    }

    const bookings = await Booking.find(filters)
      .populate('customerId', 'name avatar')
      .populate('serviceId', 'title category')
      .select('review serviceId customerId createdAt')
      .sort({ 'review.reviewDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(filters);

    const reviews = bookings.map(booking => ({
      _id: booking._id,
      rating: booking.review.rating,
      comment: booking.review.comment,
      reviewDate: booking.review.reviewDate,
      customer: booking.customerId,
      service: booking.serviceId,
      response: booking.review.response
    }));

    // Get rating distribution
    const ratingDistribution = await Booking.aggregate([
      {
        $match: {
          providerId: provider._id,
          status: 'completed',
          'review.rating': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$review.rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        ratingDistribution,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching provider reviews'
    });
  }
});

// @route   GET /api/providers/:id/availability
// @desc    Get provider availability for a date range
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Verify provider exists
    const provider = await User.findById(req.params.id);
    if (!provider || provider.userType !== 'provider' || !provider.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get existing bookings in the date range
    const existingBookings = await Booking.find({
      providerId: req.params.id,
      scheduledDate: {
        $gte: start,
        $lte: end
      },
      status: { $in: ['confirmed', 'in-progress'] }
    }).select('scheduledDate scheduledTime');

    // Get provider's general availability from profile
    const availability = provider.providerProfile?.availability || {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: { start: '09:00', end: '17:00' }
    };

    // Generate available time slots (this is a simplified version)
    const availableSlots = [];
    const current = new Date(start);

    while (current <= end) {
      const dayName = current.toLocaleDateString('en-US', { weekday: 'lowercase' });
      
      if (availability.workingDays.includes(dayName)) {
        // Check if there are any bookings for this date
        const dayBookings = existingBookings.filter(booking => 
          booking.scheduledDate.toDateString() === current.toDateString()
        );

        // For simplicity, mark the day as available if no bookings
        const isAvailable = dayBookings.length === 0;

        availableSlots.push({
          date: current.toISOString().split('T')[0],
          available: isAvailable,
          workingHours: availability.workingHours,
          bookedSlots: dayBookings.map(booking => booking.scheduledTime)
        });
      }

      current.setDate(current.getDate() + 1);
    }

    res.json({
      success: true,
      data: {
        availability: availableSlots,
        generalAvailability: availability
      }
    });

  } catch (error) {
    console.error('Get provider availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching provider availability'
    });
  }
});


module.exports = router;
