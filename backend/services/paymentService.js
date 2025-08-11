const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const Razorpay = require('razorpay');
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay initialized successfully');
} else {
  console.log('⚠️ Razorpay credentials not configured - Razorpay payment disabled');
}
const mongoose = require('mongoose');
const { notificationService } = require('./notificationService');
const Payment = require('../models/Payment');
const User = require('../models/User');

// PayPal configuration
const paypalEnvironment = process.env.NODE_ENV === 'production' 
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

// Payment Method Schema
const paymentMethodSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['card', 'bank_account', 'digital_wallet'], 
    required: true 
  },
  provider: { 
    type: String, 
    enum: ['stripe', 'paypal', 'razorpay'], 
    required: true 
  },
  providerPaymentMethodId: { 
    type: String, 
    required: true 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  details: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number,
    holderName: String,
    billingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String
    }
  },
  metadata: { 
    type: Object, 
    default: {} 
  }
}, {
  timestamps: true,
  index: [
    { userId: 1 },
    { userId: 1, isDefault: 1 }
  ]
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  planId: { 
    type: String, 
    required: true 
  },
  provider: { 
    type: String, 
    enum: ['stripe', 'paypal', 'razorpay'], 
    required: true 
  },
  providerSubscriptionId: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'],
    default: 'active'
  },
  currentPeriodStart: { 
    type: Date, 
    required: true 
  },
  currentPeriodEnd: { 
    type: Date, 
    required: true 
  },
  cancelAtPeriodEnd: { 
    type: Boolean, 
    default: false 
  },
  trialStart: Date,
  trialEnd: Date,
  metadata: { 
    type: Object, 
    default: {} 
  }
}, {
  timestamps: true,
  index: [
    { userId: 1 },
    { status: 1 },
    { currentPeriodEnd: 1 }
  ]
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

class PaymentService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelays = [1000, 3000, 5000]; // milliseconds
  }

  // Gateway Selection Logic
  selectPaymentGateway(amount, currency, userPreference) {
    // Simple logic for gateway selection
    // Can be enhanced with more sophisticated rules
    
    if (userPreference === 'paypal') return 'paypal';
    if (currency === 'INR') return 'razorpay';
    if (amount > 10000) return 'stripe'; // High-value transactions
    
    return 'stripe'; // Default
  }

  // Create Payment Intent
  async createPaymentIntent(paymentData) {
    const { amount, currency, userId, bookingId, gateway, metadata = {} } = paymentData;
    
    try {
      const selectedGateway = gateway || this.selectPaymentGateway(amount, currency, metadata.userPreference);
      let paymentIntent;

      switch (selectedGateway) {
        case 'stripe':
          paymentIntent = await this.createStripePaymentIntent(paymentData);
          break;
        case 'paypal':
          paymentIntent = await this.createPayPalPaymentIntent(paymentData);
          break;
        case 'razorpay':
          paymentIntent = await this.createRazorpayPaymentIntent(paymentData);
          break;
        default:
          throw new Error(`Unsupported payment gateway: ${selectedGateway}`);
      }

      // Store payment record
      const payment = new Payment({
        userId,
        bookingId,
        amount,
        currency,
        status: 'pending',
        gateway: selectedGateway,
        gatewayPaymentId: paymentIntent.id,
        metadata: {
          ...metadata,
          clientSecret: paymentIntent.clientSecret
        }
      });

      await payment.save();

      return {
        paymentId: payment._id,
        clientSecret: paymentIntent.clientSecret,
        gateway: selectedGateway,
        amount,
        currency
      };

    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Stripe Payment Intent
  async createStripePaymentIntent(paymentData) {
    const { amount, currency, userId, bookingId, metadata = {} } = paymentData;

    try {
      const user = await User.findById(userId);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: currency.toLowerCase(),
        customer: user.stripeCustomerId,
        metadata: {
          userId: userId.toString(),
          bookingId: bookingId?.toString(),
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      throw error;
    }
  }

  // PayPal Payment Intent
  async createPayPalPaymentIntent(paymentData) {
    const { amount, currency, userId, bookingId, metadata = {} } = paymentData;

    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2)
          },
          reference_id: bookingId?.toString() || `user_${userId}`,
          custom_id: userId.toString()
        }],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
        }
      });

      const order = await paypalClient.execute(request);
      
      return {
        id: order.result.id,
        clientSecret: order.result.id // PayPal uses order ID
      };
    } catch (error) {
      console.error('PayPal payment intent error:', error);
      throw error;
    }
  }

  // Razorpay Payment Intent
  async createRazorpayPaymentIntent(paymentData) {
    const { amount, currency, userId, bookingId, metadata = {} } = paymentData;

    if (!razorpay) {
      throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }

    try {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Razorpay expects paise
        currency: currency.toUpperCase(),
        receipt: `receipt_${bookingId || Date.now()}`,
        notes: {
          userId: userId.toString(),
          bookingId: bookingId?.toString(),
          ...metadata
        }
      });

      return {
        id: order.id,
        clientSecret: order.id // Razorpay uses order ID
      };
    } catch (error) {
      console.error('Razorpay payment intent error:', error);
      throw error;
    }
  }

  // Confirm Payment
  async confirmPayment(paymentId, confirmationData) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      let result;
      switch (payment.gateway) {
        case 'stripe':
          result = await this.confirmStripePayment(payment, confirmationData);
          break;
        case 'paypal':
          result = await this.confirmPayPalPayment(payment, confirmationData);
          break;
        case 'razorpay':
          result = await this.confirmRazorpayPayment(payment, confirmationData);
          break;
        default:
          throw new Error(`Unsupported payment gateway: ${payment.gateway}`);
      }

      // Update payment record
      payment.status = result.status;
      payment.gatewayResponse = result.response;
      payment.processedAt = new Date();
      await payment.save();

      // Send notifications
      if (result.status === 'succeeded') {
        await this.handleSuccessfulPayment(payment);
      } else {
        await this.handleFailedPayment(payment, result.error);
      }

      return {
        success: result.status === 'succeeded',
        payment,
        gatewayResponse: result.response
      };

    } catch (error) {
      console.error('Error confirming payment:', error);
      
      // Update payment as failed
      if (paymentId) {
        await Payment.findByIdAndUpdate(paymentId, {
          status: 'failed',
          errorMessage: error.message,
          processedAt: new Date()
        });
      }

      throw error;
    }
  }

  // Confirm Stripe Payment
  async confirmStripePayment(payment, confirmationData) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        payment.gatewayPaymentId
      );

      return {
        status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed',
        response: paymentIntent,
        error: paymentIntent.last_payment_error
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message
      };
    }
  }

  // Confirm PayPal Payment
  async confirmPayPalPayment(payment, confirmationData) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(payment.gatewayPaymentId);
      const capture = await paypalClient.execute(request);

      const isSuccessful = capture.result.status === 'COMPLETED';

      return {
        status: isSuccessful ? 'succeeded' : 'failed',
        response: capture.result,
        error: isSuccessful ? null : 'Payment capture failed'
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message
      };
    }
  }

  // Confirm Razorpay Payment
  async confirmRazorpayPayment(payment, confirmationData) {
    if (!razorpay) {
      return {
        status: 'failed',
        error: 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.'
      };
    }

    try {
      const { razorpay_payment_id, razorpay_signature } = confirmationData;
      
      // Verify signature
      const crypto = require('crypto');
      const body = payment.gatewayPaymentId + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isValidSignature = expectedSignature === razorpay_signature;

      if (isValidSignature) {
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        
        return {
          status: paymentDetails.status === 'captured' ? 'succeeded' : 'failed',
          response: paymentDetails,
          error: null
        };
      } else {
        return {
          status: 'failed',
          error: 'Invalid payment signature'
        };
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error.message
      };
    }
  }

  // Handle successful payment
  async handleSuccessfulPayment(payment) {
    try {
      // Send success notification
      await notificationService.sendTemplateNotification(
        payment.userId,
        'payment_success',
        {
          amount: payment.amount,
          serviceName: payment.metadata?.serviceName || 'Service'
        }
      );

      // Additional success handling logic here
      // e.g., update booking status, send receipts, etc.

    } catch (error) {
      console.error('Error handling successful payment:', error);
    }
  }

  // Handle failed payment
  async handleFailedPayment(payment, error) {
    try {
      // Send failure notification
      await notificationService.sendTemplateNotification(
        payment.userId,
        'payment_failed',
        {
          serviceName: payment.metadata?.serviceName || 'Service',
          error: error || 'Payment processing failed'
        }
      );

      // Retry logic for failed payments
      await this.schedulePaymentRetry(payment);

    } catch (retryError) {
      console.error('Error handling failed payment:', retryError);
    }
  }

  // Schedule payment retry
  async schedulePaymentRetry(payment) {
    try {
      const retryCount = payment.retryCount || 0;
      
      if (retryCount < this.retryAttempts) {
        const delay = this.retryDelays[retryCount] || 5000;
        
        setTimeout(async () => {
          try {
            await Payment.findByIdAndUpdate(payment._id, {
              $inc: { retryCount: 1 },
              status: 'retrying',
              lastRetryAt: new Date()
            });

            // Attempt to retry payment
            // Implementation depends on specific requirements
            console.log(`Retrying payment ${payment._id}, attempt ${retryCount + 1}`);
            
          } catch (error) {
            console.error('Payment retry failed:', error);
          }
        }, delay);
      }
    } catch (error) {
      console.error('Error scheduling payment retry:', error);
    }
  }

  // Save Payment Method
  async savePaymentMethod(userId, paymentMethodData) {
    const { provider, type, token, isDefault = false } = paymentMethodData;

    try {
      let providerPaymentMethodId;
      let details = {};

      switch (provider) {
        case 'stripe':
          const stripeMethod = await this.saveStripePaymentMethod(userId, token);
          providerPaymentMethodId = stripeMethod.id;
          details = {
            last4: stripeMethod.card?.last4,
            brand: stripeMethod.card?.brand,
            expiryMonth: stripeMethod.card?.exp_month,
            expiryYear: stripeMethod.card?.exp_year
          };
          break;
          
        case 'paypal':
          // PayPal payment method saving logic
          providerPaymentMethodId = token;
          break;
          
        case 'razorpay':
          // Razorpay payment method saving logic
          providerPaymentMethodId = token;
          break;
          
        default:
          throw new Error(`Unsupported payment provider: ${provider}`);
      }

      // If this is set as default, unset other default methods
      if (isDefault) {
        await PaymentMethod.updateMany(
          { userId, isDefault: true },
          { isDefault: false }
        );
      }

      const paymentMethod = new PaymentMethod({
        userId,
        type,
        provider,
        providerPaymentMethodId,
        isDefault,
        details
      });

      await paymentMethod.save();

      return paymentMethod;

    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  }

  // Save Stripe Payment Method
  async saveStripePaymentMethod(userId, paymentMethodId) {
    try {
      const user = await User.findById(userId);
      
      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId
      });

      return await stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      console.error('Error saving Stripe payment method:', error);
      throw error;
    }
  }

  // Get User Payment Methods
  async getUserPaymentMethods(userId) {
    try {
      return await PaymentMethod.find({ userId })
        .sort({ isDefault: -1, createdAt: -1 })
        .lean();
    } catch (error) {
      console.error('Error fetching user payment methods:', error);
      throw error;
    }
  }

  // Delete Payment Method
  async deletePaymentMethod(userId, paymentMethodId) {
    try {
      const paymentMethod = await PaymentMethod.findOne({
        _id: paymentMethodId,
        userId
      });

      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      // Delete from payment gateway
      switch (paymentMethod.provider) {
        case 'stripe':
          await stripe.paymentMethods.detach(paymentMethod.providerPaymentMethodId);
          break;
        case 'paypal':
          // PayPal deletion logic if applicable
          break;
        case 'razorpay':
          // Razorpay deletion logic if applicable
          break;
      }

      await PaymentMethod.findByIdAndDelete(paymentMethodId);

      return { success: true };

    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  // Create Subscription
  async createSubscription(subscriptionData) {
    const { userId, planId, paymentMethodId, trialDays, provider } = subscriptionData;

    try {
      let providerSubscriptionId;
      let subscriptionDetails;

      switch (provider) {
        case 'stripe':
          const stripeSubscription = await this.createStripeSubscription(
            userId, planId, paymentMethodId, trialDays
          );
          providerSubscriptionId = stripeSubscription.id;
          subscriptionDetails = stripeSubscription;
          break;
          
        case 'paypal':
          // PayPal subscription creation logic
          break;
          
        case 'razorpay':
          // Razorpay subscription creation logic
          break;
          
        default:
          throw new Error(`Unsupported subscription provider: ${provider}`);
      }

      const subscription = new Subscription({
        userId,
        planId,
        provider,
        providerSubscriptionId,
        status: subscriptionDetails.status,
        currentPeriodStart: new Date(subscriptionDetails.current_period_start * 1000),
        currentPeriodEnd: new Date(subscriptionDetails.current_period_end * 1000),
        trialStart: subscriptionDetails.trial_start ? new Date(subscriptionDetails.trial_start * 1000) : null,
        trialEnd: subscriptionDetails.trial_end ? new Date(subscriptionDetails.trial_end * 1000) : null
      });

      await subscription.save();

      return subscription;

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Create Stripe Subscription
  async createStripeSubscription(userId, planId, paymentMethodId, trialDays) {
    try {
      const user = await User.findById(userId);
      
      const subscriptionData = {
        customer: user.stripeCustomerId,
        items: [{ price: planId }],
        default_payment_method: paymentMethodId,
        expand: ['latest_invoice.payment_intent']
      };

      if (trialDays) {
        subscriptionData.trial_period_days = trialDays;
      }

      return await stripe.subscriptions.create(subscriptionData);
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      throw error;
    }
  }

  // Cancel Subscription
  async cancelSubscription(userId, subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const subscription = await Subscription.findOne({
        _id: subscriptionId,
        userId
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      let updatedSubscription;

      switch (subscription.provider) {
        case 'stripe':
          if (cancelAtPeriodEnd) {
            updatedSubscription = await stripe.subscriptions.update(
              subscription.providerSubscriptionId,
              { cancel_at_period_end: true }
            );
          } else {
            updatedSubscription = await stripe.subscriptions.cancel(
              subscription.providerSubscriptionId
            );
          }
          break;
          
        case 'paypal':
          // PayPal subscription cancellation logic
          break;
          
        case 'razorpay':
          // Razorpay subscription cancellation logic
          break;
      }

      // Update local subscription record
      subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
      subscription.status = cancelAtPeriodEnd ? 'active' : 'canceled';
      await subscription.save();

      return subscription;

    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Get Payment History
  async getPaymentHistory(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate
    } = options;

    try {
      const query = { userId };
      
      if (status) query.status = status;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('bookingId', 'serviceName serviceDate')
        .lean();

      const total = await Payment.countDocuments(query);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Process Webhook
  async processWebhook(provider, payload, signature) {
    try {
      switch (provider) {
        case 'stripe':
          return await this.processStripeWebhook(payload, signature);
        case 'paypal':
          return await this.processPayPalWebhook(payload, signature);
        case 'razorpay':
          return await this.processRazorpayWebhook(payload, signature);
        default:
          throw new Error(`Unsupported webhook provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error processing ${provider} webhook:`, error);
      throw error;
    }
  }

  // Process Stripe Webhook
  async processStripeWebhook(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log('Received Stripe webhook:', event.type);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleStripePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handleStripePaymentFailure(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleStripeSubscriptionPayment(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleStripeSubscriptionUpdate(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleStripeSubscriptionCancellation(event.data.object);
          break;
        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw error;
    }
  }

  // Handle Stripe Payment Success
  async handleStripePaymentSuccess(paymentIntent) {
    try {
      const payment = await Payment.findOneAndUpdate(
        { gatewayPaymentId: paymentIntent.id },
        {
          status: 'succeeded',
          gatewayResponse: paymentIntent,
          processedAt: new Date()
        },
        { new: true }
      );

      if (payment) {
        await this.handleSuccessfulPayment(payment);
      }
    } catch (error) {
      console.error('Error handling Stripe payment success:', error);
    }
  }

  // Handle Stripe Payment Failure
  async handleStripePaymentFailure(paymentIntent) {
    try {
      const payment = await Payment.findOneAndUpdate(
        { gatewayPaymentId: paymentIntent.id },
        {
          status: 'failed',
          gatewayResponse: paymentIntent,
          errorMessage: paymentIntent.last_payment_error?.message,
          processedAt: new Date()
        },
        { new: true }
      );

      if (payment) {
        await this.handleFailedPayment(payment, paymentIntent.last_payment_error?.message);
      }
    } catch (error) {
      console.error('Error handling Stripe payment failure:', error);
    }
  }
}

// Initialize service instance
const paymentService = new PaymentService();

// Export service and models
module.exports = {
  paymentService,
  PaymentMethod,
  Subscription
};
