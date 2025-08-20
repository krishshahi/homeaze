// Enhanced Messaging API service - Production Ready
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.129:3001/api';
const WEBSOCKET_URL = (process.env.REACT_APP_API_URL || 'http://192.168.1.129:3001/api').replace(/\/api$/, '');

class MessagingAPI {
  static socket = null;
  static messageListeners = [];
  static activeChats = new Map();
  
  /**
   * Get authorization header with token
   * @returns {Promise<Object>} Authorization headers
   */
  static async getAuthHeaders() {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      };
    } catch (error) {
      return {
        'Content-Type': 'application/json',
      };
    }
  }
  
  /**
   * Initialize messaging service
   * @param {Function} onMessageReceived - Callback when message is received
   * @param {Function} onTypingUpdate - Callback when typing status changes
   */
  static async initialize(onMessageReceived, onTypingUpdate) {
    try {
      console.log('💬 Initializing messaging service...');
      
      await this.initializeWebSocket();
      this.setupMessageListeners(onMessageReceived, onTypingUpdate);
      
      console.log('✅ Messaging service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing messaging service:', error);
    }
  }
  
  /**
   * Initialize WebSocket connection for real-time messaging
   */
  static async initializeWebSocket() {
    try {
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      if (!token) {
        console.log('❌ No auth token found for messaging WebSocket');
        return;
      }
      
      this.socket = io(WEBSOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });
      
      this.socket.on('connect', () => {
        console.log('🔗 Connected to messaging WebSocket');
        
        // Rejoin active chats
        this.activeChats.forEach((_, chatId) => {
          this.socket.emit('join_chat', chatId);
        });
      });
      
      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from messaging WebSocket');
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('❌ Messaging WebSocket connection error:', error);
      });
      
    } catch (error) {
      console.error('❌ Error initializing messaging WebSocket:', error);
    }
  }
  
  /**
   * Set up message listeners
   */
  static setupMessageListeners(onMessageReceived, onTypingUpdate) {
    if (!this.socket) return;
    
    // Listen for new messages
    this.socket.on('message_received', (message) => {
      console.log('📨 New message received:', message);
      if (onMessageReceived) {
        onMessageReceived(message);
      }
    });
    
    // Listen for message status updates
    this.socket.on('message_status_updated', (data) => {
      console.log('📬 Message status updated:', data);
      // Handle message delivery/read status updates
    });
    
    // Listen for typing indicators
    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User typing:', data);
      if (onTypingUpdate) {
        onTypingUpdate(data);
      }
    });
    
    // Listen for user online status
    this.socket.on('user_status_changed', (data) => {
      console.log('🟢 User status changed:', data);
      // Handle online/offline status updates
    });
  }
  
  /**
   * Get conversations list for current user
   * @param {Object} filters - Optional filters (search, status, etc.)
   * @returns {Promise} API response with conversations
   */
  static async getConversations(filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = `${API_BASE_URL}/messages/conversations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch conversations');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get messages for a specific conversation
   * @param {string} conversationId - Conversation ID
   * @param {Object} pagination - Pagination options (page, limit, before, after)
   * @returns {Promise} API response with messages
   */
  static async getMessages(conversationId, pagination = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams();
      Object.keys(pagination).forEach(key => {
        if (pagination[key] !== undefined && pagination[key] !== null) {
          queryParams.append(key, pagination[key]);
        }
      });
      
      const url = `${API_BASE_URL}/messages/conversations/${conversationId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch messages');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Send a new message
   * @param {string} conversationId - Conversation ID
   * @param {Object} messageData - Message data
   * @returns {Promise} API response with created message
   */
  static async sendMessage(conversationId, messageData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(messageData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      
      // Emit via WebSocket for real-time delivery
      if (this.socket) {
        this.socket.emit('send_message', {
          conversationId,
          message: data,
        });
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Create or get conversation between users
   * @param {Object} participants - Participant details
   * @param {string} bookingId - Optional booking ID
   * @returns {Promise} API response with conversation
   */
  static async createOrGetConversation(participants, bookingId = null) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          participants,
          bookingId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create conversation');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Join a chat room for real-time updates
   * @param {string} conversationId - Conversation ID
   */
  static joinChat(conversationId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_chat', conversationId);
      this.activeChats.set(conversationId, true);
      console.log('🏠 Joined chat:', conversationId);
    }
  }
  
  /**
   * Leave a chat room
   * @param {string} conversationId - Conversation ID
   */
  static leaveChat(conversationId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_chat', conversationId);
      this.activeChats.delete(conversationId);
      console.log('👋 Left chat:', conversationId);
    }
  }
  
  /**
   * Send typing indicator
   * @param {string} conversationId - Conversation ID
   * @param {boolean} isTyping - Whether user is typing
   */
  static sendTypingIndicator(conversationId, isTyping) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing', {
        conversationId,
        isTyping,
      });
    }
  }
  
  /**
   * Mark messages as read
   * @param {string} conversationId - Conversation ID
   * @param {Array} messageIds - Array of message IDs to mark as read
   * @returns {Promise} API response
   */
  static async markMessagesAsRead(conversationId, messageIds = []) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          messageIds: messageIds.length > 0 ? messageIds : undefined, // Mark all if empty
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark messages as read');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Delete a message
   * @param {string} conversationId - Conversation ID
   * @param {string} messageId - Message ID
   * @returns {Promise} API response
   */
  static async deleteMessage(conversationId, messageId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/messages/${messageId}`, {
        method: 'DELETE',
        headers,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete message');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Upload media for message
   * @param {Object} mediaFile - Media file data
   * @returns {Promise} API response with media URL
   */
  static async uploadMedia(mediaFile) {
    try {
      const headers = await this.getAuthHeaders();
      delete headers['Content-Type']; // Let browser set it for multipart
      
      const formData = new FormData();
      formData.append('media', mediaFile);
      
      const response = await fetch(`${API_BASE_URL}/messages/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload media');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Search messages
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {Promise} API response with search results
   */
  static async searchMessages(query, filters = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const queryParams = new URLSearchParams({
        q: query,
        ...filters,
      });
      
      const response = await fetch(`${API_BASE_URL}/messages/search?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search messages');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get unread messages count
   * @returns {Promise} API response with unread count
   */
  static async getUnreadCount() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/messages/unread-count`, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch unread count');
      }
      
      return data.count;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      return 0;
    }
  }
  
  /**
   * Block a user
   * @param {string} userId - User ID to block
   * @returns {Promise} API response
   */
  static async blockUser(userId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/messages/block`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to block user');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Unblock a user
   * @param {string} userId - User ID to unblock
   * @returns {Promise} API response
   */
  static async unblockUser(userId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/messages/unblock`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to unblock user');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Report a conversation or message
   * @param {Object} reportData - Report details
   * @returns {Promise} API response
   */
  static async reportContent(reportData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/messages/report`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reportData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Clean up messaging service
   */
  static cleanup() {
    // Clear active chats
    this.activeChats.clear();
    
    // Disconnect WebSocket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    console.log('🧹 Messaging service cleaned up');
  }
  
  /**
   * Reconnect WebSocket if disconnected
   */
  static async reconnectWebSocket() {
    if (!this.socket || !this.socket.connected) {
      console.log('🔄 Reconnecting messaging WebSocket...');
      await this.initializeWebSocket();
    }
  }
  
  /**
   * Format message for display
   * @param {Object} message - Raw message object
   * @param {string} currentUserId - Current user ID
   * @returns {Object} Formatted message
   */
  static formatMessage(message, currentUserId) {
    return {
      ...message,
      isMe: message.senderId === currentUserId,
      timestamp: message.createdAt || message.timestamp,
    };
  }
  
  /**
   * Format conversation for display
   * @param {Object} conversation - Raw conversation object
   * @param {string} currentUserId - Current user ID
   * @returns {Object} Formatted conversation
   */
  static formatConversation(conversation, currentUserId) {
    // Find the other participant
    const otherParticipant = conversation.participants.find(
      p => p.userId !== currentUserId
    );
    
    return {
      ...conversation,
      recipientName: otherParticipant?.user?.name || 'Unknown User',
      recipientId: otherParticipant?.userId,
      lastMessageText: conversation.lastMessage?.text || '',
      lastMessageTime: conversation.lastMessage?.createdAt || conversation.updatedAt,
      unreadCount: conversation.unreadCount || 0,
    };
  }
}

export default MessagingAPI;
