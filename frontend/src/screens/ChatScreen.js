import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppDispatch, useAuth } from '../store/hooks';

const ChatScreen = ({ route, navigation }) => {
  const { chatId, recipientName, recipientId, bookingId } = route.params;
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const flatListRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    loadChatMessages();
    
    // Simulate real-time message updates
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.9) { // 10% chance of receiving a message
        simulateIncomingMessage();
      }
    }, 5000);

    return () => clearInterval(messageInterval);
  }, []);

  const loadChatMessages = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setMessages(mockMessages);
        setLoading(false);
        scrollToBottom();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
      setMessages(mockMessages);
      setLoading(false);
    }
  };

  const simulateIncomingMessage = () => {
    const randomMessages = [
      "I'll be there at the scheduled time!",
      "Just confirming the appointment for tomorrow",
      "Thank you for choosing our service",
      "Is there anything specific I should know?",
      "The job has been completed successfully"
    ];
    
    const newMessage = {
      id: Date.now().toString(),
      text: randomMessages[Math.floor(Math.random() * randomMessages.length)],
      senderId: recipientId,
      senderName: recipientName,
      timestamp: new Date().toISOString(),
      isMe: false,
      type: 'text',
    };

    setMessages(prev => [...prev, newMessage]);
    scrollToBottom();
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: messageText.trim(),
      senderId: user.id,
      senderName: user.name,
      timestamp: new Date().toISOString(),
      isMe: true,
      type: 'text',
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    setSending(true);
    scrollToBottom();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item, index }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDate = !prevMessage || 
      formatDate(item.timestamp) !== formatDate(prevMessage.timestamp);
    const showSender = !prevMessage || 
      prevMessage.senderId !== item.senderId;

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          item.isMe ? styles.myMessageContainer : styles.theirMessageContainer
        ]}>
          {!item.isMe && showSender && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          
          <View style={[
            styles.messageBubble,
            item.isMe ? styles.myMessageBubble : styles.theirMessageBubble
          ]}>
            <Text style={[
              styles.messageText,
              item.isMe ? styles.myMessageText : styles.theirMessageText
            ]}>
              {item.text}
            </Text>
            
            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                item.isMe ? styles.myMessageTime : styles.theirMessageTime
              ]}>
                {formatTime(item.timestamp)}
              </Text>
              
              {item.isMe && (
                <Text style={styles.messageStatus}>
                  {item.status === 'sending' && '⏳'}
                  {item.status === 'sent' && '✓'}
                  {item.status === 'delivered' && '✓✓'}
                  {item.status === 'failed' && '❌'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderChatHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{recipientName}</Text>
        {bookingId && (
          <Text style={styles.headerSubtitle}>Booking #{bookingId}</Text>
        )}
        {isTyping && (
          <Text style={styles.typingIndicator}>typing...</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.callButton}>
        <Text style={styles.callButtonText}>📞</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMessageInput = () => (
    <View style={styles.inputContainer}>
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.attachButton}>
          <Text style={styles.attachButtonText}>📎</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.messageInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={1000}
          onFocus={() => scrollToBottom()}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? '⏳' : '🚀'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {renderChatHeader()}
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
          />
        )}
        
        {renderMessageInput()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Mock messages data
const mockMessages = [
  {
    id: '1',
    text: 'Hi! I see you booked a house cleaning service. When would be the best time for me to come?',
    senderId: 'provider123',
    senderName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isMe: false,
    type: 'text',
    status: 'delivered',
  },
  {
    id: '2',
    text: 'Hello! Tomorrow at 10 AM would work great for me. Is that okay?',
    senderId: 'customer456',
    senderName: 'You',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    isMe: true,
    type: 'text',
    status: 'delivered',
  },
  {
    id: '3',
    text: 'Perfect! I\'ll be there at 10 AM sharp. Do you have any specific areas you\'d like me to focus on?',
    senderId: 'provider123',
    senderName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isMe: false,
    type: 'text',
    status: 'delivered',
  },
  {
    id: '4',
    text: 'Please focus on the kitchen and bathrooms. Also, I have a cat, so please use pet-safe products if possible.',
    senderId: 'customer456',
    senderName: 'You',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isMe: true,
    type: 'text',
    status: 'delivered',
  },
  {
    id: '5',
    text: 'Absolutely! I always carry eco-friendly and pet-safe cleaning products. See you tomorrow! 😊',
    senderId: 'provider123',
    senderName: 'Sarah Johnson',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isMe: false,
    type: 'text',
    status: 'delivered',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  typingIndicator: {
    fontSize: FONTS.xs,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  callButton: {
    padding: SPACING.sm,
  },
  callButtonText: {
    fontSize: FONTS.lg,
  },

  // Chat Container
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },

  // Messages
  messagesList: {
    padding: SPACING.md,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dateSeparatorText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  messageContainer: {
    marginBottom: SPACING.md,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  myMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  theirMessageBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
    ...SHADOWS.light,
  },
  messageText: {
    fontSize: FONTS.md,
    lineHeight: 20,
  },
  myMessageText: {
    color: COLORS.white,
  },
  theirMessageText: {
    color: COLORS.textPrimary,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  messageTime: {
    fontSize: FONTS.xs,
  },
  myMessageTime: {
    color: COLORS.white + 'CC',
  },
  theirMessageTime: {
    color: COLORS.textMuted,
  },
  messageStatus: {
    fontSize: FONTS.xs,
    marginLeft: SPACING.xs,
  },

  // Input
  inputContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  attachButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.round,
  },
  attachButtonText: {
    fontSize: FONTS.md,
  },
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sendButtonInactive: {
    backgroundColor: COLORS.textMuted,
  },
  sendButtonText: {
    fontSize: FONTS.md,
  },
});

export default ChatScreen;
