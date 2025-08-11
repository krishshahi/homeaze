// Chat/Messaging API Service - Frontend Integration for Real-time Communication
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiUpload, API_ENDPOINTS } from '../config/api';

// Get user conversations
export const getUserConversations = async (params = {}, token) => {
  try {
    console.log('💬 Fetching user conversations:', params);
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/chat/conversations?${queryString}` : '/chat/conversations';
    
    const response = await apiGet(endpoint, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Get conversations error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get or create conversation
export const getOrCreateConversation = async (conversationData, token) => {
  try {
    console.log('🆕 Getting/creating conversation:', conversationData);
    const response = await apiPost('/chat/conversations', conversationData, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Get/create conversation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get conversation details
export const getConversationDetails = async (conversationId, token) => {
  try {
    console.log('🔍 Fetching conversation details:', conversationId);
    const response = await apiGet(`/chat/conversations/${conversationId}`, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get conversation details error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get messages in conversation
export const getConversationMessages = async (conversationId, params = {}, token) => {
  try {
    console.log('📨 Fetching conversation messages:', conversationId, params);
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/chat/conversations/${conversationId}/messages?${queryString}` 
      : `/chat/conversations/${conversationId}/messages`;
    
    const response = await apiGet(endpoint, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Get messages error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Send message
export const sendMessage = async (conversationId, messageData, token) => {
  try {
    console.log('📤 Sending message:', conversationId, messageData);
    const response = await apiPost(`/chat/conversations/${conversationId}/messages`, messageData, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Send message error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send media message (image, file)
export const sendMediaMessage = async (conversationId, mediaFile, messageData, token) => {
  try {
    console.log('📷 Sending media message:', conversationId, messageData);
    const formData = new FormData();
    formData.append('media', mediaFile);
    
    // Add other message data
    Object.keys(messageData).forEach(key => {
      formData.append(key, messageData[key]);
    });

    const response = await apiUpload(`/chat/conversations/${conversationId}/messages/media`, formData, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Send media message error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update message
export const updateMessage = async (conversationId, messageId, updateData, token) => {
  try {
    console.log('✏️ Updating message:', conversationId, messageId, updateData);
    const response = await apiPut(`/chat/conversations/${conversationId}/messages/${messageId}`, updateData, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Update message error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete message
export const deleteMessage = async (conversationId, messageId, token) => {
  try {
    console.log('🗑️ Deleting message:', conversationId, messageId);
    const response = await apiDelete(`/chat/conversations/${conversationId}/messages/${messageId}`, token);
    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Delete message error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId, messageIds, token) => {
  try {
    console.log('👁️ Marking messages as read:', conversationId, messageIds);
    const response = await apiPost(`/chat/conversations/${conversationId}/read`, { messageIds }, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Mark messages as read error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add reaction to message
export const addMessageReaction = async (conversationId, messageId, reaction, token) => {
  try {
    console.log('😊 Adding message reaction:', conversationId, messageId, reaction);
    const response = await apiPost(`/chat/conversations/${conversationId}/messages/${messageId}/reactions`, 
      { reaction }, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Add message reaction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Remove reaction from message
export const removeMessageReaction = async (conversationId, messageId, reaction, token) => {
  try {
    console.log('😐 Removing message reaction:', conversationId, messageId, reaction);
    const response = await apiDelete(`/chat/conversations/${conversationId}/messages/${messageId}/reactions/${reaction}`, token);
    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Remove message reaction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update user typing status
export const updateTypingStatus = async (conversationId, isTyping, token) => {
  try {
    console.log('⌨️ Updating typing status:', conversationId, isTyping);
    const response = await apiPost(`/chat/conversations/${conversationId}/typing`, { isTyping }, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Update typing status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get unread message count
export const getUnreadMessageCount = async (token) => {
  try {
    console.log('📊 Fetching unread message count');
    const response = await apiGet('/chat/unread-count', token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    return {
      success: false,
      error: error.message,
      data: { count: 0 }
    };
  }
};

// Search conversations and messages
export const searchConversations = async (searchParams, token) => {
  try {
    console.log('🔍 Searching conversations:', searchParams);
    const response = await apiPost('/chat/search', searchParams, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Search conversations error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Archive conversation
export const archiveConversation = async (conversationId, token) => {
  try {
    console.log('📦 Archiving conversation:', conversationId);
    const response = await apiPost(`/chat/conversations/${conversationId}/archive`, {}, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Archive conversation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Unarchive conversation
export const unarchiveConversation = async (conversationId, token) => {
  try {
    console.log('📤 Unarchiving conversation:', conversationId);
    const response = await apiPost(`/chat/conversations/${conversationId}/unarchive`, {}, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Unarchive conversation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Mute conversation
export const muteConversation = async (conversationId, duration, token) => {
  try {
    console.log('🔇 Muting conversation:', conversationId, duration);
    const response = await apiPost(`/chat/conversations/${conversationId}/mute`, { duration }, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Mute conversation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Unmute conversation
export const unmuteConversation = async (conversationId, token) => {
  try {
    console.log('🔊 Unmuting conversation:', conversationId);
    const response = await apiPost(`/chat/conversations/${conversationId}/unmute`, {}, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Unmute conversation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get conversation analytics
export const getConversationAnalytics = async (conversationId, token) => {
  try {
    console.log('📈 Fetching conversation analytics:', conversationId);
    const response = await apiGet(`/chat/conversations/${conversationId}/analytics`, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get conversation analytics error:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
};

export default {
  getUserConversations,
  getOrCreateConversation,
  getConversationDetails,
  getConversationMessages,
  sendMessage,
  sendMediaMessage,
  updateMessage,
  deleteMessage,
  markMessagesAsRead,
  addMessageReaction,
  removeMessageReaction,
  updateTypingStatus,
  getUnreadMessageCount,
  searchConversations,
  archiveConversation,
  unarchiveConversation,
  muteConversation,
  unmuteConversation,
  getConversationAnalytics
};
