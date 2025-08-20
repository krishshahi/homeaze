// Example: How to use API throttling hooks in a React component
// This demonstrates best practices for preventing 429 errors

import React, { useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  useMountSafeApi, 
  useSequentialApiCalls, 
  useFocusRefresh,
  useDebouncedSearch 
} from '../hooks/useApiThrottling';
import { fetchCompleteDashboardData } from '../services/dashboardApi';
import ServicesAPI from '../services/servicesApi';

const ThrottledDashboardExample = () => {
  // Example 1: Mount-safe API calls with automatic throttling
  const {
    executeApiCall: loadDashboard,
    isLoading: isDashboardLoading,
    data: dashboardData,
    error: dashboardError
  } = useMountSafeApi(
    useCallback(async (token) => {
      return await fetchCompleteDashboardData(token);
    }, []),
    [] // dependencies
  );

  // Example 2: Sequential API calls instead of parallel Promise.all
  const {
    executeSequentialCalls,
    isLoading: isSequentialLoading,
    results: sequentialResults
  } = useSequentialApiCalls();

  // Example 3: Debounced search to prevent excessive API calls
  const {
    searchTerm,
    setSearchTerm,
    results: searchResults,
    isLoading: isSearchLoading
  } = useDebouncedSearch(
    useCallback(async (term) => {
      return await ServicesAPI.searchServices(term);
    }, []),
    500 // 500ms debounce delay
  );

  // Example 4: Focus-based refresh with throttling
  const { handleFocusRefresh, isRefreshing } = useFocusRefresh(
    useCallback(async () => {
      const token = await getAuthToken(); // Your token retrieval function
      await loadDashboard(token);
    }, [loadDashboard]),
    true // enabled
  );

  // Load dashboard data on mount (throttled)
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          await loadDashboard(token);
        }
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      }
    };

    initializeDashboard();
  }, []); // Empty dependency array - only runs once on mount

  // Handle focus refresh (with built-in throttling)
  useFocusEffect(
    useCallback(() => {
      handleFocusRefresh();
    }, [handleFocusRefresh])
  );

  // Example of sequential API calls instead of Promise.all
  const loadMultipleDataSources = useCallback(async () => {
    const token = await getAuthToken();
    
    // Instead of Promise.all which causes 429 errors:
    // const [services, categories, featured] = await Promise.all([...])
    
    // Use sequential calls with staggering:
    const apiCalls = [
      () => ServicesAPI.getAllServices(),
      () => ServicesAPI.getCategories(), 
      () => ServicesAPI.getFeaturedServices(5)
    ];
    
    await executeSequentialCalls(apiCalls, 300); // 300ms delay between calls
  }, [executeSequentialCalls]);

  // Dummy auth token function (replace with your actual implementation)
  const getAuthToken = async () => {
    // Your token retrieval logic here
    return 'your-auth-token';
  };

  if (isDashboardLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  if (dashboardError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error loading dashboard</Text>
        <Text>{dashboardError.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleFocusRefresh}
        />
      }
    >
      {/* Dashboard content */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Dashboard (Throttled)
        </Text>
        
        {dashboardData && (
          <View>
            <Text>Total Users: {dashboardData.stats?.totalUsers}</Text>
            <Text>Total Bookings: {dashboardData.stats?.totalBookings}</Text>
            {/* More dashboard content */}
          </View>
        )}

        {/* Search example */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Debounced Search
          </Text>
          {/* Your search input component here */}
          {/* 
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search services..."
          />
          */}
          
          {isSearchLoading && <Text>Searching...</Text>}
          
          {searchResults && searchResults.length > 0 && (
            <View>
              {searchResults.map((result, index) => (
                <Text key={index}>{result.title}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ThrottledDashboardExample;

/* 
USAGE GUIDELINES:

1. ALWAYS use the throttling hooks instead of direct fetch calls
2. Replace Promise.all with sequential API calls for multiple requests
3. Use debounced search for user input
4. Implement proper mount safety for useEffect
5. Add focus refresh with built-in throttling
6. Cache responses automatically (handled by requestThrottler)

BEFORE (causes 429 errors):
useEffect(() => {
  const loadData = async () => {
    const [data1, data2, data3] = await Promise.all([
      api.getData1(),
      api.getData2(), 
      api.getData3()
    ]);
  };
  loadData();
}, []);

AFTER (prevents 429 errors):
const { executeApiCall } = useMountSafeApi(
  useCallback(async () => {
    // Data loaded sequentially with throttling
    return await fetchCompleteDashboardData(token);
  }, [])
);

useEffect(() => {
  executeApiCall();
}, [executeApiCall]);
*/
