const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Service = require('../models/Service');
const { auth, requireProvider, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('city').optional().isString().withMessage('City must be a string'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
  query('search').optional().isString().withMessage('Search must be a string')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      category,
      city,
      state,
      minPrice,
      maxPrice,
      search,
      featured,
      sortBy = 'rating.average',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filters = { isActive: true };

    if (category) {
      filters.category = category;
    }

    if (city || state) {
      filters['serviceAreas'] = { $elemMatch: {} };
      if (city) filters['serviceAreas']['$elemMatch']['city'] = new RegExp(city, 'i');
      if (state) filters['serviceAreas']['$elemMatch']['state'] = new RegExp(state, 'i');
    }

    if (minPrice || maxPrice) {
      filters['pricing.amount'] = {};
      if (minPrice) filters['pricing.amount']['$gte'] = parseFloat(minPrice);
      if (maxPrice) filters['pricing.amount']['$lte'] = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      filters.featured = true;
    }

    // Search functionality
    let query = Service.find(filters);

    if (search) {
      query = Service.searchServices(search, filters);
    } else {
      query = Service.find(filters);
    }

    // Sort
    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions['pricing.amount'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'rating') {
      sortOptions['rating.average'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'newest') {
      sortOptions['createdAt'] = -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query with pagination
    const services = await query
      .populate('providerId', 'name avatar providerProfile.rating address isVerified')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Service.countDocuments(search ? 
      Service.searchServices(search, filters).getQuery() : filters);

    // Add virtual fields and format response
    const formattedServices = services.map(service => ({
      ...service,
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
          totalItems: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching services'
    });
  }
});

// @route   GET /api/services/featured
// @desc    Get featured services
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const featuredServices = await Service.getFeatured(parseInt(limit));

    const formattedServices = featuredServices.map(service => ({
      ...service.toObject(),
      startingPrice: service.pricing.type === 'quote' ? 'Get Quote' : 
        `$${service.pricing.amount}${service.pricing.type === 'hourly' ? '/hr' : ''}`,
      primaryImage: service.images?.find(img => img.isPrimary)?.url || service.images?.[0]?.url
    }));

    res.json({
      success: true,
      data: {
        services: formattedServices
      }
    });

  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured services'
    });
  }
});

// @route   GET /api/services/categories
// @desc    Get service categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
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
      count: cat.count
    }));

    res.json({
      success: true,
      data: {
        categories: formattedCategories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/services/:id
// @desc    Get service by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('providerId', 'name avatar address phone providerProfile isVerified createdAt');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (!service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service is not available'
      });
    }

    // Increment view count
    await Service.findByIdAndUpdate(req.params.id, {
      $inc: { 'stats.views': 1 }
    });

    const serviceResponse = {
      ...service.toObject(),
      startingPrice: service.pricing.type === 'quote' ? 'Get Quote' : 
        `$${service.pricing.amount}${service.pricing.type === 'hourly' ? '/hr' : ''}`,
      primaryImage: service.images?.find(img => img.isPrimary)?.url || service.images?.[0]?.url
    };

    res.json({
      success: true,
      data: {
        service: serviceResponse
      }
    });

  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service'
    });
  }
});

// @route   POST /api/services
// @desc    Create a new service (Provider only)
// @access  Private (Provider)
router.post('/', auth, requireProvider, [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['cleaning', 'plumbing', 'electrical', 'hvac', 'painting', 'carpentry', 'gardening', 'pest-control', 'appliance-repair', 'handyman', 'other'])
    .withMessage('Invalid category'),
  body('pricing.type')
    .isIn(['hourly', 'fixed', 'quote'])
    .withMessage('Pricing type must be hourly, fixed, or quote'),
  body('pricing.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price amount must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const serviceData = {
      ...req.body,
      providerId: req.userId
    };

    // Validate pricing based on type
    if (serviceData.pricing.type !== 'quote' && !serviceData.pricing.amount) {
      return res.status(400).json({
        success: false,
        message: 'Price amount is required for hourly and fixed pricing'
      });
    }

    const service = new Service(serviceData);
    await service.save();

    const populatedService = await Service.findById(service._id)
      .populate('providerId', 'name avatar address');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: {
        service: populatedService
      }
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating service'
    });
  }
});

// @route   PUT /api/services/:id
// @desc    Update service (Provider only - own services)
// @access  Private (Provider)
router.put('/:id', auth, requireProvider, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('pricing.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price amount must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns this service
    if (service.providerId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own services.'
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('providerId', 'name avatar address');

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: {
        service: updatedService
      }
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating service'
    });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete service (Provider only - own services)
// @access  Private (Provider)
router.delete('/:id', auth, requireProvider, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check if user owns this service
    if (service.providerId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own services.'
      });
    }

    // Soft delete by setting isActive to false
    await Service.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting service'
    });
  }
});

// @route   GET /api/services/provider/:providerId
// @desc    Get all services by a specific provider
// @access  Public
router.get('/provider/:providerId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const services = await Service.find({
      providerId: req.params.providerId,
      isActive: true
    })
      .populate('providerId', 'name avatar providerProfile.rating')
      .sort({ featured: -1, 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments({
      providerId: req.params.providerId,
      isActive: true
    });

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

module.exports = router;
