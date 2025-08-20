// ChatInterface Component - Real-time Messaging Interface
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

import MessageBubble from './MessageBubble';

const ChatInterface = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onSendMedia,
  onLoadMoreMessages,
  onUpdateTyping,
  onMessageReaction,
  typingUsers = [],
  loading = false,
  hasMoreMessages = false,
  style
}) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Handle typing indicator
  useEffect(() => {
    if (messageText.length > 0 && !isTyping) {
      setIsTyping(true);
      onUpdateTyping && onUpdateTyping(true);
    } else if (messageText.length === 0 && isTyping) {
      setIsTyping(false);
      onUpdateTyping && onUpdateTyping(false);
    }

    // Clear typing indicator after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onUpdateTyping && onUpdateTyping(false);
      }
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, isTyping, onUpdateTyping]);

  // Clean up typing indicator on unmount
  useEffect(() => {
    return () => {
      if (isTyping) {
        onUpdateTyping && onUpdateTyping(false);
      }
    };
  }, []);

  // Send text message
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const messageData = {
      content: messageText.trim(),
      messageType: 'text',
      tempId: Date.now().toString() // For optimistic updates
    };

    // Clear input immediately for better UX
    setMessageText('');

    try {
      await onSendMessage(messageData);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Restore message text on error
      setMessageText(messageData.content);
    }
  };

  // Handle media selection
  const handleMediaPress = () => {
    Alert.alert(
      'Select Media',
      'Choose how you want to add media',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImagePicker() }
      ]
    );
  };

  // Open camera
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleMediaUpload(result.assets[0]);
    }
  };

  // Open image picker
  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Photo library permission is required to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleMediaUpload(result.assets[0]);
    }
  };

  // Handle media upload
  const handleMediaUpload = async (media) => {
    setUploadingMedia(true);
    
    try {
      const messageData = {
        content: '', // No text content for media messages
        messageType: 'image',
        tempId: Date.now().toString()
      };

      await onSendMedia(media, messageData);
    } catch (error) {
      console.error('Failed to upload media:', error);
      Alert.alert('Error', 'Failed to upload media. Please try again.');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Load more messages when scrolling to top
  const handleLoadMore = () => {
    if (hasMoreMessages && !loading) {
      onLoadMoreMessages && onLoadMoreMessages();
    }
  };

  // Render message item
  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.sender.id === currentUserId;
    const nextMessage = messages[index + 1];
    const isLastInGroup = !nextMessage || nextMessage.sender.id !== item.sender.id;
    const showTimestamp = index === 0 || 
      (new Date(item.createdAt).getTime() - new Date(messages[index + 1].createdAt).getTime()) > 300000; // 5 minutes

    return (
      <MessageBubble
        message={item}
        isOwnMessage={isOwnMessage}
        showAvatar={!isOwnMessage && isLastInGroup}
        showTimestamp={showTimestamp}
        onReaction={onMessageReaction}
        style={{ marginBottom: isLastInGroup ? SPACING.md : SPACING.xs }}
      />
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingText = typingUsers.length === 1 
      ? `${typingUsers[0].name} is typing...`
      : `${typingUsers.length} people are typing...`;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
        <Text style={styles.typingText}>{typingText}</Text>
      </View>
    );
  };

  // Render loading indicator for more messages
  const renderLoadingIndicator = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id || item.tempId}
        inverted // Show latest messages at bottom
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderLoadingIndicator}
        contentContainerStyle={styles.messagesList}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />

      {/* Typing Indicator */}
      {renderTypingIndicator()}

      {/* Input Container */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          {/* Media Button */}
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleMediaPress}
            disabled={uploadingMedia}
          >
            {uploadingMedia ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.mediaIcon}>📎</Text>
            )}
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            maxLength={1000}
            editable={!uploadingMedia}
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: messageText.trim() ? COLORS.primary : COLORS.textMuted }
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || uploadingMedia}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  messagesList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  loadingContainer: {
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
  typingContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingBubble: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
    ...SHADOWS.light,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 1,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  typingText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.lg : SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minHeight: 44,
  },
  mediaButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.light,
  },
  mediaIcon: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendIcon: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default ChatInterface;
