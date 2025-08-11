const express = require('express');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const {
  processPayment,
  getPayment,
  getPaymentHistory,
  processRefund,
  getPaymentStats,
  createPaymentIntent,
} = require('../controllers/paymentController');

const router = express.Router();

// @route   POST /api/payments/process
// @desc    Process a new payment
// @access  Private
router.post('/process',
  auth,
  [
    body('bookingId').isString().withMessage('Booking ID must be provided'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('paymentMethod').isString().withMessage('Payment method must be provided'),
  ],
  processPayment
);

// @route   GET /api/payments/:paymentId
// @desc    Get payment details
// @access  Private
router.get('/:paymentId',
  auth,
  [
    param('paymentId').isString().withMessage('Payment ID must be provided'),
  ],
  getPayment
);

// @route   GET /api/payments/history
// @desc    Get payment history
// @access  Private
router.get('/history',
  auth,
  [
    query('page').optional().isInt({ gt: 0 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be a positive integer'),
    query('status').optional().isString().withMessage('Status must be a string'),
    query('type').optional().isString().withMessage('Type must be a string'),
  ],
  getPaymentHistory
);

// @route   POST /api/payments/:paymentId/refund
// @desc    Process a refund
// @access  Private
router.post('/:paymentId/refund',
  auth,
  [
    param('paymentId').isString().withMessage('Payment ID must be provided'),
    body('amount').isFloat({ gt: 0 }).withMessage('Refund amount must be greater than 0'),
    body('reason').isString().withMessage('Reason for refund must be provided'),
  ],
  processRefund
);

// @route   GET /api/payments/stats
// @desc    Get payment statistics for a provider
// @access  Private
router.get('/stats',
  auth,
  [
    query('period').optional().isString().withMessage('Period must be a string'),
  ],
  getPaymentStats
);

// @route   POST /api/payments/create-intent
// @desc    Create payment intent for frontend
// @access  Private
router.post('/create-intent',
  auth,
  [
    body('bookingId').isString().withMessage('Booking ID must be provided'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  ],
  createPaymentIntent
);

module.exports = router;
