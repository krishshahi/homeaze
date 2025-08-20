import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// Import navigators
import { useAuth } from '../contexts/AuthContext';
import SplashScreen from '../screens/SplashScreen';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import ProviderNavigator from './ProviderNavigator';

// Import screens

// Import context

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Flow
          <>
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        ) : (
          // App Flow
          <>
            {user.userType === 'provider' ? (
              <Stack.Screen name="ProviderApp" component={ProviderNavigator} />
            ) : (
              <Stack.Screen name="CustomerApp" component={CustomerNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
