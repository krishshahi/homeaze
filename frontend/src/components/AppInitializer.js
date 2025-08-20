import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import SplashScreen from '../screens/SplashScreen';

const AppInitializer = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { loadStoredAuth } = useAuth();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load multiple initialization tasks in parallel
      const [onboardingStatus] = await Promise.all([
        AsyncStorage.getItem('hasCompletedOnboarding'),
        loadStoredAuth(), // This is already defined in AuthContext
      ]);

      setHasCompletedOnboarding(onboardingStatus === 'true');
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      // Add a slight delay to ensure smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  // Clone children with additional props
  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { hasCompletedOnboarding });
    }
    return child;
  });
};

export default AppInitializer;
