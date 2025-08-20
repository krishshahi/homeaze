import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';

import { COLORS } from '../constants/theme';

// Import screens
import BookingScreen from '../screens/customer/BookingScreen';
import BookingsScreen from '../screens/customer/BookingsScreen';
import ChatScreen from '../screens/ChatScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import NotificationsScreen from '../screens/customer/NotificationsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import EnhancedServicesScreen from '../screens/EnhancedServicesScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';
import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';
import BookingFormScreen from '../screens/BookingFormScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Extract tab icons to top-level components to avoid nested definitions in render
const HomeIcon = ({ color, size }) => <Icon name="home" size={size} color={color} />;
const ServicesIcon = ({ color, size }) => <Icon name="grid" size={size} color={color} />;
const BookingsIcon = ({ color, size }) => <Icon name="calendar" size={size} color={color} />;
const ProfileIcon = ({ color, size }) => <Icon name="user" size={size} color={color} />;

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

const ServicesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ServicesMain" component={EnhancedServicesScreen} />
    <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
    <Stack.Screen name="BookingForm" component={BookingFormScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

const BookingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BookingsMain" component={BookingsScreen} />
    <Stack.Screen name="BookingDetails" component={BookingScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const CustomerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesStack}
        options={{
          tabBarIcon: ServicesIcon,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsStack}
        options={{
          tabBarIcon: BookingsIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default CustomerNavigator;
