import React from 'react';
import NotificationsScreen from './NotificationsScreen';

// Provider notifications screen extends the main notifications screen
// with provider-specific notification types and settings
const ProviderNotificationsScreen = (props) => {
  return <NotificationsScreen {...props} userType="provider" />;
};

export default ProviderNotificationsScreen;
