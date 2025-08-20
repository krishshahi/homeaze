import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import EnhancedTabBar from '../components/EnhancedTabBar';
import { COLORS } from '../constants/theme';

// Import Enhanced Home Screen
import AdvancedSearchScreen from '../screens/AdvancedSearchScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import BookingFormScreen from '../screens/BookingFormScreen';
import ChatScreen from '../screens/ChatScreen';
import CustomerDashboardScreen from '../screens/CustomerDashboardScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EnhancedBookingsScreen from '../screens/EnhancedBookingsScreen';
import EnhancedHomeScreen from '../screens/EnhancedHomeScreen';

// Import Enhanced Screens
import EnhancedProfileScreen from '../screens/EnhancedProfileScreen';
import EnhancedReviewsScreen from '../screens/EnhancedReviewsScreen';
import EnhancedServicesScreen from '../screens/EnhancedServicesScreen';
import FeaturesDemoScreen from '../screens/FeaturesDemoScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ProviderProfileScreen from '../screens/ProviderProfileScreen';
import ProvidersScreen from '../screens/ProvidersScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Extract tabBar component to avoid nested definition in render
const MainTabBar = (props) => <EnhancedTabBar {...props} />;

// Home Stack
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={EnhancedHomeScreen} />
      <Stack.Screen name="CustomerDashboard" component={CustomerDashboardScreen} />
      <Stack.Screen name="FeaturesDemoScreen" component={FeaturesDemoScreen} />
      <Stack.Screen name="AdvancedSearch" component={AdvancedSearchScreen} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Reviews" component={EnhancedReviewsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    </Stack.Navigator>
  );
};

// Services Stack
const ServicesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServicesMain" component={EnhancedServicesScreen} />
      <Stack.Screen name="AdvancedSearch" component={AdvancedSearchScreen} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <Stack.Screen name="Providers" component={ProvidersScreen} />
      <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Reviews" component={EnhancedReviewsScreen} />
    </Stack.Navigator>
  );
};

// Bookings Stack
const BookingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookingsMain" component={EnhancedBookingsScreen} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Reviews" component={EnhancedReviewsScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={EnhancedProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Reviews" component={EnhancedReviewsScreen} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  // Derive badge counts from store for customer app
  const bookings = useSelector(state => state.booking?.bookings || []);
  const notifications = useSelector(state => state.app?.notifications || []);

  const upcomingOrPendingBookings = useMemo(() => {
    try {
      return bookings.filter(b => b && (b.status === 'pending' || b.status === 'confirmed' || b.status === 'in-progress')).length;
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

  return (
    <Tab.Navigator
      tabBar={MainTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Services" component={ServicesStack} />
      <Tab.Screen
        name="Bookings"
        component={BookingsStack}
        options={{
          tabBarBadgeCount: upcomingOrPendingBookings,
        }}
      />
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

export default MainNavigator;
