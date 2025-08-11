const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const { validationResult } = require('express-validator');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      bookingId,
      providerId,
      serviceId,
      rating,
      comment,
      images
    } = req.body;
    const customerId = req.userId;

    // Verify booking exists and belongs to customer
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customerId.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to review this booking'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Create review
    const review = new Review({
      bookingId,
      customerId,
      providerId,
      serviceId,
      rating,
      comment,
      images: images || []
    });

    await review.save();

    // Populate review data for response
    await review.populate([
      { path: 'customerId', select: 'name profilePicture' },
      { path: 'providerId', select: 'name profilePicture' },
      { path: 'serviceId', select: 'name category' },
      { path: 'bookingId', select: 'bookingNumber serviceDetails' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review
      }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating review'
    });
  }
};

// @desc    Get reviews for a provider/service
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const {
      providerId,
      serviceId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      rating,
      verified
    } = req.query;

    // Build query
    let query = { status: 'published' };
    
    if (providerId) query.providerId = providerId;
    if (serviceId) query.serviceId = serviceId;
    if (rating) query['rating.overall'] = rating;
    if (verified === 'true') query['verification.isVerified'] = true;

    // Get reviews
    const reviews = await Review.find(query)
      .populate('customerId', 'name profilePicture')
      .populate('providerId', 'name profilePicture')
      .populate('serviceId', 'name category')
      .populate('bookingId', 'bookingNumber serviceDetails')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Get statistics
    const stats = await Review.getStatistics(providerId, serviceId);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        statistics: stats[0] || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {}
        },
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting reviews'
    });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:reviewId
// @access  Public
const getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({ reviewId })
      .populate('customerId', 'name profilePicture')
      .populate('providerId', 'name profilePicture')
      .populate('serviceId', 'name category')
      .populate('bookingId', 'bookingNumber serviceDetails');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        review
      }
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting review'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:reviewId
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.userId;

    const review = await Review.findOne({ reviewId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only customer who created review can update it
    if (review.customerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this review'
      });
    }

    // Check if review is still editable (within 24 hours)
    const reviewAge = Date.now() - review.createdAt.getTime();
    const maxEditTime = 24 * 60 * 60 * 1000; // 24 hours
    
    if (reviewAge > maxEditTime) {
      return res.status(400).json({
        success: false,
        message: 'Review can only be edited within 24 hours of creation'
      });
    }

    // Update review
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (images) review.images = images;
    
    review.updatedAt = new Date();
    await review.save();

    await review.populate([
      { path: 'customerId', select: 'name profilePicture' },
      { path: 'providerId', select: 'name profilePicture' },
      { path: 'serviceId', select: 'name category' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review
      }
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating review'
    });
  }
};

// @desc    Respond to review (provider only)
// @route   POST /api/reviews/:reviewId/respond
// @access  Private
const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    const providerId = req.userId;

    const review = await Review.findOne({ reviewId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only the provider who received the review can respond
    if (review.providerId.toString() !== providerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to respond to this review'
      });
    }

    // Verify user is a provider
    const user = await User.findById(providerId);
    if (!user || user.userType !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Only providers can respond to reviews'
      });
    }

    // Add response
    review.response = {
      message: response,
      respondedAt: new Date(),
      respondedBy: providerId
    };

    await review.save();

    await review.populate([
      { path: 'customerId', select: 'name profilePicture' },
      { path: 'providerId', select: 'name profilePicture' },
      { path: 'response.respondedBy', select: 'name profilePicture' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: {
        review
      }
    });

  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error responding to review'
    });
  }
};

// @desc    Mark review as helpful/unhelpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
const toggleHelpfulness = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body; // true for helpful, false for unhelpful
    const userId = req.userId;

    const review = await Review.findOne({ reviewId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.markHelpful(userId, helpful);

    res.status(200).json({
      success: true,
      message: helpful ? 'Review marked as helpful' : 'Review marked as unhelpful',
      data: {
        helpfulnessScore: review.helpfulnessScore
      }
    });

  } catch (error) {
    console.error('Toggle helpfulness error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating helpfulness'
    });
  }
};

// @desc    Flag review
// @route   POST /api/reviews/:reviewId/flag
// @access  Private
const flagReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    const userId = req.userId;

    const review = await Review.findOne({ reviewId });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.flagReview(userId, reason, description);

    res.status(200).json({
      success: true,
      message: 'Review flagged successfully'
    });

  } catch (error) {
    console.error('Flag review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error flagging review'
    });
  }
};

// @desc    Get trending reviews
// @route   GET /api/reviews/trending
// @access  Public
const getTrendingReviews = async (req, res) => {
  try {
    const { limit = 10, period = 30 } = req.query;

    const trendingReviews = await Review.getTrending(period, limit);

    res.status(200).json({
      success: true,
      data: {
        reviews: trendingReviews,
        period: `${period} days`
      }
    });

  } catch (error) {
    console.error('Get trending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting trending reviews'
    });
  }
};

// @desc    Get user's reviews (customer or provider)
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const userId = req.userId;
    const { type = 'written', page = 1, limit = 10 } = req.query;

    let query = {};
    if (type === 'written') {
      query.customerId = userId;
    } else if (type === 'received') {
      query.providerId = userId;
    }

    const reviews = await Review.find(query)
      .populate('customerId', 'name profilePicture')
      .populate('providerId', 'name profilePicture')
      .populate('serviceId', 'name category')
      .populate('bookingId', 'bookingNumber serviceDetails')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        type,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting reviews'
    });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReview,
  updateReview,
  respondToReview,
  toggleHelpfulness,
  flagReview,
  getTrendingReviews,
  getMyReviews
};
