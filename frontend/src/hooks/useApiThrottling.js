// React hooks for API throttling and debouncing
import { useCallback, useRef, useEffect, useState } from 'react';
import throttler from '../utils/requestThrottler';

/**
 * Hook for debouncing API calls to prevent excessive requests
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling API calls with automatic cleanup
 */
export const useThrottledApi = () => {
  const activeRequests = useRef(new Set());

  const throttledRequest = useCallback(async (url, options = {}) => {
    const requestId = `${options.method || 'GET'}:${url}`;
    
    // Prevent duplicate requests
    if (activeRequests.current.has(requestId)) {
      console.log(`⚠️ Preventing duplicate request: ${requestId}`);
      return null;
    }

    activeRequests.current.add(requestId);

    try {
      const result = await throttler.fetch(url, options);
      return result;
    } finally {
      activeRequests.current.delete(requestId);
    }
  }, []);

  // Cleanup active requests on unmount
  useEffect(() => {
    return () => {
      activeRequests.current.clear();
    };
  }, []);

  return throttledRequest;
};

/**
 * Hook for preventing API calls during component mounting phase
 */
export const useMountSafeApi = (apiCall, dependencies = []) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const isMounted = useRef(false);
  const lastCallTime = useRef(0);
  const throttledRequest = useThrottledApi();

  const executeApiCall = useCallback(async (...args) => {
    const now = Date.now();
    
    // Prevent calls too close together (minimum 300ms apart)
    if (now - lastCallTime.current < 300) {
      console.log('⚠️ API call throttled - too soon after last call');
      return;
    }
    
    lastCallTime.current = now;
    
    if (!isMounted.current) {
      console.log('⚠️ Component not mounted, skipping API call');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall(...args);
      
      if (isMounted.current) {
        setData(result);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [apiCall, ...dependencies]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    executeApiCall,
    isLoading,
    data,
    error,
    throttledRequest
  };
};

/**
 * Hook for debounced search with automatic throttling
 */
export const useDebouncedSearch = (searchFunction, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, delay);
  const throttledRequest = useThrottledApi();

  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  const performSearch = useCallback(async (term) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await searchFunction(term);
      setResults(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchFunction]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    throttledRequest
  };
};

/**
 * Hook for managing multiple API calls with proper sequencing
 */
export const useSequentialApiCalls = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const throttledRequest = useThrottledApi();

  const executeSequentialCalls = useCallback(async (apiCalls, delay = 200) => {
    setIsLoading(true);
    setResults([]);
    setErrors([]);

    const callResults = [];
    const callErrors = [];

    for (let i = 0; i < apiCalls.length; i++) {
      try {
        console.log(`🔄 Executing API call ${i + 1}/${apiCalls.length}`);
        
        const result = await apiCalls[i]();
        callResults.push({ index: i, success: true, data: result });
        
        // Add delay between calls (except for the last one)
        if (i < apiCalls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`❌ API call ${i + 1} failed:`, error);
        callErrors.push({ index: i, error: error.message });
      }
    }

    setResults(callResults);
    setErrors(callErrors);
    setIsLoading(false);

    return { results: callResults, errors: callErrors };
  }, []);

  return {
    executeSequentialCalls,
    isLoading,
    results,
    errors,
    throttledRequest
  };
};

/**
 * Hook for handling component focus-based API refreshing
 */
export const useFocusRefresh = (refreshFunction, enabled = true) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefreshTime = useRef(0);
  const minRefreshInterval = 30000; // 30 seconds minimum between refreshes

  const handleFocusRefresh = useCallback(async () => {
    if (!enabled) return;

    const now = Date.now();
    if (now - lastRefreshTime.current < minRefreshInterval) {
      console.log('⚠️ Refresh throttled - too soon after last refresh');
      return;
    }

    lastRefreshTime.current = now;
    setIsRefreshing(true);

    try {
      await refreshFunction();
    } catch (error) {
      console.error('❌ Focus refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFunction, enabled, minRefreshInterval]);

  return {
    handleFocusRefresh,
    isRefreshing
  };
};
