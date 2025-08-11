import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/theme';
import EnhancedTabBar from '../components/EnhancedTabBar';

// Import Provider Screens
import ProviderDashboardScreen from '../screens/ProviderDashboardScreen';
import ProviderBookingsScreen from '../screens/ProviderBookingsScreen';
import ProviderProfileScreen from '../screens/ProviderProfileScreen';
import ProviderBookingDetailsScreen from '../screens/ProviderBookingDetailsScreen';
import ProviderEarningsScreen from '../screens/ProviderEarningsScreen';
import ProviderAvailabilityScreen from '../screens/ProviderAvailabilityScreen';
import ProviderNotificationsScreen from '../screens/ProviderNotificationsScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import CreateServiceScreen from '../screens/CreateServiceScreen';
import EditServiceScreen from '../screens/EditServiceScreen';
import EnhancedProviderServiceCreateScreen from '../screens/EnhancedProviderServiceCreateScreen';
import EnhancedProviderServicesScreen from '../screens/EnhancedProviderServicesScreen';
import ServiceRequestManagementScreen from '../screens/ServiceRequestManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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


const ProviderNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <EnhancedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="Services" component={ServicesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default ProviderNavigator;
