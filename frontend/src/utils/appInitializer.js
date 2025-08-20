import { store } from '../store';
import { loadStoredAuth } from '../store/slices/authSlice';
import { fetchUserBookings } from '../store/slices/bookingSlice';
import { fetchServices, fetchCategories } from '../store/slices/servicesSlice';
import { fetchProfile } from '../store/slices/userSlice';
import { addNotification } from '../store/slices/appSlice';

/**
 * Initialize app data and state
 * This function handles the loading of essential app data
 */
export const initializeAppData = async () => {
  try {
    console.log('🚀 Initializing HomeAze app data...');

    // Load stored authentication first
    await store.dispatch(loadStoredAuth());

    // Load global data that doesn't require authentication
    const globalDataPromises = [
      store.dispatch(fetchServices()).catch(err => {
        console.warn('⚠️ Services load failed:', err);
        return null;
      }),
      store.dispatch(fetchCategories()).catch(err => {
        console.warn('⚠️ Categories load failed:', err);
        return null;
      })
    ];

    await Promise.all(globalDataPromises);

    // Add welcome notification
    store.dispatch(addNotification({
      title: 'Welcome to HomeAze',
      message: 'Find and book home services with ease',
      type: 'info'
    }));

    console.log('✅ Global app data initialization complete');
    
    return true;
  } catch (error) {
    console.error('❌ App data initialization error:', error);
    return false;
  }
};

/**
 * Initialize user-specific data after authentication
 * This function should be called when user is authenticated
 */
export const initializeUserData = async () => {
  try {
    const state = store.getState();
    
    // Only initialize if user is authenticated
    if (!state.auth.isAuthenticated || !state.auth.token) {
      console.log('⏭️ Skipping user data init - not authenticated');
      return false;
    }

    console.log('👤 Initializing user-specific data...');

    // Load user-specific data in parallel
    const userDataPromises = [
      store.dispatch(fetchProfile()).catch(err => {
        console.warn('⚠️ Profile load failed:', err);
        return null;
      }),
      store.dispatch(fetchUserBookings()).catch(err => {
        console.warn('⚠️ Bookings load failed:', err);
        return null;
      })
    ];

    await Promise.all(userDataPromises);

    // Welcome back notification for authenticated users
    store.dispatch(addNotification({
      title: 'Welcome back!',
      message: 'Your data has been synchronized',
      type: 'success'
    }));

    console.log('✅ User data initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ User data initialization error:', error);
    return false;
  }
};

/**
 * Initialize provider-specific data
 * This function should be called for provider users
 */
export const initializeProviderData = async () => {
  try {
    const state = store.getState();
    
    // Only initialize if user is authenticated as provider
    if (!state.auth.isAuthenticated || state.auth.user?.userType !== 'provider') {
      console.log('⏭️ Skipping provider data init - not provider');
      return false;
    }

    console.log('🏪 Initializing provider-specific data...');

    // TODO: Add provider-specific data fetching here
    // Examples:
    // - Provider services
    // - Provider earnings
    // - Provider availability
    // - Provider bookings

    console.log('✅ Provider data initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ Provider data initialization error:', error);
    return false;
  }
};

/**
 * Complete app initialization sequence
 * This orchestrates the full app initialization process
 */
export const initializeApp = async () => {
  try {
    console.log('🎬 Starting complete app initialization...');
    
    // Step 1: Initialize global app data
    await initializeAppData();
    
    // Step 2: Initialize user-specific data if authenticated
    await initializeUserData();
    
    // Step 3: Initialize provider data if user is provider
    await initializeProviderData();
    
    console.log('🎉 Complete app initialization finished');
    return true;
    
  } catch (error) {
    console.error('💥 Complete app initialization failed:', error);
    return false;
  }
};

export default {
  initializeApp,
  initializeAppData,
  initializeUserData,
  initializeProviderData
};
