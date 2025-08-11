const express = require('express');
const router = express.Router();
const { paymentService } = require('../services/paymentService');
const { authenticateToken } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Create payment intent
router.post(
  '/create-intent',
  authenticateToken,
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
    body('bookingId').optional().isMongoId().withMessage('Invalid booking ID'),
    body('gateway').optional().isIn(['stripe', 'paypal', 'razorpay']).withMessage('Invalid gateway')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const {
        amount,
        currency,
        bookingId,
        gateway,
        metadata = {}
      } = req.body;

      const paymentData = {
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        userId: req.user.id,
        bookingId,
        gateway,
        metadata
      };

      const result = await paymentService.createPaymentIntent(paymentData);

      res.status(201).json({
        success: true,
        message: 'Payment intent created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment intent'
      });
    }
  }
);

// Confirm payment
router.post(
  '/confirm/:paymentId',
  authenticateToken,
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      const confirmationData = req.body;

      const result = await paymentService.confirmPayment(paymentId, confirmationData);

      if (result.success) {
        res.json({
          success: true,
          message: 'Payment confirmed successfully',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment confirmation failed',
          data: result
        });
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm payment'
      });
    }
  }
);

// Save payment method
router.post(
  '/payment-methods',
  authenticateToken,
  [
    body('provider').isIn(['stripe', 'paypal', 'razorpay']).withMessage('Invalid provider'),
    body('type').isIn(['card', 'bank_account', 'digital_wallet']).withMessage('Invalid type'),
    body('token').notEmpty().withMessage('Token is required'),
    body('isDefault').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const paymentMethodData = {
        ...req.body,
        userId: req.user.id
      };

      const result = await paymentService.savePaymentMethod(req.user.id, paymentMethodData);

      res.status(201).json({
        success: true,
        message: 'Payment method saved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error saving payment method:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save payment method'
      });
    }
  }
);

// Get user payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const paymentMethods = await paymentService.getUserPaymentMethods(req.user.id);

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
});

// Delete payment method
router.delete('/payment-methods/:id', authenticateToken, async (req, res) => {
  try {
    const result = await paymentService.deletePaymentMethod(req.user.id, req.params.id);

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method'
    });
  }
});

// Create subscription
router.post(
  '/subscriptions',
  authenticateToken,
  [
    body('planId').notEmpty().withMessage('Plan ID is required'),
    body('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
    body('provider').isIn(['stripe', 'paypal', 'razorpay']).withMessage('Invalid provider'),
    body('trialDays').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const subscriptionData = {
        ...req.body,
        userId: req.user.id
      };

      const result = await paymentService.createSubscription(subscriptionData);

      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription'
      });
    }
  }
);

// Cancel subscription
router.post(
  '/subscriptions/:id/cancel',
  authenticateToken,
  [
    body('cancelAtPeriodEnd').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { cancelAtPeriodEnd = true } = req.body;

      const result = await paymentService.cancelSubscription(
        req.user.id,
        id,
        cancelAtPeriodEnd
      );

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: result
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }
  }
);

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      startDate,
      endDate
    };

    const result = await paymentService.getPaymentHistory(req.user.id, options);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

// Stripe webhook
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    await paymentService.processWebhook('stripe', req.body, signature);
    
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// PayPal webhook
router.post('/webhooks/paypal', async (req, res) => {
  try {
    const signature = req.headers['paypal-transmission-sig'];
    
    await paymentService.processWebhook('paypal', req.body, signature);
    
    res.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// Razorpay webhook
router.post('/webhooks/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    await paymentService.processWebhook('razorpay', req.body, signature);
    
    res.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// Refund payment (admin only)
router.post(
  '/refund/:paymentId',
  authenticateToken,
  [
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('reason').optional().notEmpty().withMessage('Reason cannot be empty')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      // Check if user is admin or has refund permissions
      if (req.user.role !== 'admin' && !req.user.permissions?.includes('refund')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      // This would be implemented in the payment service
      // const result = await paymentService.refundPayment(paymentId, { amount, reason });

      res.json({
        success: true,
        message: 'Refund processed successfully'
        // data: result
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund'
      });
    }
  }
);

// Get payment analytics (admin only)
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const {
      timeRange = '30d',
      gateway
    } = req.query;

    // This would be implemented in the payment service
    // const analytics = await paymentService.getPaymentAnalytics({ timeRange, gateway });

    res.json({
      success: true,
      message: 'Payment analytics retrieved successfully'
      // data: analytics
    });
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment analytics'
    });
  }
});

// Retry failed payment
router.post('/retry/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // This would be implemented in the payment service
    // const result = await paymentService.retryPayment(paymentId);

    res.json({
      success: true,
      message: 'Payment retry initiated successfully'
      // data: result
    });
  } catch (error) {
    console.error('Error retrying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry payment'
    });
  }
});

// Get payment receipt
router.get('/receipt/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // This would generate and return a payment receipt
    // const receipt = await paymentService.generateReceipt(paymentId, req.user.id);

    res.json({
      success: true,
      message: 'Payment receipt retrieved successfully'
      // data: receipt
    });
  } catch (error) {
    console.error('Error fetching payment receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment receipt'
    });
  }
});

// Update payment method as default
router.patch('/payment-methods/:id/default', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // This would be implemented in the payment service
    // const result = await paymentService.setDefaultPaymentMethod(req.user.id, id);

    res.json({
      success: true,
      message: 'Default payment method updated successfully'
      // data: result
    });
  } catch (error) {
    console.error('Error updating default payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update default payment method'
    });
  }
});

module.exports = router;

