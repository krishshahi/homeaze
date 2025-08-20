const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Optional notification service - won't crash if not available
let notificationService = null;
try {
  const notificationServiceModule = require('../services/notificationService');
  notificationService = notificationServiceModule.notificationService;
} catch (error) {
  console.warn('Notification service not available:', error.message);
}

class BookingController {
  
  // Create a new booking (Customer only)
  async createBooking(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

    const { serviceId, scheduledDate, scheduledTime, location, serviceRequirements, payment } = req.body;
    const customerId = req.userId;

      // Verify service exists and is active
      const service = await Service.findById(serviceId)
        .populate('providerId', 'name email phone providerProfile')
        .session(session);
      
      if (!service || !service.isActive) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: 'Service not found or not available'
        });
      }

      // Check if the scheduled date is in the future
      const bookingDate = new Date(scheduledDate);
      const now = new Date();
      if (bookingDate <= now) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Booking date must be in the future'
        });
      }

      // Check provider availability for the exact time slot
      const dayStart = new Date(scheduledDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(scheduledDate);
      dayEnd.setHours(23, 59, 59, 999);

      const conflictingBooking = await Booking.findOne({
        providerId: service.providerId._id,
        scheduledDate: {
          $gte: dayStart,
          $lte: dayEnd
        },
        status: { $in: ['pending', 'confirmed', 'in-progress'] },
        $or: [
          {
            'scheduledTime.start': { $lte: scheduledTime.start },
            'scheduledTime.end': { $gt: scheduledTime.start }
          },
          {
            'scheduledTime.start': { $lt: scheduledTime.end },
            'scheduledTime.end': { $gte: scheduledTime.end }
          },
          {
            'scheduledTime.start': { $gte: scheduledTime.start },
            'scheduledTime.end': { $lte: scheduledTime.end }
          }
        ]
      }).session(session);

      if (conflictingBooking) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Provider is not available at the selected time slot'
        });
      }

      // Calculate estimated cost
      let estimatedCost = 0;
      if (service.pricing.type === 'fixed') {
        estimatedCost = service.pricing.amount;
      } else if (service.pricing.type === 'hourly') {
        const [startHour, startMin] = scheduledTime.start.split(':').map(Number);
        const [endHour, endMin] = scheduledTime.end.split(':').map(Number);
        const hours = (endHour * 60 + endMin - startHour * 60 - startMin) / 60;
        estimatedCost = hours * service.pricing.amount;
      }

      // Create booking
      const bookingData = {
        customerId,
        providerId: service.providerId._id,
        serviceId: service._id,
        serviceDetails: {
          title: service.title,
          description: service.description,
          category: service.category
        },
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        location,
        serviceRequirements,
        pricing: {
          estimatedCost,
          currency: 'USD'
        },
        payment: {
          method: payment.method,
          status: 'pending'
        }
      };

      const booking = new Booking(bookingData);
      await booking.save({ session });

      // Add initial timeline entry
      booking.timeline.push({
        status: 'pending',
        note: 'Booking created by customer',
        updatedBy: customerId,
        timestamp: new Date()
      });
      
      await booking.save({ session });

      // Update service statistics
      await Service.findByIdAndUpdate(
        serviceId,
        { $inc: { 'stats.totalBookings': 1 } },
        { session }
      );

      await session.commitTransaction();

      // Send real-time notification to provider (non-blocking)
      try {
        await this.notifyProviderOfNewBooking(booking, service.providerId);
      } catch (notificationError) {
        console.error('Notification failed, but booking was created successfully:', notificationError.message);
      }

      // Populate the booking for response
      const populatedBooking = await Booking.findById(booking._id)
        .populate('customerId', 'name email phone avatar')
        .populate('providerId', 'name email phone providerProfile.businessName')
        .populate('serviceId', 'title category pricing');

      res.status(201).json({
        success: true,
        message: 'Booking created successfully and provider has been notified',
        data: {
          booking: populatedBooking,
          bookingNumber: booking.bookingNumber
        }
      });

    } catch (error) {
      await session.abortTransaction();
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create booking'
      });
    } finally {
      session.endSession();
    }
  }

  // Provider confirms or rejects a booking
  async updateBookingStatus(req, res) {
    try {
    const { bookingId } = req.params;
    const { status, providerNotes } = req.body;
    const providerId = req.userId;

      if (!['confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Only "confirmed" or "cancelled" are allowed'
        });
      }

      const booking = await Booking.findById(bookingId)
        .populate('customerId', 'name email phone')
        .populate('serviceId', 'title');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if the provider owns this booking
      if (booking.providerId.toString() !== providerId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this booking'
        });
      }

      // Check if booking can still be updated
      if (booking.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot update booking with status: ${booking.status}`
        });
      }

      // Update booking status
      booking.status = status;
      if (providerNotes) {
        booking.providerNotes = providerNotes;
      }

      // Add timeline entry
      booking.timeline.push({
        status,
        note: status === 'confirmed' ? 
          `Booking confirmed by provider${providerNotes ? `: ${providerNotes}` : ''}` :
          `Booking cancelled by provider${providerNotes ? `: ${providerNotes}` : ''}`,
        updatedBy: providerId,
        timestamp: new Date()
      });

      await booking.save();

      // Send notification to customer (non-blocking)
      try {
        await this.notifyCustomerOfBookingUpdate(booking, status);
      } catch (notificationError) {
        console.error('Customer notification failed:', notificationError.message);
      }

      res.json({
        success: true,
        message: `Booking ${status} successfully`,
        data: { 
          booking,
          notificationSent: true
        }
      });

    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking status'
      });
    }
  }

  // Get bookings (filtered by user type)
  async getBookings(req, res) {
    try {
      const { status, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
      const userId = req.userId;
      const userType = req.user.userType;

      // Build filter based on user type
      const filters = {};
      if (userType === 'customer') {
        filters.customerId = userId;
      } else if (userType === 'provider') {
        filters.providerId = userId;
      }

      if (status) {
        filters.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = order === 'desc' ? -1 : 1;

      const bookings = await Booking.find(filters)
        .populate('customerId', 'name email phone avatar')
        .populate('providerId', 'name email phone avatar providerProfile.businessName providerProfile.rating')
        .populate('serviceId', 'title category pricing images')
        .sort({ [sortBy]: sortOrder })
        .limit(parseInt(limit))
        .skip(skip);

      const totalCount = await Booking.countDocuments(filters);

      res.json({
        success: true,
        data: {
          bookings,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount,
            hasNextPage: skip + bookings.length < totalCount,
            hasPrevPage: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings'
      });
    }
  }

  // Get single booking details
  async getBookingById(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.userId;

      const booking = await Booking.findById(bookingId)
        .populate('customerId', 'name email phone avatar address')
        .populate('providerId', 'name email phone avatar providerProfile')
        .populate('serviceId', 'title description category pricing images tags');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if user is authorized to view this booking
      const isAuthorized = booking.customerId._id.toString() === userId || 
                          booking.providerId._id.toString() === userId;

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this booking'
        });
      }

      res.json({
        success: true,
        data: { booking }
      });

    } catch (error) {
      console.error('Get booking by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking details'
      });
    }
  }

  // Start service (Provider marks as in-progress)
  async startService(req, res) {
    try {
      const { bookingId } = req.params;
      const providerId = req.userId;

      const booking = await Booking.findById(bookingId)
        .populate('customerId', 'name email phone');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.providerId.toString() !== providerId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to start this service'
        });
      }

      if (booking.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Can only start confirmed bookings'
        });
      }

      // Update booking to in-progress
      booking.status = 'in-progress';
      booking.timeline.push({
        status: 'in-progress',
        note: 'Service started by provider',
        updatedBy: providerId,
        timestamp: new Date()
      });

      await booking.save();

      // Notify customer (non-blocking)
      if (notificationService) {
        try {
          await notificationService.sendTemplateNotification(
            booking.customerId._id,
            'service_started',
            {
              bookingNumber: booking.bookingNumber,
              serviceName: booking.serviceDetails.title,
              providerName: req.user.name
            }
          );
        } catch (notificationError) {
          console.error('Service start notification failed:', notificationError.message);
        }
      }

      res.json({
        success: true,
        message: 'Service started successfully',
        data: { booking }
      });

    } catch (error) {
      console.error('Start service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start service'
      });
    }
  }

  // Complete service (Provider marks as completed)
  async completeService(req, res) {
    try {
      const { bookingId } = req.params;
      const { workPerformed, materialUsed, finalCost, beforeImages, afterImages, additionalNotes } = req.body;
      const providerId = req.userId;

      const booking = await Booking.findById(bookingId)
        .populate('customerId', 'name email phone');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.providerId.toString() !== providerId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to complete this service'
        });
      }

      if (booking.status !== 'in-progress') {
        return res.status(400).json({
          success: false,
          message: 'Can only complete in-progress bookings'
        });
      }

      // Update booking to completed
      booking.status = 'completed';
      booking.completion = {
        completedAt: new Date(),
        workPerformed,
        materialUsed: materialUsed || [],
        beforeImages: beforeImages || [],
        afterImages: afterImages || [],
        additionalNotes,
        providerNotes: additionalNotes
      };

      if (finalCost) {
        booking.pricing.finalCost = finalCost;
      }

      booking.timeline.push({
        status: 'completed',
        note: 'Service completed by provider',
        updatedBy: providerId,
        timestamp: new Date()
      });

      await booking.save();

      // Update service statistics
      await Service.findByIdAndUpdate(
        booking.serviceId,
        { $inc: { 'stats.completedBookings': 1 } }
      );

      // Notify customer of completion (non-blocking)
      if (notificationService) {
        try {
          await notificationService.sendTemplateNotification(
            booking.customerId._id,
            'service_completed',
            {
              bookingNumber: booking.bookingNumber,
              serviceName: booking.serviceDetails.title,
              providerName: req.user.name,
              finalCost: booking.pricing.finalCost || booking.pricing.estimatedCost
            }
          );
        } catch (notificationError) {
          console.error('Service completion notification failed:', notificationError.message);
        }
      }

      res.json({
        success: true,
        message: 'Service completed successfully',
        data: { booking }
      });

    } catch (error) {
      console.error('Complete service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete service'
      });
    }
  }

  // Cancel booking (Both customer and provider can cancel)
  async cancelBooking(req, res) {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;
      const userId = req.userId;

      const booking = await Booking.findById(bookingId)
        .populate('customerId', 'name email phone')
        .populate('providerId', 'name email phone');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check authorization
      const isCustomer = booking.customerId._id.toString() === userId;
      const isProvider = booking.providerId._id.toString() === userId;

      if (!isCustomer && !isProvider) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this booking'
        });
      }

      // Check if booking can be cancelled
      if (!booking.canBeCancelled()) {
        return res.status(400).json({
          success: false,
          message: 'Booking cannot be cancelled at this time'
        });
      }

      // Update booking
      booking.status = 'cancelled';
      booking.cancellation = {
        cancelledBy: userId,
        reason: reason || 'No reason provided',
        cancelledAt: new Date(),
        refundEligible: isCustomer // Customers are eligible for refunds when they cancel
      };

      booking.timeline.push({
        status: 'cancelled',
        note: `Booking cancelled by ${isCustomer ? 'customer' : 'provider'}: ${reason || 'No reason provided'}`,
        updatedBy: userId,
        timestamp: new Date()
      });

      await booking.save();

      // Notify the other party (non-blocking)
      if (notificationService) {
        try {
          const otherParty = isCustomer ? booking.providerId._id : booking.customerId._id;
          await notificationService.sendTemplateNotification(
            otherParty,
            'booking_cancelled',
            {
              bookingNumber: booking.bookingNumber,
              serviceName: booking.serviceDetails.title,
              cancelledBy: isCustomer ? 'customer' : 'provider',
              reason: reason || 'No reason provided'
            }
          );
        } catch (notificationError) {
          console.error('Booking cancellation notification failed:', notificationError.message);
        }
      }

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: { 
          booking,
          refundEligible: booking.cancellation.refundEligible
        }
      });

    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel booking'
      });
    }
  }

  // Add message to booking communication
  async addMessage(req, res) {
    try {
      const { bookingId } = req.params;
      const { message, attachments } = req.body;
      const userId = req.userId;

      const booking = await Booking.findById(bookingId)
        .populate('customerId', 'name')
        .populate('providerId', 'name');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check authorization
      const isAuthorized = booking.customerId._id.toString() === userId || 
                          booking.providerId._id.toString() === userId;

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to add messages to this booking'
        });
      }

      // Add message
      booking.communication.push({
        senderId: userId,
        message,
        type: 'message',
        attachments: attachments || [],
        timestamp: new Date()
      });

      await booking.save();

      // Notify the other party (non-blocking)
      if (notificationService) {
        try {
          const otherParty = booking.customerId._id.toString() === userId ? 
                            booking.providerId._id : booking.customerId._id;
          
          await notificationService.sendNotification({
            userId: otherParty,
            title: `New message for booking ${booking.bookingNumber}`,
            body: message,
            type: 'booking_message',
            channels: ['push', 'email'],
            data: {
              bookingId: booking._id,
              bookingNumber: booking.bookingNumber,
              senderName: req.user.name
            }
          });
        } catch (notificationError) {
          console.error('Message notification failed:', notificationError.message);
        }
      }

      res.json({
        success: true,
        message: 'Message added successfully',
        data: {
          messageId: booking.communication[booking.communication.length - 1]._id,
          timestamp: booking.communication[booking.communication.length - 1].timestamp
        }
      });

    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add message'
      });
    }
  }

  // Get booking messages
  async getMessages(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.userId;

      const booking = await Booking.findById(bookingId)
        .populate('communication.senderId', 'name avatar')
        .select('customerId providerId communication');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check authorization
      const isAuthorized = booking.customerId.toString() === userId || 
                          booking.providerId.toString() === userId;

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view messages for this booking'
        });
      }

      res.json({
        success: true,
        data: {
          messages: booking.communication.sort((a, b) => a.timestamp - b.timestamp)
        }
      });

    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages'
      });
    }
  }

  // Private helper methods
  async notifyProviderOfNewBooking(booking, provider) {
    if (!notificationService) {
      console.log('Notification service not available - skipping provider notification');
      return;
    }
    
    try {
      const customer = await User.findById(booking.customerId).select('name');
      
      await notificationService.sendTemplateNotification(
        provider._id,
        'new_booking_request',
        {
          bookingNumber: booking.bookingNumber,
          customerName: customer.name,
          serviceName: booking.serviceDetails.title,
          scheduledDate: booking.scheduledDate.toDateString(),
          scheduledTime: `${booking.scheduledTime.start} - ${booking.scheduledTime.end}`,
          estimatedCost: booking.pricing.estimatedCost,
          location: `${booking.location.address.city}, ${booking.location.address.state}`
        }
      );
    } catch (error) {
      console.error('Error notifying provider:', error);
    }
  }

  async notifyCustomerOfBookingUpdate(booking, status) {
    if (!notificationService) {
      console.log('Notification service not available - skipping customer notification');
      return;
    }
    
    try {
      const provider = await User.findById(booking.providerId).select('name providerProfile.businessName');
      
      const templateType = status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled';
      
      await notificationService.sendTemplateNotification(
        booking.customerId._id,
        templateType,
        {
          bookingNumber: booking.bookingNumber,
          providerName: provider.providerProfile?.businessName || provider.name,
          serviceName: booking.serviceDetails.title,
          scheduledDate: booking.scheduledDate.toDateString(),
          scheduledTime: `${booking.scheduledTime.start} - ${booking.scheduledTime.end}`
        }
      );
    } catch (error) {
      console.error('Error notifying customer:', error);
    }
  }
}

module.exports = new BookingController();
