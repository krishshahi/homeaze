// Location API Service - Frontend Integration for Geographic Services
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, API_ENDPOINTS } from '../config/api';

// Get all locations
export const getLocations = async (params = {}, token) => {
  try {
    console.log('🌍 Fetching locations:', params);
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/locations?${queryString}` : '/locations';
    
    const response = await apiGet(endpoint, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Get locations error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Search locations by query
export const searchLocations = async (searchParams, token) => {
  try {
    console.log('🔍 Searching locations:', searchParams);
    const response = await apiPost('/locations/search', searchParams, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Search locations error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get location by ID
export const getLocationById = async (locationId, token) => {
  try {
    console.log('📍 Fetching location by ID:', locationId);
    const response = await apiGet(`/locations/${locationId}`, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get location by ID error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get locations within radius
export const getLocationsNearby = async (latitude, longitude, radius, params = {}, token) => {
  try {
    console.log('📍 Fetching nearby locations:', { latitude, longitude, radius, params });
    const searchParams = {
      latitude,
      longitude,
      radius,
      ...params
    };
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await apiGet(`/locations/nearby?${queryString}`, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Get nearby locations error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Geocode address to coordinates
export const geocodeAddress = async (address, token) => {
  try {
    console.log('🗺️ Geocoding address:', address);
    const response = await apiPost('/locations/geocode', { address }, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Geocode address error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Reverse geocode coordinates to address
export const reverseGeocode = async (latitude, longitude, token) => {
  try {
    console.log('🔄 Reverse geocoding coordinates:', { latitude, longitude });
    const response = await apiPost('/locations/reverse-geocode', { latitude, longitude }, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Reverse geocode error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get service areas by location
export const getServiceAreasByLocation = async (locationId, token) => {
  try {
    console.log('🎯 Fetching service areas by location:', locationId);
    const response = await apiGet(`/locations/${locationId}/service-areas`, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get service areas error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get providers by location
export const getProvidersByLocation = async (locationId, params = {}, token) => {
  try {
    console.log('👷 Fetching providers by location:', locationId, params);
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/locations/${locationId}/providers?${queryString}` 
      : `/locations/${locationId}/providers`;
    
    const response = await apiGet(endpoint, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Get providers by location error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get services by location
export const getServicesByLocation = async (locationId, params = {}, token) => {
  try {
    console.log('🔧 Fetching services by location:', locationId, params);
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/locations/${locationId}/services?${queryString}` 
      : `/locations/${locationId}/services`;
    
    const response = await apiGet(endpoint, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Get services by location error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get location demographics
export const getLocationDemographics = async (locationId, token) => {
  try {
    console.log('📊 Fetching location demographics:', locationId);
    const response = await apiGet(`/locations/${locationId}/demographics`, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get location demographics error:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
};

// Get location economics data
export const getLocationEconomics = async (locationId, token) => {
  try {
    console.log('💰 Fetching location economics:', locationId);
    const response = await apiGet(`/locations/${locationId}/economics`, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get location economics error:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
};

// Get location safety ratings
export const getLocationSafety = async (locationId, token) => {
  try {
    console.log('🛡️ Fetching location safety:', locationId);
    const response = await apiGet(`/locations/${locationId}/safety`, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get location safety error:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
};

// Get location analytics
export const getLocationAnalytics = async (locationId, params = {}, token) => {
  try {
    console.log('📈 Fetching location analytics:', locationId, params);
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/locations/${locationId}/analytics?${queryString}` 
      : `/locations/${locationId}/analytics`;
    
    const response = await apiGet(endpoint, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get location analytics error:', error);
    return {
      success: false,
      error: error.message,
      data: {}
    };
  }
};

// Get popular locations
export const getPopularLocations = async (params = {}, token) => {
  try {
    console.log('⭐ Fetching popular locations:', params);
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/locations/popular?${queryString}` : '/locations/popular';
    
    const response = await apiGet(endpoint, token);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
      total: response.total
    };
  } catch (error) {
    console.error('❌ Get popular locations error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get location hierarchy (states, cities, neighborhoods)
export const getLocationHierarchy = async (parentId = null, token) => {
  try {
    console.log('🌳 Fetching location hierarchy:', parentId);
    const endpoint = parentId ? `/locations/hierarchy?parent=${parentId}` : '/locations/hierarchy';
    const response = await apiGet(endpoint, token);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Get location hierarchy error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Create location (admin only)
export const createLocation = async (locationData, token) => {
  try {
    console.log('📍 Creating location:', locationData);
    const response = await apiPost('/locations', locationData, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Create location error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update location (admin only)
export const updateLocation = async (locationId, updateData, token) => {
  try {
    console.log('✏️ Updating location:', locationId, updateData);
    const response = await apiPut(`/locations/${locationId}`, updateData, token);
    return {
      success: true,
      data: response.data,
      message: response.message
    };
  } catch (error) {
    console.error('❌ Update location error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user's current location from device
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('📍 Got current location:', position.coords);
        resolve({
          success: true,
          data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        });
      },
      (error) => {
        console.error('❌ Get current location error:', error);
        reject({
          success: false,
          error: error.message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Calculate distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
};

export default {
  getLocations,
  searchLocations,
  getLocationById,
  getLocationsNearby,
  geocodeAddress,
  reverseGeocode,
  getServiceAreasByLocation,
  getProvidersByLocation,
  getServicesByLocation,
  getLocationDemographics,
  getLocationEconomics,
  getLocationSafety,
  getLocationAnalytics,
  getPopularLocations,
  getLocationHierarchy,
  createLocation,
  updateLocation,
  getCurrentLocation,
  calculateDistance
};
