import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/theme';
import EnhancedTabBar from '../components/EnhancedTabBar';

// Import Enhanced Home Screen
import EnhancedHomeScreen from '../screens/EnhancedHomeScreen';

// Import Enhanced Screens
import EnhancedServicesScreen from '../screens/EnhancedServicesScreen';
import EnhancedBookingsScreen from '../screens/EnhancedBookingsScreen';
import EnhancedProfileScreen from '../screens/EnhancedProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';
import BookingFormScreen from '../screens/BookingFormScreen';
import ProviderProfileScreen from '../screens/ProviderProfileScreen';
import ProvidersScreen from '../screens/ProvidersScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import FeaturesDemoScreen from '../screens/FeaturesDemoScreen';
import AdvancedSearchScreen from '../screens/AdvancedSearchScreen';
import PaymentScreen from '../screens/PaymentScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CustomerDashboardScreen from '../screens/CustomerDashboardScreen';
import ChatScreen from '../screens/ChatScreen';
import EnhancedReviewsScreen from '../screens/EnhancedReviewsScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
  return (
    <Tab.Navigator
      tabBar={(props) => <EnhancedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Services" component={ServicesStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
