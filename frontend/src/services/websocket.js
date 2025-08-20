import { EventEmitter } from 'events';

import AsyncStorage from '@react-native-async-storage/async-storage';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3000/ws';

const MESSAGE_TYPES = {
  NOTIFICATION: 'notification',
  BOOKING_UPDATE: 'booking_update',
  SERVICE_UPDATE: 'service_update',
  CHAT_MESSAGE: 'chat_message',
  PAYMENT_UPDATE: 'payment_update',
  EARNINGS_UPDATE: 'earnings_update',
  AVAILABILITY_UPDATE: 'availability_update',
  REVIEW_UPDATE: 'review_update',
  DOCUMENT_UPDATE: 'document_update',
};

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 1000; // Start with 1s timeout
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.ws = new WebSocket(`${WS_URL}?token=${token}`);

      this.ws.onopen = () => {
        this.startPingInterval();
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 1000;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnect_failed');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectTimeout *= 2; // Exponential backoff
      this.connect();
    }, this.reconnectTimeout);
  }

  handleMessage(data) {
    // Handle pong response
    if (data.type === 'pong') {
      return;
    }

    switch (data.type) {
      case MESSAGE_TYPES.NOTIFICATION:
        this.emit('notification', data.payload);
        break;
      case MESSAGE_TYPES.BOOKING_UPDATE:
        this.emit('booking_update', data.payload);
        break;
      case MESSAGE_TYPES.SERVICE_UPDATE:
        this.emit('service_update', data.payload);
        break;
      case MESSAGE_TYPES.CHAT_MESSAGE:
        this.emit('chat_message', data.payload);
        break;
      case MESSAGE_TYPES.PAYMENT_UPDATE:
        this.emit('payment_update', data.payload);
        break;
      case MESSAGE_TYPES.EARNINGS_UPDATE:
        this.emit('earnings_update', data.payload);
        break;
      case MESSAGE_TYPES.AVAILABILITY_UPDATE:
        this.emit('availability_update', data.payload);
        break;
      case MESSAGE_TYPES.REVIEW_UPDATE:
        this.emit('review_update', data.payload);
        break;
      case MESSAGE_TYPES.DOCUMENT_UPDATE:
        this.emit('document_update', data.payload);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  sendMessage(type, payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message = JSON.stringify({
      type,
      payload,
    });

    this.ws.send(message);
  }

  disconnect() {
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
