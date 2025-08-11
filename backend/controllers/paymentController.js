const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Mock Stripe integration (replace with actual Stripe SDK in production)
const mockStripeProcess = async (amount, paymentMethod) => {
  // Simulate payment processing
  const success = Math.random() > 0.1; // 90% success rate
  
  if (success) {
    return {
      id: `pi_${Math.random().toString(36).substring(2, 15)}`,
      status: 'succeeded',
      amount: amount * 100, // Stripe uses cents
      currency: 'usd',
      payment_method: paymentMethod
    };
  } else {
    throw new Error('Payment failed: Insufficient funds');
  }
};

// @desc    Process payment for booking
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { bookingId, amount, paymentMethod, paymentMethodDetails } = req.body;
    const customerId = req.userId;

    // Verify booking exists and belongs to customer
    const booking = await Booking.findById(bookingId).populate('providerId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customerId.toString() !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to process payment for this booking'
      });
    }

    if (booking.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }

    // Create payment record
    const payment = new Payment({
      bookingId,
      customerId,
      providerId: booking.providerId._id,
      amount: {
        gross: amount,
        currency: 'USD'
      },
      paymentMethod: {
        type: paymentMethod,
        details: paymentMethodDetails
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        platform: 'web'
      }
    });

    // Calculate fees
    payment.calculateFees();
    await payment.save();

    try {
      // Process payment with gateway (mock Stripe)
      const gatewayResponse = await mockStripeProcess(amount, paymentMethod);
      
      // Update payment status
      payment.transactionIds.gateway = gatewayResponse.id;
      payment.transactionIds.internal = payment.paymentId;
      await payment.updateStatus('completed', gatewayResponse);

      // Update booking payment status
      booking.payment.status = 'completed';
      booking.payment.transactionId = gatewayResponse.id;
      booking.payment.paidAt = new Date();
      await booking.save();

      // Add timeline entry
      await booking.addTimelineEntry('payment_completed', 'Payment processed successfully', customerId);

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          paymentId: payment.paymentId,
          status: payment.status,
          amount: payment.amount,
          transactionId: payment.transactionIds.gateway
        }
      });

    } catch (gatewayError) {
      // Update payment status to failed
      await payment.updateStatus('failed', { 
        errorMessage: gatewayError.message 
      });

      res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: gatewayError.message
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment processing'
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private
const getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId;

    const payment = await Payment.findOne({ paymentId })
      .populate('bookingId', 'bookingNumber serviceDetails')
      .populate('customerId', 'name email')
      .populate('providerId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user is authorized to view this payment
    if (payment.customerId._id.toString() !== userId && 
        payment.providerId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payment
      }
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting payment details'
    });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status, type = 'all' } = req.query;

    let query = {};
    
    // Filter by user type (customer or provider)
    if (type === 'customer' || type === 'all') {
      query.customerId = userId;
    } else if (type === 'provider') {
      query.providerId = userId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('bookingId', 'bookingNumber serviceDetails scheduledDate')
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting payment history'
    });
  }
};

// @desc    Process refund
// @route   POST /api/payments/:paymentId/refund
// @access  Private
const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.userId;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Only customer or provider can request refund
    if (payment.customerId.toString() !== userId && 
        payment.providerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to refund this payment'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments'
      });
    }

    // Validate refund amount
    const maxRefundAmount = payment.amount.gross - (payment.refund?.amount || 0);
    if (amount > maxRefundAmount) {
      return res.status(400).json({
        success: false,
        message: `Refund amount cannot exceed $${maxRefundAmount}`
      });
    }

    // Process refund (mock implementation)
    try {
      // In production, process refund with payment gateway
      const refundId = `re_${Math.random().toString(36).substring(2, 15)}`;
      
      await payment.processRefund(amount, reason, userId);
      payment.refund.refundId = refundId;
      await payment.save();

      // Update booking status if full refund
      if (amount >= payment.amount.gross) {
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          await booking.addTimelineEntry('refunded', `Full refund processed: ${reason}`, userId);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          refundId,
          amount,
          status: payment.status
        }
      });

    } catch (refundError) {
      res.status(400).json({
        success: false,
        message: 'Refund processing failed',
        error: refundError.message
      });
    }

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during refund processing'
    });
  }
};

// @desc    Get payment statistics (for providers)
// @route   GET /api/payments/stats
// @access  Private
const getPaymentStats = async (req, res) => {
  try {
    const providerId = req.userId;
    const { period = 'month' } = req.query;

    // Verify user is a provider
    const user = await User.findById(providerId);
    if (!user || user.userType !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Provider account required.'
      });
    }

    const stats = await Payment.getStatistics(providerId, period);
    const revenueTrend = await Payment.getRevenueTrend(providerId, 6);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          totalRevenue: 0,
          totalTransactions: 0,
          averageAmount: 0
        },
        revenueTrend,
        period
      }
    });

  } catch (error) {
    console.error('Payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting payment statistics'
    });
  }
};

// @desc    Create payment intent (for frontend integration)
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const customerId = req.userId;

    // Verify booking
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.customerId.toString() !== customerId) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    // Create payment intent (mock)
    const paymentIntent = {
      id: `pi_${Math.random().toString(36).substring(2, 15)}`,
      client_secret: `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 10)}`,
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      status: 'requires_payment_method'
    };

    res.status(200).json({
      success: true,
      data: {
        paymentIntent
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment intent'
    });
  }
};

module.exports = {
  processPayment,
  getPayment,
  getPaymentHistory,
  processRefund,
  getPaymentStats,
  createPaymentIntent
};
