import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  isOnline: true,
  currentScreen: 'Welcome',
  notifications: [],
  showNotificationBadge: false,
  theme: 'light',
  location: {
    latitude: null,
    longitude: null,
    address: '',
    city: '',
  },
  appVersion: '1.0.0',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
    },
    setCurrentScreen(state, action) {
      state.currentScreen = action.payload;
    },
    addNotification(state, action) {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      state.showNotificationBadge = true;
    },
    markNotificationAsRead(state, action) {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
      // Check if all notifications are read
      state.showNotificationBadge = state.notifications.some(n => !n.read);
    },
    clearNotifications(state) {
      state.notifications = [];
      state.showNotificationBadge = false;
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    setLocation(state, action) {
      state.location = { ...state.location, ...action.payload };
    },
  },
});

export const {
  setLoading,
  setOnlineStatus,
  setCurrentScreen,
  addNotification,
  markNotificationAsRead,
  clearNotifications,
  setTheme,
  setLocation,
} = appSlice.actions;

export default appSlice.reducer;
