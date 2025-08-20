import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';

import EnhancedTabBar from '../components/EnhancedTabBar';
// Import Provider Screens
import CreateServiceScreen from '../screens/CreateServiceScreen';
import EditServiceScreen from '../screens/EditServiceScreen';
import EnhancedProviderServiceCreateScreen from '../screens/EnhancedProviderServiceCreateScreen';
import EnhancedProviderServicesScreen from '../screens/EnhancedProviderServicesScreen';
import ProviderAvailabilityScreen from '../screens/ProviderAvailabilityScreen';
import ProviderBookingDetailsScreen from '../screens/ProviderBookingDetailsScreen';
import ProviderBookingsScreen from '../screens/ProviderBookingsScreen';
import ProviderDashboardScreen from '../screens/ProviderDashboardScreen';
import ProviderEarningsScreen from '../screens/ProviderEarningsScreen';
import ProviderNotificationsScreen from '../screens/ProviderNotificationsScreen';
import ProviderProfileScreen from '../screens/ProviderProfileScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import ServiceAnalyticsScreen from '../screens/ServiceAnalyticsScreen';
import ServiceRequestManagementScreen from '../screens/ServiceRequestManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Extract tabBar component to avoid nested definition in render
const ProviderTabBar = (props) => <EnhancedTabBar {...props} />;

// Provider Dashboard Stack
const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderDashboardMain" component={ProviderDashboardScreen} />
      <Stack.Screen name="ProviderEarnings" component={ProviderEarningsScreen} />
      <Stack.Screen name="ProviderAvailability" component={ProviderAvailabilityScreen} />
      <Stack.Screen name="ProviderNotifications" component={ProviderNotificationsScreen} />
      <Stack.Screen name="ProviderBookingDetails" component={ProviderBookingDetailsScreen} />
    </Stack.Navigator>
  );
};

// Provider Bookings Stack
const BookingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderBookingsMain" component={ProviderBookingsScreen} />
      <Stack.Screen name="ServiceRequestManagement" component={ServiceRequestManagementScreen} />
      <Stack.Screen name="ProviderBookingDetails" component={ProviderBookingDetailsScreen} />
    </Stack.Navigator>
  );
};

// Provider Services Stack
const ServicesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderServicesMain" component={EnhancedProviderServicesScreen} />
      <Stack.Screen name="CreateService" component={EnhancedProviderServiceCreateScreen} />
      <Stack.Screen name="EditService" component={EditServiceScreen} />
      <Stack.Screen name="CreateServiceBasic" component={CreateServiceScreen} />
      <Stack.Screen name="ServiceAnalytics" component={ServiceAnalyticsScreen} />
    </Stack.Navigator>
  );
};

// Provider Profile Stack
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderProfileMain" component={ProviderProfileScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="ProviderEarnings" component={ProviderEarningsScreen} />
      <Stack.Screen name="ProviderAvailability" component={ProviderAvailabilityScreen} />
    </Stack.Navigator>
  );
};


import BookingsAPI from '../services/bookingsApi';

const ProviderNavigator = () => {
  // Derive badge counts from store
  const bookings = useSelector(state => state.booking?.bookings || []);
  const notifications = useSelector(state => state.app?.notifications || []);

  const pendingBookingsCount = useMemo(() => {
    try {
      return bookings.filter(b => b && b.status === 'pending').length;
    } catch {
      return 0;
    }
  }, [bookings]);

  const unreadNotificationsCount = useMemo(() => {
    try {
      return notifications.filter(n => n && n.read === false).length;
    } catch {
      return 0;
    }
  }, [notifications]);

  useEffect(() => {
    // Initialize provider WebSocket for real-time booking updates/notifications
    BookingsAPI.initializeWebSocket(
      (payload) => {
        try {
          const info = payload?.booking || payload;
          const id = info?.id || info?._id || 'New Booking';
          const status = info?.status ? `Status: ${info.status}` : '';
          Alert.alert('Booking Update', `${id}${status ? `\n${status}` : ''}`);
        } catch (e) {
          // Fallback log if payload is unexpected
           
          console.log('📦 Booking update:', payload);
        }
      },
      (notification) => {
        const message = notification?.message || 'You have a new notification';
        Alert.alert('Notification', message);
      }
    );
    return () => BookingsAPI.disconnectWebSocket();
  }, []);

  return (
    <Tab.Navigator
      tabBar={ProviderTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          // Show pending bookings on dashboard as a quick attention indicator
          tabBarBadgeCount: pendingBookingsCount,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsStack}
        options={{
          tabBarBadgeCount: pendingBookingsCount,
        }}
      />
      <Tab.Screen name="Services" component={ServicesStack} />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarBadgeCount: unreadNotificationsCount,
        }}
      />
    </Tab.Navigator>
  );
};

export default ProviderNavigator;
