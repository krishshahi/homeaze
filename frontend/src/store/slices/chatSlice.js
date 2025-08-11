// Chat Redux Slice - State Management for Real-time Messaging
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as chatApi from '../../services/chatApi';

// Async thunks for API calls
export const fetchUserConversations = createAsyncThunk(
  'chat/fetchUserConversations',
  async ({ params, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.getUserConversations(params, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getOrCreateConversation = createAsyncThunk(
  'chat/getOrCreateConversation',
  async ({ conversationData, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.getOrCreateConversation(conversationData, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConversationDetails = createAsyncThunk(
  'chat/fetchConversationDetails',
  async ({ conversationId, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.getConversationDetails(conversationId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConversationMessages = createAsyncThunk(
  'chat/fetchConversationMessages',
  async ({ conversationId, params, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.getConversationMessages(conversationId, params, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, messageData, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.sendMessage(conversationId, messageData, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMediaMessage = createAsyncThunk(
  'chat/sendMediaMessage',
  async ({ conversationId, mediaFile, messageData, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.sendMediaMessage(conversationId, mediaFile, messageData, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMessage = createAsyncThunk(
  'chat/updateMessage',
  async ({ conversationId, messageId, updateData, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.updateMessage(conversationId, messageId, updateData, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, messageId, updateData, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async ({ conversationId, messageId, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.deleteMessage(conversationId, messageId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, messageId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async ({ conversationId, messageIds, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.markMessagesAsRead(conversationId, messageIds, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, messageIds, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMessageReaction = createAsyncThunk(
  'chat/addMessageReaction',
  async ({ conversationId, messageId, reaction, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.addMessageReaction(conversationId, messageId, reaction, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, messageId, reaction, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeMessageReaction = createAsyncThunk(
  'chat/removeMessageReaction',
  async ({ conversationId, messageId, reaction, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.removeMessageReaction(conversationId, messageId, reaction, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, messageId, reaction, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTypingStatus = createAsyncThunk(
  'chat/updateTypingStatus',
  async ({ conversationId, isTyping, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.updateTypingStatus(conversationId, isTyping, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, isTyping, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnreadMessageCount = createAsyncThunk(
  'chat/fetchUnreadMessageCount',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.getUnreadMessageCount(token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchConversations = createAsyncThunk(
  'chat/searchConversations',
  async ({ searchParams, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.searchConversations(searchParams, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const archiveConversation = createAsyncThunk(
  'chat/archiveConversation',
  async ({ conversationId, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.archiveConversation(conversationId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const muteConversation = createAsyncThunk(
  'chat/muteConversation',
  async ({ conversationId, duration, token }, { rejectWithValue }) => {
    try {
      const response = await chatApi.muteConversation(conversationId, duration, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { conversationId, duration, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Conversations
  conversations: [],
  totalConversations: 0,
  conversationPagination: {
    page: 1,
    limit: 20,
    totalPages: 1
  },

  // Current active conversation
  activeConversationId: null,
  activeConversation: null,

  // Messages for each conversation
  conversationMessages: {}, // { conversationId: { messages: [], pagination: {} } }

  // Search results
  searchResults: [],
  searchPagination: {
    page: 1,
    limit: 20,
    totalPages: 1
  },

  // Unread messages
  unreadCount: 0,
  unreadByConversation: {}, // { conversationId: count }

  // Typing indicators
  typingUsers: {}, // { conversationId: [userId1, userId2] }

  // Real-time status
  onlineUsers: [], // Changed from Set to Array for Redux serialization
  
  // UI state
  loading: {
    conversations: false,
    messages: false,
    send: false,
    details: false,
    search: false,
    unread: false
  },

  // Error state
  error: {
    conversations: null,
    messages: null,
    send: null,
    details: null,
    search: null,
    unread: null
  },

  // WebSocket connection status
  socketConnected: false,
  socketError: null,

  // Message draft storage
  messageDrafts: {}, // { conversationId: draftText }

  // Filters and settings
  filters: {
    showArchived: false,
    sortBy: 'lastActivity',
    searchQuery: ''
  }
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // WebSocket connection management
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
      if (action.payload) {
        state.socketError = null;
      }
    },

    setSocketError: (state, action) => {
      state.socketError = action.payload;
      state.socketConnected = false;
    },

    // Real-time message received
    receiveMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      
      // Add message to conversation
      if (state.conversationMessages[conversationId]) {
        state.conversationMessages[conversationId].messages.push(message);
      } else {
        state.conversationMessages[conversationId] = {
          messages: [message],
          pagination: { page: 1, limit: 50, totalPages: 1 }
        };
      }

      // Update conversation's last message
      const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
        state.conversations[conversationIndex].lastActivity = message.createdAt;
        
        // Move conversation to top
        const conversation = state.conversations[conversationIndex];
        state.conversations.splice(conversationIndex, 1);
        state.conversations.unshift(conversation);
      }

      // Update unread count if message is not from current user
      if (message.sender.id !== state.currentUserId && conversationId !== state.activeConversationId) {
        state.unreadCount += 1;
        state.unreadByConversation[conversationId] = (state.unreadByConversation[conversationId] || 0) + 1;
      }
    },

    // Real-time message update
    updateMessageInState: (state, action) => {
      const { conversationId, messageId, updates } = action.payload;
      
      if (state.conversationMessages[conversationId]) {
        const messageIndex = state.conversationMessages[conversationId].messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          state.conversationMessages[conversationId].messages[messageIndex] = {
            ...state.conversationMessages[conversationId].messages[messageIndex],
            ...updates
          };
        }
      }
    },

    // Real-time message deletion
    removeMessageFromState: (state, action) => {
      const { conversationId, messageId } = action.payload;
      
      if (state.conversationMessages[conversationId]) {
        state.conversationMessages[conversationId].messages = 
          state.conversationMessages[conversationId].messages.filter(msg => msg.id !== messageId);
      }
    },

    // Typing indicators
    setTypingUsers: (state, action) => {
      const { conversationId, users } = action.payload;
      state.typingUsers[conversationId] = users;
    },

    addTypingUser: (state, action) => {
      const { conversationId, userId } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      if (!state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      }
    },

    removeTypingUser: (state, action) => {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
      }
    },

    // Online status
    setUserOnline: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },

    setUserOffline: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(userId => userId !== action.payload);
    },

    setOnlineUsers: (state, action) => {
      state.onlineUsers = Array.isArray(action.payload) ? action.payload : [];
    },

    // Active conversation
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
      
      // Mark messages as read when conversation becomes active
      if (action.payload && state.unreadByConversation[action.payload]) {
        state.unreadCount -= state.unreadByConversation[action.payload];
        delete state.unreadByConversation[action.payload];
      }
    },

    clearActiveConversation: (state) => {
      state.activeConversationId = null;
      state.activeConversation = null;
    },

    // Message drafts
    setMessageDraft: (state, action) => {
      const { conversationId, draft } = action.payload;
      state.messageDrafts[conversationId] = draft;
    },

    clearMessageDraft: (state, action) => {
      const conversationId = action.payload;
      delete state.messageDrafts[conversationId];
    },

    // Filters
    setChatFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear errors
    clearChatErrors: (state) => {
      state.error = {
        conversations: null,
        messages: null,
        send: null,
        details: null,
        search: null,
        unread: null
      };
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = {
        page: 1,
        limit: 20,
        totalPages: 1
      };
    },

    // Reset chat state
    resetChatState: () => initialState
  },
  extraReducers: (builder) => {
    // Fetch user conversations
    builder
      .addCase(fetchUserConversations.pending, (state) => {
        state.loading.conversations = true;
        state.error.conversations = null;
      })
      .addCase(fetchUserConversations.fulfilled, (state, action) => {
        state.loading.conversations = false;
        state.conversations = action.payload.data;
        state.totalConversations = action.payload.total;
        if (action.payload.pagination) {
          state.conversationPagination = action.payload.pagination;
        }
      })
      .addCase(fetchUserConversations.rejected, (state, action) => {
        state.loading.conversations = false;
        state.error.conversations = action.payload;
      });

    // Get or create conversation
    builder
      .addCase(getOrCreateConversation.fulfilled, (state, action) => {
        const conversation = action.payload.data;
        
        // Check if conversation already exists
        const existingIndex = state.conversations.findIndex(conv => conv.id === conversation.id);
        if (existingIndex !== -1) {
          state.conversations[existingIndex] = conversation;
        } else {
          state.conversations.unshift(conversation);
          state.totalConversations += 1;
        }
      });

    // Fetch conversation details
    builder
      .addCase(fetchConversationDetails.pending, (state) => {
        state.loading.details = true;
        state.error.details = null;
      })
      .addCase(fetchConversationDetails.fulfilled, (state, action) => {
        state.loading.details = false;
        const { conversationId, data } = action.payload;
        state.activeConversation = data;
        
        // Update in conversations list if exists
        const index = state.conversations.findIndex(conv => conv.id === conversationId);
        if (index !== -1) {
          state.conversations[index] = { ...state.conversations[index], ...data };
        }
      })
      .addCase(fetchConversationDetails.rejected, (state, action) => {
        state.loading.details = false;
        state.error.details = action.payload;
      });

    // Fetch conversation messages
    builder
      .addCase(fetchConversationMessages.pending, (state) => {
        state.loading.messages = true;
        state.error.messages = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        const { conversationId, data, pagination } = action.payload;
        
        state.conversationMessages[conversationId] = {
          messages: data,
          pagination: pagination || { page: 1, limit: 50, totalPages: 1 }
        };
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.loading.messages = false;
        state.error.messages = action.payload;
      });

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading.send = true;
        state.error.send = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.send = false;
        const { conversationId, data } = action.payload;
        
        // Add message to conversation
        if (state.conversationMessages[conversationId]) {
          state.conversationMessages[conversationId].messages.push(data);
        } else {
          state.conversationMessages[conversationId] = {
            messages: [data],
            pagination: { page: 1, limit: 50, totalPages: 1 }
          };
        }

        // Update conversation's last message
        const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].lastMessage = data;
          state.conversations[conversationIndex].lastActivity = data.createdAt;
          
          // Move to top
          const conversation = state.conversations[conversationIndex];
          state.conversations.splice(conversationIndex, 1);
          state.conversations.unshift(conversation);
        }

        // Clear draft
        delete state.messageDrafts[conversationId];
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.send = false;
        state.error.send = action.payload;
      });

    // Send media message
    builder
      .addCase(sendMediaMessage.fulfilled, (state, action) => {
        const { conversationId, data } = action.payload;
        
        // Add message to conversation
        if (state.conversationMessages[conversationId]) {
          state.conversationMessages[conversationId].messages.push(data);
        } else {
          state.conversationMessages[conversationId] = {
            messages: [data],
            pagination: { page: 1, limit: 50, totalPages: 1 }
          };
        }

        // Update conversation's last message
        const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].lastMessage = data;
          state.conversations[conversationIndex].lastActivity = data.createdAt;
        }
      });

    // Mark messages as read
    builder
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { conversationId, messageIds } = action.payload;
        
        // Update message read status
        if (state.conversationMessages[conversationId]) {
          state.conversationMessages[conversationId].messages.forEach(message => {
            if (messageIds.includes(message.id)) {
              message.deliveryStatus.read = true;
              message.deliveryStatus.readAt = new Date().toISOString();
            }
          });
        }

        // Update unread counts
        const unreadCount = state.unreadByConversation[conversationId] || 0;
        state.unreadCount = Math.max(0, state.unreadCount - unreadCount);
        delete state.unreadByConversation[conversationId];
      });

    // Fetch unread message count
    builder
      .addCase(fetchUnreadMessageCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.data.count;
        if (action.payload.data.byConversation) {
          state.unreadByConversation = action.payload.data.byConversation;
        }
      });

    // Search conversations
    builder
      .addCase(searchConversations.pending, (state) => {
        state.loading.search = true;
        state.error.search = null;
      })
      .addCase(searchConversations.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults = action.payload.data;
        if (action.payload.pagination) {
          state.searchPagination = action.payload.pagination;
        }
      })
      .addCase(searchConversations.rejected, (state, action) => {
        state.loading.search = false;
        state.error.search = action.payload;
      });

    // Archive conversation
    builder
      .addCase(archiveConversation.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
        
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].isArchived = true;
          
          // Remove from main list if not showing archived
          if (!state.filters.showArchived) {
            state.conversations.splice(conversationIndex, 1);
            state.totalConversations -= 1;
          }
        }
      });

    // Mute conversation
    builder
      .addCase(muteConversation.fulfilled, (state, action) => {
        const { conversationId, duration } = action.payload;
        const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
        
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].isMuted = true;
          state.conversations[conversationIndex].mutedUntil = new Date(Date.now() + duration).toISOString();
        }
      });
  }
});

export const {
  setSocketConnected,
  setSocketError,
  receiveMessage,
  updateMessageInState,
  removeMessageFromState,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  setUserOnline,
  setUserOffline,
  setOnlineUsers,
  setActiveConversation,
  clearActiveConversation,
  setMessageDraft,
  clearMessageDraft,
  setChatFilters,
  clearChatErrors,
  clearSearchResults,
  resetChatState
} = chatSlice.actions;

export default chatSlice.reducer;
