import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

// Import Modern Components and Screens
import SimpleBottomTabNavigator from '../components/modern/SimpleBottomTabNavigator';
import FixedLayoutHomeScreen from '../screens/FixedLayoutHomeScreen';
import SimpleServicesScreen from '../screens/SimpleServicesScreen';
import SimpleBookingsScreen from '../screens/SimpleBookingsScreen';
import SimpleProfileScreen from '../screens/SimpleProfileScreen';
import ModernLoginScreen from '../screens/ModernLoginScreen';
import MicroInteractionsDemo from '../screens/MicroInteractionsDemo';

// Import existing screens that haven't been modernized yet
import AdvancedSearchScreen from '../screens/AdvancedSearchScreen';
import BookingConfirmationScreen from '../screens/BookingConfirmationScreen';
import BookingFormScreen from '../screens/BookingFormScreen';
import ChatScreen from '../screens/ChatScreen';
import CustomerDashboardScreen from '../screens/CustomerDashboardScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EnhancedReviewsScreen from '../screens/EnhancedReviewsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ProviderProfileScreen from '../screens/ProviderProfileScreen';
import ProvidersScreen from '../screens/ProvidersScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';

const Stack = createStackNavigator();

// Home Stack with Modern Home Screen
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={FixedLayoutHomeScreen} />
      <Stack.Screen name="CustomerDashboard" component={CustomerDashboardScreen} />
      <Stack.Screen name="MicroInteractionsDemo" component={MicroInteractionsDemo} />
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

// Services Stack with Modern Services Screen
const ServicesStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServicesMain" component={SimpleServicesScreen} />
      <Stack.Screen name="AdvancedSearch" component={AdvancedSearchScreen} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <Stack.Screen name="Providers" component={ProvidersScreen} />
      <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Reviews" component={EnhancedReviewsScreen} />
    </Stack.Navigator>
  );
};

// Bookings Stack with Modern Bookings Screen
const BookingsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookingsMain" component={SimpleBookingsScreen} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Reviews" component={EnhancedReviewsScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack with Modern Profile Screen
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={SimpleProfileScreen} />
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

  // Use the SimpleBottomTabNavigator to avoid conflicts
  return (
    <SimpleBottomTabNavigator
      screens={[
        {
          name: 'Home',
          component: HomeStack,
          icon: 'home',
          badgeCount: 0,
        },
        {
          name: 'Services',
          component: ServicesStack,
          icon: 'grid',
          badgeCount: 0,
        },
        {
          name: 'Bookings',
          component: BookingsStack,
          icon: 'calendar',
          badgeCount: upcomingOrPendingBookings,
        },
        {
          name: 'Profile',
          component: ProfileStack,
          icon: 'person',
          badgeCount: unreadNotificationsCount,
        },
      ]}
    />
  );
};

export default MainNavigator;
