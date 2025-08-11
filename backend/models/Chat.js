const mongoose = require('mongoose');

// Individual Message Schema
const messageSchema = new mongoose.Schema({
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['customer', 'provider', 'admin', 'system'],
      required: true
    },
    name: String,
    avatar: String
  },
  content: {
    text: {
      type: String,
      trim: true,
      maxlength: 5000
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'quote', 'booking_update', 'system'],
      default: 'text'
    },
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'video', 'audio', 'document', 'other']
      },
      url: String,
      name: String,
      size: Number,
      mimeType: String,
      thumbnail: String // For images/videos
    }],
    metadata: {
      location: {
        coordinates: [Number], // [longitude, latitude]
        address: String
      },
      quoteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quote'
      },
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      },
      systemEventType: String, // For system messages
      originalMessage: String, // For edited messages
      mentions: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        name: String,
        position: Number // Position in text where mention occurs
      }]
    }
  },
  status: {
    sent: { type: Date, default: Date.now },
    delivered: Date,
    read: Date,
    deliveryStatus: {
      type: String,
      enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
      default: 'sending'
    }
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    timestamp: { type: Date, default: Date.now }
  }],
  isEdited: { type: Boolean, default: false },
  editHistory: [{
    previousText: String,
    editedAt: { type: Date, default: Date.now },
    reason: String
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replyTo: {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    preview: String // Preview of the message being replied to
  },
  importance: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [String], // For categorizing messages
  translation: {
    originalLanguage: String,
    translations: [{
      language: String,
      text: String,
      confidence: Number
    }]
  }
}, {
  timestamps: true
});

// Main Chat/Conversation Schema
const chatSchema = new mongoose.Schema({
  // Conversation Identification
  conversationId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'support', 'booking_related', 'quote_related'],
    default: 'direct'
  },

  // Participants
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userType: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'moderator'],
      default: 'member'
    },
    joinedAt: { type: Date, default: Date.now },
    lastReadAt: Date,
    leftAt: Date,
    isActive: { type: Boolean, default: true },
    notificationSettings: {
      muted: { type: Boolean, default: false },
      muteUntil: Date,
      preferences: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      }
    }
  }],

  // Related Context
  context: {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    quoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quote'
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider'
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    ticketId: String, // For support conversations
    relatedChats: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    }]
  },

  // Messages
  messages: [messageSchema],
  
  // Conversation Metadata
  metadata: {
    totalMessages: { type: Number, default: 0 },
    lastMessageAt: Date,
    lastMessageBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: String, // For topic-based conversations
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    language: { type: String, default: 'en' },
    autoTranslate: { type: Boolean, default: false }
  },

  // Status and Lifecycle
  status: {
    type: String,
    enum: ['active', 'archived', 'closed', 'blocked', 'escalated'],
    default: 'active'
  },
  lifecycle: {
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    closedAt: Date,
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    archivedAt: Date,
    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolution: {
      status: {
        type: String,
        enum: ['resolved', 'unresolved', 'escalated', 'cancelled']
      },
      notes: String,
      rating: { type: Number, min: 1, max: 5 },
      feedback: String
    }
  },

  // Security and Privacy
  security: {
    isEncrypted: { type: Boolean, default: false },
    encryptionKey: String,
    accessLevel: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'private'
    },
    blockedUsers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      blockedAt: { type: Date, default: Date.now },
      reason: String
    }],
    reportedBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      reportedAt: { type: Date, default: Date.now }
    }]
  },

  // Analytics and Insights
  analytics: {
    responseTime: {
      average: Number, // in minutes
      provider: Number,
      customer: Number
    },
    participationRate: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      messageCount: Number,
      lastActive: Date
    }],
    busyHours: [{
      hour: Number,
      messageCount: Number
    }],
    sentiment: {
      overall: {
        type: String,
        enum: ['positive', 'neutral', 'negative']
      },
      scores: [{
        messageId: {
          type: mongoose.Schema.Types.ObjectId
        },
        sentiment: String,
        confidence: Number
      }]
    },
    satisfaction: {
      rating: Number,
      feedback: String,
      ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      ratedAt: Date
    }
  },

  // Automation and AI
  automation: {
    autoResponders: [{
      trigger: String,
      response: String,
      isActive: Boolean,
      conditions: [String]
    }],
    aiAssistant: {
      enabled: { type: Boolean, default: false },
      suggestions: [{
        type: {
          type: String,
          enum: ['quick_reply', 'action', 'escalation']
        },
        content: String,
        confidence: Number,
        createdAt: { type: Date, default: Date.now }
      }],
      interventions: [{
        type: String,
        reason: String,
        timestamp: { type: Date, default: Date.now }
      }]
    },
    chatbot: {
      active: { type: Boolean, default: false },
      handoffToHuman: { type: Boolean, default: false },
      handoffReason: String
    }
  },

  // Integration Hooks
  integrations: {
    webhookUrl: String,
    externalChatId: String, // For third-party chat systems
    syncWithCRM: { type: Boolean, default: false },
    exportedTo: [String] // Systems this chat has been exported to
  },

  // Moderation
  moderation: {
    flagged: { type: Boolean, default: false },
    flaggedReason: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    autoModeration: {
      profanityFilter: { type: Boolean, default: true },
      spamDetection: { type: Boolean, default: true },
      sentimentMonitoring: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
chatSchema.index({ conversationId: 1 });
chatSchema.index({ 'participants.userId': 1, status: 1 });
chatSchema.index({ 'context.bookingId': 1 });
chatSchema.index({ 'context.quoteId': 1 });
chatSchema.index({ 'context.providerId': 1 });
chatSchema.index({ 'metadata.lastMessageAt': -1 });
chatSchema.index({ status: 1, 'lifecycle.lastActivityAt': -1 });
chatSchema.index({ type: 1, 'metadata.priority': -1 });

// Message indexes
messageSchema.index({ 'sender.userId': 1, createdAt: -1 });
messageSchema.index({ 'content.type': 1 });
messageSchema.index({ 'status.deliveryStatus': 1 });

// Virtual for unread message count per participant
chatSchema.virtual('unreadCounts').get(function() {
  return this.participants.map(participant => {
    const lastReadAt = participant.lastReadAt || participant.joinedAt;
    const unreadCount = this.messages.filter(msg => 
      msg.createdAt > lastReadAt && 
      msg.sender.userId.toString() !== participant.userId.toString()
    ).length;
    
    return {
      userId: participant.userId,
      unreadCount
    };
  });
});

// Virtual for active participants
chatSchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => p.isActive && !p.leftAt);
});

// Method to add message
chatSchema.methods.addMessage = function(senderData, content, type = 'text') {
  const message = {
    sender: senderData,
    content: {
      text: content.text,
      type,
      attachments: content.attachments || [],
      metadata: content.metadata || {}
    },
    importance: content.importance || 'normal',
    replyTo: content.replyTo,
    tags: content.tags || []
  };

  this.messages.push(message);
  this.metadata.totalMessages++;
  this.metadata.lastMessageAt = new Date();
  this.metadata.lastMessageBy = senderData.userId;
  this.lifecycle.lastActivityAt = new Date();

  return this.messages[this.messages.length - 1];
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId, messageId = null) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (!participant) return false;

  if (messageId) {
    // Mark specific message as read
    const message = this.messages.id(messageId);
    if (message && message.sender.userId.toString() !== userId.toString()) {
      message.status.read = new Date();
      message.status.deliveryStatus = 'read';
    }
  } else {
    // Mark all messages as read up to now
    participant.lastReadAt = new Date();
    this.messages.forEach(message => {
      if (message.sender.userId.toString() !== userId.toString() && 
          !message.status.read) {
        message.status.read = new Date();
        message.status.deliveryStatus = 'read';
      }
    });
  }

  return true;
};

// Method to add participant
chatSchema.methods.addParticipant = function(userId, userType, role = 'member') {
  const existingParticipant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (existingParticipant) {
    if (existingParticipant.leftAt) {
      existingParticipant.leftAt = null;
      existingParticipant.isActive = true;
      existingParticipant.joinedAt = new Date();
    }
    return existingParticipant;
  }

  const newParticipant = {
    userId,
    userType,
    role,
    joinedAt: new Date(),
    isActive: true
  };

  this.participants.push(newParticipant);
  return newParticipant;
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant) {
    participant.leftAt = new Date();
    participant.isActive = false;
    return true;
  }
  return false;
};

// Method to get conversation summary
chatSchema.methods.getSummary = function() {
  const recentMessages = this.messages
    .filter(m => !m.isDeleted)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return {
    id: this._id,
    conversationId: this.conversationId,
    title: this.title,
    type: this.type,
    participantCount: this.activeParticipants.length,
    lastMessage: recentMessages[0],
    unreadCount: this.unreadCounts,
    lastActivity: this.lifecycle.lastActivityAt,
    status: this.status,
    context: this.context
  };
};

// Method to calculate response time
chatSchema.methods.calculateResponseTime = function() {
  const messages = this.messages.filter(m => !m.isDeleted).sort((a, b) => a.createdAt - b.createdAt);
  const responseTimes = [];

  for (let i = 1; i < messages.length; i++) {
    const prevMsg = messages[i - 1];
    const currMsg = messages[i];
    
    if (prevMsg.sender.userId.toString() !== currMsg.sender.userId.toString()) {
      const responseTime = (currMsg.createdAt - prevMsg.createdAt) / (1000 * 60); // in minutes
      responseTimes.push(responseTime);
    }
  }

  if (responseTimes.length === 0) return 0;
  return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
};

// Static method to find conversations by user
chatSchema.statics.findByUser = function(userId, status = 'active', options = {}) {
  const { limit = 50, skip = 0, sortBy = 'lastActivityAt' } = options;
  
  return this.find({
    'participants.userId': userId,
    'participants.isActive': true,
    status
  })
  .sort({ [`lifecycle.${sortBy}`]: -1 })
  .limit(limit)
  .skip(skip)
  .populate('participants.userId', 'firstName lastName avatar')
  .populate('context.bookingId', 'bookingNumber status')
  .populate('context.quoteId', 'quoteNumber status');
};

// Static method to search conversations
chatSchema.statics.search = function(query, userId, options = {}) {
  const { limit = 20, skip = 0 } = options;
  
  return this.find({
    'participants.userId': userId,
    'participants.isActive': true,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { 'messages.content.text': { $regex: query, $options: 'i' } }
    ]
  })
  .sort({ 'lifecycle.lastActivityAt': -1 })
  .limit(limit)
  .skip(skip);
};

// Pre-save middleware to update conversation title
chatSchema.pre('save', function(next) {
  if (!this.title && this.type === 'direct' && this.participants.length === 2) {
    // For direct chats, create title from participant names
    this.populate('participants.userId', 'firstName lastName')
      .then(() => {
        const names = this.participants
          .map(p => `${p.userId.firstName} ${p.userId.lastName}`)
          .join(' & ');
        this.title = names;
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

module.exports = mongoose.model('Chat', chatSchema);
