// ConversationList Component - Display List of Chat Conversations
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const ConversationItem = ({ 
  conversation, 
  currentUserId,
  onPress, 
  onLongPress,
  unreadCount = 0
}) => {
  // Get other participant info
  const otherParticipant = conversation.participants?.find(
    p => p.userId !== currentUserId
  );

  // Format last message time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Get last message preview
  const getMessagePreview = () => {
    const lastMessage = conversation.lastMessage;
    if (!lastMessage) return 'No messages yet';

    const isOwnMessage = lastMessage.sender?.id === currentUserId;
    const prefix = isOwnMessage ? 'You: ' : '';

    switch (lastMessage.messageType) {
      case 'text':
        return prefix + lastMessage.content;
      case 'image':
        return prefix + '📷 Photo';
      case 'file':
        return prefix + '📎 File';
      case 'quote':
        return prefix + '💼 Quote';
      case 'booking':
        return prefix + '📅 Booking';
      case 'system':
        return lastMessage.content;
      default:
        return prefix + 'Message';
    }
  };

  // Get conversation title
  const getConversationTitle = () => {
    if (conversation.title) {
      return conversation.title;
    }
    
    if (conversation.type === 'group') {
      return conversation.participants
        ?.filter(p => p.userId !== currentUserId)
        .map(p => p.name)
        .join(', ') || 'Group Chat';
    }
    
    return otherParticipant?.name || 'Unknown User';
  };

  // Get status indicators
  const getStatusIndicators = () => {
    const indicators = [];
    
    if (conversation.isMuted) {
      indicators.push('🔇');
    }
    
    if (conversation.isPinned) {
      indicators.push('📌');
    }
    
    if (conversation.isArchived) {
      indicators.push('📦');
    }
    
    return indicators;
  };

  return (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        unreadCount > 0 && styles.unreadConversation
      ]}
      onPress={() => onPress(conversation)}
      onLongPress={() => onLongPress && onLongPress(conversation)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {otherParticipant?.avatar ? (
            <Image
              source={{ uri: otherParticipant.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {getConversationTitle().charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          {/* Online status indicator */}
          {otherParticipant?.isOnline && (
            <View style={styles.onlineIndicator} />
          )}
        </View>

        {/* Conversation Details */}
        <View style={styles.conversationDetails}>
          <View style={styles.conversationHeader}>
            <Text 
              style={[
                styles.conversationTitle,
                unreadCount > 0 && styles.unreadTitle
              ]} 
              numberOfLines={1}
            >
              {getConversationTitle()}
            </Text>
            
            <View style={styles.rightHeader}>
              {/* Status indicators */}
              {getStatusIndicators().map((indicator, index) => (
                <Text key={index} style={styles.statusIndicator}>
                  {indicator}
                </Text>
              ))}
              
              {/* Last message time */}
              <Text style={styles.lastMessageTime}>
                {formatTime(conversation.lastActivity)}
              </Text>
            </View>
          </View>

          <View style={styles.conversationFooter}>
            <Text 
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.unreadMessage
              ]} 
              numberOfLines={2}
            >
              {getMessagePreview()}
            </Text>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Conversation context info */}
      {conversation.contextType && (
        <View style={styles.contextBar}>
          <Text style={styles.contextText}>
            {conversation.contextType === 'booking' && '📅 '}
            {conversation.contextType === 'quote' && '💼 '}
            {conversation.contextType === 'service' && '🔧 '}
            {conversation.contextMeta?.title || conversation.contextType}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const ConversationList = ({
  conversations = [],
  currentUserId,
  unreadCounts = {},
  loading = false,
  refreshing = false,
  hasMore = false,
  searchQuery = '',
  onConversationPress,
  onConversationLongPress,
  onSearchChange,
  onRefresh,
  onLoadMore,
  onCreateNewChat,
  style
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    if (!localSearchQuery) return true;
    
    const query = localSearchQuery.toLowerCase();
    const otherParticipant = conversation.participants?.find(
      p => p.userId !== currentUserId
    );
    
    // Search in participant names
    if (otherParticipant?.name?.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search in conversation title
    if (conversation.title?.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search in last message
    if (conversation.lastMessage?.content?.toLowerCase().includes(query)) {
      return true;
    }
    
    return false;
  });

  // Handle search input change
  const handleSearchChange = (text) => {
    setLocalSearchQuery(text);
    onSearchChange && onSearchChange(text);
  };

  // Render conversation item
  const renderConversation = ({ item }) => (
    <ConversationItem
      conversation={item}
      currentUserId={currentUserId}
      unreadCount={unreadCounts[item.id] || 0}
      onPress={onConversationPress}
      onLongPress={onConversationLongPress}
    />
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateTitle}>No Conversations</Text>
      <Text style={styles.emptyStateMessage}>
        {localSearchQuery 
          ? 'No conversations match your search'
          : 'Start a conversation by booking a service or requesting a quote'
        }
      </Text>
      {!localSearchQuery && onCreateNewChat && (
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={onCreateNewChat}
        >
          <Text style={styles.newChatButtonText}>Start New Chat</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render loading indicator
  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={COLORS.textMuted}
            value={localSearchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {localSearchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => handleSearchChange('')}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={
          filteredConversations.length === 0 ? styles.emptyContainer : styles.listContainer
        }
      />

      {/* Floating Action Button for New Chat */}
      {onCreateNewChat && filteredConversations.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={onCreateNewChat}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary + 'CC']}
            style={styles.fabGradient}
          >
            <Text style={styles.fabIcon}>✉️</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  listContainer: {
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationItem: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  unreadConversation: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  conversationContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  conversationDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  conversationTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  unreadTitle: {
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusIndicator: {
    fontSize: 12,
  },
  lastMessageTime: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lastMessage: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: FONTS.sm * 1.3,
  },
  unreadMessage: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.weightMedium,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  unreadCount: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  contextBar: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  contextText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weightMedium,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyStateMessage: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONTS.md * 1.5,
    marginBottom: SPACING.xl,
  },
  newChatButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  newChatButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  loadingText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...SHADOWS.heavy,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
  },
});

export default ConversationList;
