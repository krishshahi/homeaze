// MessageBubble Component - Individual Message Display
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');
const maxBubbleWidth = screenWidth * 0.75;

const MessageBubble = ({
  message,
  isOwnMessage = false,
  showAvatar = false,
  showTimestamp = false,
  onReaction,
  onPress,
  style
}) => {
  const [showReactions, setShowReactions] = useState(false);

  // Format timestamp
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get message status icon
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;
    
    const status = message.deliveryStatus;
    if (status?.read) {
      return '✓✓'; // Double check - read
    } else if (status?.delivered) {
      return '✓✓'; // Double check - delivered
    } else if (status?.sent) {
      return '✓'; // Single check - sent
    } else {
      return '○'; // Pending
    }
  };

  // Handle long press for reactions
  const handleLongPress = () => {
    if (onReaction) {
      Alert.alert(
        'Add Reaction',
        'Choose a reaction for this message',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: '👍', onPress: () => onReaction(message.id, '👍') },
          { text: '❤️', onPress: () => onReaction(message.id, '❤️') },
          { text: '😂', onPress: () => onReaction(message.id, '😂') },
          { text: '😮', onPress: () => onReaction(message.id, '😮') },
          { text: '😢', onPress: () => onReaction(message.id, '😢') },
          { text: '😡', onPress: () => onReaction(message.id, '😡') },
        ]
      );
    }
  };

  // Render message content based on type
  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'text':
        return (
          <Text style={[
            styles.messageText,
            { color: isOwnMessage ? COLORS.white : COLORS.textPrimary }
          ]}>
            {message.content}
          </Text>
        );

      case 'image':
        return (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: message.media?.url || message.media?.uri }}
              style={styles.messageImage}
              resizeMode="cover"
            />
            {message.content && (
              <Text style={[
                styles.imageCaption,
                { color: isOwnMessage ? COLORS.white : COLORS.textPrimary }
              ]}>
                {message.content}
              </Text>
            )}
          </View>
        );

      case 'file':
        return (
          <View style={styles.fileContainer}>
            <View style={styles.fileIcon}>
              <Text style={styles.fileIconText}>📎</Text>
            </View>
            <View style={styles.fileInfo}>
              <Text style={[
                styles.fileName,
                { color: isOwnMessage ? COLORS.white : COLORS.textPrimary }
              ]}>
                {message.media?.fileName || 'File'}
              </Text>
              <Text style={[
                styles.fileSize,
                { color: isOwnMessage ? COLORS.white + '80' : COLORS.textSecondary }
              ]}>
                {message.media?.fileSize ? `${(message.media.fileSize / 1024 / 1024).toFixed(1)} MB` : ''}
              </Text>
            </View>
          </View>
        );

      case 'quote':
        return (
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteLabel}>💼 Quote</Text>
            <Text style={[
              styles.quoteTitle,
              { color: isOwnMessage ? COLORS.white : COLORS.textPrimary }
            ]}>
              {message.quoteMeta?.title || 'Service Quote'}
            </Text>
            <Text style={[
              styles.quoteAmount,
              { color: isOwnMessage ? COLORS.white : COLORS.primary }
            ]}>
              ${message.quoteMeta?.amount || '0.00'}
            </Text>
            {message.content && (
              <Text style={[
                styles.messageText,
                { color: isOwnMessage ? COLORS.white : COLORS.textPrimary }
              ]}>
                {message.content}
              </Text>
            )}
          </View>
        );

      case 'booking':
        return (
          <View style={styles.bookingContainer}>
            <Text style={styles.bookingLabel}>📅 Booking</Text>
            <Text style={[
              styles.bookingTitle,
              { color: isOwnMessage ? COLORS.white : COLORS.textPrimary }
            ]}>
              {message.bookingMeta?.title || 'Service Booking'}
            </Text>
            <Text style={[
              styles.bookingDate,
              { color: isOwnMessage ? COLORS.white + '80' : COLORS.textSecondary }
            ]}>
              {message.bookingMeta?.date ? new Date(message.bookingMeta.date).toLocaleDateString() : ''}
            </Text>
            {message.content && (
              <Text style={[
                styles.messageText,
                { color: isOwnMessage ? COLORS.white : COLORS.textPrimary }
              ]}>
                {message.content}
              </Text>
            )}
          </View>
        );

      case 'system':
        return (
          <Text style={styles.systemMessageText}>
            {message.content}
          </Text>
        );

      default:
        return (
          <Text style={[
            styles.messageText,
            { color: isOwnMessage ? COLORS.white : COLORS.textPrimary }
          ]}>
            {message.content}
          </Text>
        );
    }
  };

  // Render message reactions
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionCounts = {};
    message.reactions.forEach(reaction => {
      reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1;
    });

    return (
      <View style={styles.reactionsContainer}>
        {Object.entries(reactionCounts).map(([emoji, count]) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reactionBadge}
            onPress={() => onReaction && onReaction(message.id, emoji)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            <Text style={styles.reactionCount}>{count}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // System messages have special styling
  if (message.messageType === 'system') {
    return (
      <View style={[styles.systemMessageContainer, style]}>
        {renderMessageContent()}
        {showTimestamp && (
          <Text style={styles.systemTimestamp}>
            {formatTime(message.createdAt)}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Timestamp */}
      {showTimestamp && (
        <Text style={styles.timestamp}>
          {formatTime(message.createdAt)}
        </Text>
      )}

      <View style={[
        styles.messageContainer,
        { alignSelf: isOwnMessage ? 'flex-end' : 'flex-start' }
      ]}>
        {/* Avatar for received messages */}
        {showAvatar && !isOwnMessage && (
          <View style={styles.avatarContainer}>
            {message.sender.avatar ? (
              <Image
                source={{ uri: message.sender.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {message.sender.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Message bubble */}
        <TouchableWithoutFeedback
          onPress={() => onPress && onPress(message)}
          onLongPress={handleLongPress}
        >
          <View style={styles.bubbleContainer}>
            {isOwnMessage ? (
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary + 'DD']}
                style={[
                  styles.bubble,
                  styles.ownBubble,
                  { maxWidth: maxBubbleWidth }
                ]}
              >
                {renderMessageContent()}
              </LinearGradient>
            ) : (
              <View style={[
                styles.bubble,
                styles.receivedBubble,
                { maxWidth: maxBubbleWidth }
              ]}>
                {renderMessageContent()}
              </View>
            )}

            {/* Message status and time */}
            <View style={[
              styles.messageInfo,
              { alignSelf: isOwnMessage ? 'flex-end' : 'flex-start' }
            ]}>
              <Text style={styles.messageTime}>
                {formatTime(message.createdAt)}
              </Text>
              {isOwnMessage && (
                <Text style={[
                  styles.messageStatus,
                  { color: message.deliveryStatus?.read ? COLORS.primary : COLORS.textMuted }
                ]}>
                  {getStatusIcon()}
                </Text>
              )}
            </View>

            {/* Reactions */}
            {renderReactions()}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  timestamp: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '100%',
  },
  avatarContainer: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  bubbleContainer: {
    flexShrink: 1,
  },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xs,
  },
  ownBubble: {
    borderBottomRightRadius: SPACING.xs,
  },
  receivedBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: SPACING.xs,
    ...SHADOWS.light,
  },
  messageText: {
    fontSize: FONTS.md,
    lineHeight: FONTS.md * 1.4,
  },
  imageContainer: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.md,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: BORDER_RADIUS.md,
  },
  imageCaption: {
    fontSize: FONTS.sm,
    marginTop: SPACING.sm,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  fileIconText: {
    fontSize: 20,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    marginBottom: SPACING.xs,
  },
  fileSize: {
    fontSize: FONTS.sm,
  },
  quoteContainer: {
    padding: SPACING.sm,
  },
  quoteLabel: {
    fontSize: FONTS.xs,
    marginBottom: SPACING.xs,
  },
  quoteTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    marginBottom: SPACING.xs,
  },
  quoteAmount: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    marginBottom: SPACING.sm,
  },
  bookingContainer: {
    padding: SPACING.sm,
  },
  bookingLabel: {
    fontSize: FONTS.xs,
    marginBottom: SPACING.xs,
  },
  bookingTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    marginBottom: SPACING.xs,
  },
  bookingDate: {
    fontSize: FONTS.sm,
    marginBottom: SPACING.sm,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  systemMessageText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  systemTimestamp: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  messageTime: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  messageStatus: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightMedium,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    ...SHADOWS.light,
  },
  reactionEmoji: {
    fontSize: 12,
    marginRight: 2,
  },
  reactionCount: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weightMedium,
  },
});

export default MessageBubble;
