const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  createReview,
  getReviews,
  getReview,
  updateReview,
  respondToReview,
  toggleHelpfulness,
  flagReview,
  getTrendingReviews,
  getMyReviews
} = require('../controllers/reviewController');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/',
  authenticateToken,
  [
    body('bookingId').isString().withMessage('Booking ID must be provided'),
    body('providerId').isString().withMessage('Provider ID must be provided'),
    body('serviceId').isString().withMessage('Service ID must be provided'),
    body('rating.overall').isFloat({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
    body('rating.quality').optional().isFloat({ min: 1, max: 5 }).withMessage('Quality rating must be between 1 and 5'),
    body('rating.punctuality').optional().isFloat({ min: 1, max: 5 }).withMessage('Punctuality rating must be between 1 and 5'),
    body('rating.professionalism').optional().isFloat({ min: 1, max: 5 }).withMessage('Professionalism rating must be between 1 and 5'),
    body('rating.value').optional().isFloat({ min: 1, max: 5 }).withMessage('Value rating must be between 1 and 5'),
    body('comment').isString().isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),
    body('images').optional().isArray().withMessage('Images must be an array')
  ],
  createReview
);

// @route   GET /api/reviews
// @desc    Get reviews with filtering and pagination
// @access  Public
router.get('/',
  [
    query('providerId').optional().isString().withMessage('Provider ID must be a string'),
    query('serviceId').optional().isString().withMessage('Service ID must be a string'),
    query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ gt: 0, lt: 51 }).withMessage('Limit must be between 1 and 50'),
    query('sortBy').optional().isString().withMessage('Sort by must be a string'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating filter must be between 1 and 5'),
    query('verified').optional().isBoolean().withMessage('Verified must be a boolean')
  ],
  getReviews
);

// @route   GET /api/reviews/trending
// @desc    Get trending reviews
// @access  Public
router.get('/trending',
  [
    query('limit').optional().isInt({ gt: 0, lt: 51 }).withMessage('Limit must be between 1 and 50'),
    query('period').optional().isInt({ gt: 0 }).withMessage('Period must be a positive integer')
  ],
  getTrendingReviews
);

// @route   GET /api/reviews/my-reviews
// @desc    Get user's own reviews (written or received)
// @access  Private
router.get('/my-reviews',
  authenticateToken,
  [
    query('type').optional().isIn(['written', 'received']).withMessage('Type must be written or received'),
    query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ gt: 0, lt: 51 }).withMessage('Limit must be between 1 and 50')
  ],
  getMyReviews
);

// @route   GET /api/reviews/:reviewId
// @desc    Get single review by ID
// @access  Public
router.get('/:reviewId',
  [
    param('reviewId').isString().withMessage('Review ID must be provided')
  ],
  getReview
);

// @route   PUT /api/reviews/:reviewId
// @desc    Update a review
// @access  Private
router.put('/:reviewId',
  authenticateToken,
  [
    param('reviewId').isString().withMessage('Review ID must be provided'),
    body('rating.overall').optional().isFloat({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
    body('rating.quality').optional().isFloat({ min: 1, max: 5 }).withMessage('Quality rating must be between 1 and 5'),
    body('rating.punctuality').optional().isFloat({ min: 1, max: 5 }).withMessage('Punctuality rating must be between 1 and 5'),
    body('rating.professionalism').optional().isFloat({ min: 1, max: 5 }).withMessage('Professionalism rating must be between 1 and 5'),
    body('rating.value').optional().isFloat({ min: 1, max: 5 }).withMessage('Value rating must be between 1 and 5'),
    body('comment').optional().isString().isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),
    body('images').optional().isArray().withMessage('Images must be an array')
  ],
  updateReview
);

// @route   POST /api/reviews/:reviewId/respond
// @desc    Respond to a review (provider only)
// @access  Private
router.post('/:reviewId/respond',
  authenticateToken,
  [
    param('reviewId').isString().withMessage('Review ID must be provided'),
    body('response').isString().isLength({ min: 10, max: 500 }).withMessage('Response must be between 10 and 500 characters')
  ],
  respondToReview
);

// @route   POST /api/reviews/:reviewId/helpful
// @desc    Mark review as helpful or unhelpful
// @access  Private
router.post('/:reviewId/helpful',
  authenticateToken,
  [
    param('reviewId').isString().withMessage('Review ID must be provided'),
    body('helpful').isBoolean().withMessage('Helpful must be a boolean value')
  ],
  toggleHelpfulness
);

// @route   POST /api/reviews/:reviewId/flag
// @desc    Flag a review for moderation
// @access  Private
router.post('/:reviewId/flag',
  authenticateToken,
  [
    param('reviewId').isString().withMessage('Review ID must be provided'),
    body('reason').isIn(['spam', 'inappropriate', 'fake', 'offensive', 'other']).withMessage('Reason must be one of: spam, inappropriate, fake, offensive, other'),
    body('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
  ],
  flagReview
);

module.exports = router;
