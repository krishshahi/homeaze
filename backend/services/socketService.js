const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SessionSecurity } = require('../utils/security');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
    this.userSockets = new Map(); // socketId -> user data mapping
  }

  /**
   * Initialize Socket.IO server
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:8081",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user || !user.isActive) {
          return next(new Error('Authentication error: User not found or inactive'));
        }

        // Attach user to socket
        socket.user = user;
        socket.sessionId = decoded.sessionId;
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.setupEventHandlers();
    
    console.log('✅ Socket.IO server initialized');
    return this.io;
  }

  /**
   * Setup socket event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
      this.setupSocketEvents(socket);
    });
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    const user = socket.user;
    const userId = user._id.toString();
    
    console.log(`🔌 User ${user.name} (${userId}) connected via socket ${socket.id}`);
    
    // Store user-socket mapping
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, {
      userId,
      user,
      connectedAt: new Date(),
      lastActivity: new Date()
    });

    // Join user-specific room
    socket.join(`user_${userId}`);
    
    // Join role-specific room
    socket.join(`${user.userType}s`);
    
    // Emit connection success
    socket.emit('connected', {
      success: true,
      message: 'Connected to real-time services',
      timestamp: new Date().toISOString()
    });

    // Update user's online status
    this.updateUserStatus(userId, 'online');
    
    // Notify relevant users about online status
    this.broadcastUserStatusUpdate(userId, 'online');
  }

  /**
   * Setup socket event listeners for a specific socket
   */
  setupSocketEvents(socket) {
    const userId = socket.user._id.toString();

    // Handle heartbeat/ping
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
      this.updateLastActivity(socket.id);
    });

    // Handle location updates (for providers)
    socket.on('location_update', (data) => {
      this.handleLocationUpdate(socket, data);
    });

    // Handle chat messages
    socket.on('chat_message', (data) => {
      this.handleChatMessage(socket, data);
    });

    // Handle booking status updates
    socket.on('booking_status_update', (data) => {
      this.handleBookingStatusUpdate(socket, data);
    });

    // Handle service requests
    socket.on('service_request', (data) => {
      this.handleServiceRequest(socket, data);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      this.handleTypingIndicator(socket, data, true);
    });

    socket.on('typing_stop', (data) => {
      this.handleTypingIndicator(socket, data, false);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(socket, reason);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  }

  /**
   * Handle location updates from providers
   */
  handleLocationUpdate(socket, data) {
    const { latitude, longitude, heading, speed } = data;
    const userId = socket.user._id.toString();

    if (!latitude || !longitude) {
      socket.emit('error', { message: 'Invalid location data' });
      return;
    }

    // Broadcast location to relevant customers
    const locationUpdate = {
      providerId: userId,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        heading: heading ? parseFloat(heading) : null,
        speed: speed ? parseFloat(speed) : null,
        timestamp: new Date().toISOString()
      }
    };

    // Emit to customers with active bookings with this provider
    this.broadcastToRelevantCustomers(userId, 'provider_location_update', locationUpdate);
    
    console.log(`📍 Location update from provider ${userId}: ${latitude}, ${longitude}`);
  }

  /**
   * Handle chat messages
   */
  handleChatMessage(socket, data) {
    const { recipientId, message, bookingId, messageType = 'text' } = data;
    const senderId = socket.user._id.toString();

    if (!recipientId || !message) {
      socket.emit('error', { message: 'Invalid message data' });
      return;
    }

    const chatMessage = {
      id: require('uuid').v4(),
      senderId,
      senderName: socket.user.name,
      senderAvatar: socket.user.avatar,
      recipientId,
      message,
      messageType,
      bookingId,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // Send to recipient
    this.sendToUser(recipientId, 'chat_message', chatMessage);
    
    // Send confirmation back to sender
    socket.emit('message_sent', { 
      ...chatMessage, 
      status: 'delivered' 
    });

    console.log(`💬 Chat message from ${senderId} to ${recipientId}`);
  }

  /**
   * Handle booking status updates
   */
  handleBookingStatusUpdate(socket, data) {
    const { bookingId, status, message, estimatedTime } = data;
    const updatedBy = socket.user._id.toString();

    const statusUpdate = {
      bookingId,
      status,
      message,
      estimatedTime,
      updatedBy,
      updatedByName: socket.user.name,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all users involved in this booking
    this.broadcastToBookingParticipants(bookingId, 'booking_status_update', statusUpdate);
    
    console.log(`📊 Booking ${bookingId} status updated to ${status} by ${updatedBy}`);
  }

  /**
   * Handle service requests (from customers to providers)
   */
  handleServiceRequest(socket, data) {
    const { providerId, serviceDetails, location, urgency = 'normal' } = data;
    const customerId = socket.user._id.toString();

    const serviceRequest = {
      id: require('uuid').v4(),
      customerId,
      customerName: socket.user.name,
      customerAvatar: socket.user.avatar,
      providerId,
      serviceDetails,
      location,
      urgency,
      timestamp: new Date().toISOString()
    };

    // Send to specific provider
    this.sendToUser(providerId, 'service_request', serviceRequest);
    
    // Send confirmation to customer
    socket.emit('service_request_sent', {
      requestId: serviceRequest.id,
      status: 'sent',
      timestamp: serviceRequest.timestamp
    });

    console.log(`🔔 Service request from customer ${customerId} to provider ${providerId}`);
  }

  /**
   * Handle typing indicators
   */
  handleTypingIndicator(socket, data, isTyping) {
    const { recipientId, chatId } = data;
    const senderId = socket.user._id.toString();

    this.sendToUser(recipientId, 'typing_indicator', {
      senderId,
      senderName: socket.user.name,
      chatId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle socket disconnection
   */
  handleDisconnection(socket, reason) {
    const userData = this.userSockets.get(socket.id);
    if (!userData) return;

    const userId = userData.userId;
    
    console.log(`🔌 User ${userData.user.name} (${userId}) disconnected: ${reason}`);
    
    // Remove from tracking maps
    this.connectedUsers.delete(userId);
    this.userSockets.delete(socket.id);
    
    // Update user status
    this.updateUserStatus(userId, 'offline');
    
    // Notify relevant users about offline status
    this.broadcastUserStatusUpdate(userId, 'offline');
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  /**
   * Send message to multiple users
   */
  sendToUsers(userIds, event, data) {
    const results = userIds.map(userId => this.sendToUser(userId, event, data));
    return results.filter(Boolean).length; // Return count of successful sends
  }

  /**
   * Broadcast to room
   */
  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  /**
   * Broadcast to all customers
   */
  broadcastToCustomers(event, data) {
    this.broadcastToRoom('customers', event, data);
  }

  /**
   * Broadcast to all providers
   */
  broadcastToProviders(event, data) {
    this.broadcastToRoom('providers', event, data);
  }

  /**
   * Broadcast user status update to relevant users
   */
  broadcastUserStatusUpdate(userId, status) {
    // This would broadcast to users who have recent interactions
    // Implementation depends on business logic
    console.log(`👤 User ${userId} is now ${status}`);
  }

  /**
   * Broadcast to customers with active bookings with a provider
   */
  broadcastToRelevantCustomers(providerId, event, data) {
    // This would query the database for active bookings
    // and send updates to relevant customers
    // Simplified implementation for now
    console.log(`📤 Broadcasting ${event} from provider ${providerId}`);
  }

  /**
   * Broadcast to all participants of a booking
   */
  broadcastToBookingParticipants(bookingId, event, data) {
    // This would query the booking to find all participants
    // and send updates to them
    this.broadcastToRoom(`booking_${bookingId}`, event, data);
    console.log(`📤 Broadcasting ${event} to booking ${bookingId} participants`);
  }

  /**
   * Update user's online status
   */
  updateUserStatus(userId, status) {
    // This could update a Redis cache or database
    // For now, just log it
    console.log(`Status update: User ${userId} is ${status}`);
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(socketId) {
    const userData = this.userSockets.get(socketId);
    if (userData) {
      userData.lastActivity = new Date();
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return {
      total: this.connectedUsers.size,
      customers: Array.from(this.userSockets.values()).filter(u => u.user.userType === 'customer').length,
      providers: Array.from(this.userSockets.values()).filter(u => u.user.userType === 'provider').length
    };
  }

  /**
   * Get user connection info
   */
  getUserConnectionInfo(userId) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      return this.userSockets.get(socketId);
    }
    return null;
  }

  /**
   * Cleanup inactive connections
   */
  cleanupInactiveConnections() {
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
    const now = new Date();
    
    for (const [socketId, userData] of this.userSockets.entries()) {
      if (now - userData.lastActivity > maxInactiveTime) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      }
    }
  }

  /**
   * Send system-wide notification
   */
  sendSystemNotification(event, data, targetAudience = 'all') {
    switch (targetAudience) {
      case 'customers':
        this.broadcastToCustomers(event, data);
        break;
      case 'providers':
        this.broadcastToProviders(event, data);
        break;
      case 'all':
      default:
        this.io.emit(event, data);
        break;
    }
  }
}

// Export singleton instance
module.exports = new SocketService();
