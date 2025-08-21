import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useSelector, useDispatch } from 'react-redux';


// Import screens
import MainNavigator from './src/navigation/MainNavigator';
import ProviderNavigator from './src/navigation/ProviderNavigator';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import SimpleLoginScreen from './src/screens/SimpleLoginScreen';
import EnhancedSignupScreen from './src/screens/EnhancedSignupScreen';
import UserTypeSelectorScreen from './src/screens/UserTypeSelectorScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import { store } from './src/store';
import { loadStoredAuth } from './src/store/slices/authSlice';

const Stack = createStackNavigator();

function AppNavigator() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const navigationRef = useRef();
  const prevIsAuthenticated = useRef(isAuthenticated);

  // Debug authentication state
  console.log('🔍 App Navigator - Auth State:', {
    isAuthenticated,
    loading,
    hasUser: !!user,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    console.log('🚀 App starting - loading stored auth...');
    // Load stored authentication data when app starts
    dispatch(loadStoredAuth());
  }, [dispatch]);

  // Handle navigation when auth state changes
  useEffect(() => {
    console.log('🗺️ Auth state change detected:', {
      prevAuth: prevIsAuthenticated.current,
      currentAuth: isAuthenticated,
      loading,
      hasNavigationRef: !!navigationRef.current,
      userType: user?.userType
    });
    
    // Only navigate if we're not loading and auth state actually changed
    if (!loading && prevIsAuthenticated.current !== isAuthenticated) {
      console.log('🚀 Auth state ACTUALLY changed - triggering navigation');
      
      if (navigationRef.current) {
        if (isAuthenticated && user) {
          // Route to appropriate navigator based on user type
          const targetRoute = user.userType === 'provider' ? 'ProviderNavigator' : 'Main';
          console.log(`✅ User authenticated as ${user.userType} - navigating to ${targetRoute}`);
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: targetRoute }],
            })
          );
        } else {
          console.log('🚪 User logged out - navigating to Welcome');
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            })
          );
        }
      } else {
        console.error('❌ NavigationRef is null!');
      }
    } else {
      console.log('⏭️ Skipping navigation - loading:', loading, 'stateChanged:', prevIsAuthenticated.current !== isAuthenticated);
    }
    
    prevIsAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, loading, user]);

  // Show loading screen while checking stored auth
  if (loading) {
    console.log('⏳ Showing loading screen...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Determine initial route based on authentication and user type
  const getInitialRouteName = () => {
    if (!isAuthenticated) return "Welcome";
    if (user?.userType === 'provider') return "ProviderNavigator";
    return "Main";
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Always include all screens, but control initial route */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={SimpleLoginScreen} />
        <Stack.Screen name="Signup" component={EnhancedSignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="UserTypeSelector" component={UserTypeSelectorScreen} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen name="ProviderNavigator" component={ProviderNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppNavigator />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}
