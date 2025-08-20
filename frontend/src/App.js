import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';


// Context Providers

// Components
import AppInitializer from './components/AppInitializer';
import { AuthProvider } from './contexts/AuthContext';
import RootNavigator from './navigation/RootNavigator';
import { store } from './store';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppInitializer>
            <NavigationContainer>
              <StatusBar style="auto" />
              <RootNavigator />
            </NavigationContainer>
            <Toast />
          </AppInitializer>
        </GestureHandlerRootView>
      </AuthProvider>
    </Provider>
  );
}
