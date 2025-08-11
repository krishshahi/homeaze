const express = require('express');
const { body, query, param } = require('express-validator');
const { authenticateToken } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// Middleware to check if user is customer
const requireCustomer = (req, res, next) => {
  if (req.user.userType !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer role required.'
    });
  }
  next();
};

// Middleware to check if user is provider
const requireProvider = (req, res, next) => {
  if (req.user.userType !== 'provider') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Provider role required.'
    });
  }
  next();
};

// @route   POST /api/bookings
// @desc    Create a new booking (Customer only)
// @access  Private (Customer)
router.post('/', 
  authenticateToken, 
  requireCustomer, 
  [
    body('serviceId').isMongoId().withMessage('Valid service ID is required'),
    body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
    body('scheduledTime.start').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:MM)'),
    body('scheduledTime.end').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:MM)'),
    body('location.address.street').trim().notEmpty().withMessage('Street address is required'),
    body('location.address.city').trim().notEmpty().withMessage('City is required'),
    body('location.address.state').trim().notEmpty().withMessage('State is required'),
    body('location.address.zipCode').trim().notEmpty().withMessage('ZIP code is required'),
    body('payment.method').isIn(['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer']).withMessage('Valid payment method required')
  ],
  bookingController.createBooking
);

// @route   GET /api/bookings
// @desc    Get user's bookings (Customer or Provider)
// @access  Private
router.get('/',
  authenticateToken,
  [
    query('status').optional().isString().withMessage('Status must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  bookingController.getBookings
);

// @route   GET /api/bookings/:bookingId
// @desc    Get single booking details
// @access  Private (Customer or Provider involved in booking)
router.get('/:bookingId',
  authenticateToken,
  [
    param('bookingId').isMongoId().withMessage('Valid booking ID is required')
  ],
  bookingController.getBookingById
);

// @route   PUT /api/bookings/:bookingId/status
// @desc    Update booking status (Provider confirms/rejects booking)
// @access  Private (Provider)
router.put('/:bookingId/status',
  authenticateToken,
  requireProvider,
  [
    param('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('status').isIn(['confirmed', 'cancelled']).withMessage('Status must be confirmed or cancelled'),
    body('providerNotes').optional().isString().withMessage('Provider notes must be a string')
  ],
  bookingController.updateBookingStatus
);

// @route   PUT /api/bookings/:bookingId/start
// @desc    Start service (Provider marks as in-progress)
// @access  Private (Provider)
router.put('/:bookingId/start',
  authenticateToken,
  requireProvider,
  [
    param('bookingId').isMongoId().withMessage('Valid booking ID is required')
  ],
  bookingController.startService
);

// @route   PUT /api/bookings/:bookingId/complete
// @desc    Complete service (Provider marks as completed)
// @access  Private (Provider)
router.put('/:bookingId/complete',
  authenticateToken,
  requireProvider,
  [
    param('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('workPerformed').optional().isString().withMessage('Work performed must be a string'),
    body('materialUsed').optional().isArray().withMessage('Material used must be an array'),
    body('finalCost').optional().isNumeric().withMessage('Final cost must be a number'),
    body('beforeImages').optional().isArray().withMessage('Before images must be an array'),
    body('afterImages').optional().isArray().withMessage('After images must be an array'),
    body('additionalNotes').optional().isString().withMessage('Additional notes must be a string')
  ],
  bookingController.completeService
);

// @route   PUT /api/bookings/:bookingId/cancel
// @desc    Cancel booking (Both customer and provider can cancel)
// @access  Private
router.put('/:bookingId/cancel',
  authenticateToken,
  [
    param('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('reason').trim().notEmpty().withMessage('Reason for cancellation is required')
  ],
  bookingController.cancelBooking
);

// @route   POST /api/bookings/:bookingId/messages
// @desc    Add message to booking communication
// @access  Private (Customer or Provider involved in booking)
router.post('/:bookingId/messages',
  authenticateToken,
  [
    param('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array')
  ],
  bookingController.addMessage
);

// @route   GET /api/bookings/:bookingId/messages
// @desc    Get booking messages
// @access  Private (Customer or Provider involved in booking)
router.get('/:bookingId/messages',
  authenticateToken,
  [
    param('bookingId').isMongoId().withMessage('Valid booking ID is required')
  ],
  bookingController.getMessages
);

module.exports = router;
