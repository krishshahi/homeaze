// Enhanced Location Service - Production Ready
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class LocationService {
  static currentLocation = null;
  static watchId = null;
  static locationCache = new Map();
  static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Initialize location services
   * @param {Function} onLocationUpdate - Callback when location changes
   */
  static async initialize(onLocationUpdate) {
    try {
      console.log('📍 Initializing location service...');
      
      // Check permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('❌ Location permission denied');
        return false;
      }
      
      // Get current location
      await this.getCurrentLocation();
      
      // Set up location watching if callback provided
      if (onLocationUpdate) {
        this.startWatching(onLocationUpdate);
      }
      
      console.log('✅ Location service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing location service:', error);
      return false;
    }
  }
  
  /**
   * Request location permissions
   */
  static async requestPermissions() {
    try {
      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings to find nearby providers.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'We need location access to show you nearby service providers and accurate service areas.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: this.openLocationSettings }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error requesting location permissions:', error);
      return false;
    }
  }
  
  /**
   * Open device location settings
   */
  static openLocationSettings() {
    if (Platform.OS === 'ios') {
      Location.openAppSettingsAsync();
    } else {
      Location.openAppSettingsAsync();
    }
  }
  
  /**
   * Get current location
   * @param {boolean} useCache - Whether to use cached location
   */
  static async getCurrentLocation(useCache = true) {
    try {
      // Check cache first
      if (useCache && this.currentLocation) {
        const age = Date.now() - this.currentLocation.timestamp;
        if (age < this.CACHE_DURATION) {
          return this.currentLocation;
        }
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 60000, // Use cached location if less than 1 minute old
      });
      
      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: Date.now(),
      };
      
      // Cache location
      await this.saveLocationToStorage(this.currentLocation);
      
      console.log('📍 Current location:', this.currentLocation);
      return this.currentLocation;
    } catch (error) {
      console.error('❌ Error getting current location:', error);
      
      // Try to get cached location from storage
      const cachedLocation = await this.getLocationFromStorage();
      if (cachedLocation) {
        this.currentLocation = cachedLocation;
        return cachedLocation;
      }
      
      throw error;
    }
  }
  
  /**
   * Start watching location changes
   */
  static async startWatching(onLocationUpdate) {
    try {
      if (this.watchId) {
        await Location.watchPositionAsync.removeAsync(this.watchId);
      }
      
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 100, // Update when moved 100 meters
        },
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: Date.now(),
          };
          
          console.log('📍 Location updated:', this.currentLocation);
          
          if (onLocationUpdate) {
            onLocationUpdate(this.currentLocation);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error starting location watching:', error);
    }
  }
  
  /**
   * Stop watching location changes
   */
  static async stopWatching() {
    if (this.watchId) {
      await Location.watchPositionAsync.removeAsync(this.watchId);
      this.watchId = null;
      console.log('🛑 Stopped watching location');
    }
  }
  
  /**
   * Find nearby providers
   * @param {Object} options - Search options
   */
  static async findNearbyProviders(options = {}) {
    try {
      const location = await this.getCurrentLocation();
      
      const {
        radius = 10, // km
        serviceCategory = null,
        limit = 20,
        sortBy = 'distance',
        minRating = 0,
      } = options;
      
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const queryParams = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        radius: radius.toString(),
        limit: limit.toString(),
        sortBy,
        minRating: minRating.toString(),
        ...(serviceCategory && { category: serviceCategory }),
      });
      
      const response = await fetch(`${API_BASE_URL}/providers/nearby?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to find nearby providers');
      }
      
      // Calculate distances and add to results
      const providersWithDistance = data.providers.map(provider => ({
        ...provider,
        distance: this.calculateDistance(
          location.latitude,
          location.longitude,
          provider.location.latitude,
          provider.location.longitude
        ),
      }));
      
      return {
        providers: providersWithDistance,
        userLocation: location,
        searchRadius: radius,
      };
    } catch (error) {
      console.error('❌ Error finding nearby providers:', error);
      throw error;
    }
  }
  
  /**
   * Find nearby services
   * @param {Object} options - Search options
   */
  static async findNearbyServices(options = {}) {
    try {
      const location = await this.getCurrentLocation();
      
      const {
        radius = 15, // km
        category = null,
        limit = 50,
        sortBy = 'relevance', // distance, price, rating, relevance
        priceRange = null,
        availability = null,
      } = options;
      
      const token = (await AsyncStorage.getItem('token')) || (await AsyncStorage.getItem('userToken'));
      
      const queryParams = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        radius: radius.toString(),
        limit: limit.toString(),
        sortBy,
        ...(category && { category }),
        ...(priceRange && { minPrice: priceRange[0], maxPrice: priceRange[1] }),
        ...(availability && { availability }),
      });
      
      const response = await fetch(`${API_BASE_URL}/services/nearby?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to find nearby services');
      }
      
      // Calculate distances and add to results
      const servicesWithDistance = data.services.map(service => ({
        ...service,
        distance: this.calculateDistance(
          location.latitude,
          location.longitude,
          service.provider.location.latitude,
          service.provider.location.longitude
        ),
      }));
      
      return {
        services: servicesWithDistance,
        userLocation: location,
        searchRadius: radius,
      };
    } catch (error) {
      console.error('❌ Error finding nearby services:', error);
      throw error;
    }
  }
  
  /**
   * Calculate distance between two points (Haversine formula)
   * @param {number} lat1 - First point latitude
   * @param {number} lon1 - First point longitude
   * @param {number} lat2 - Second point latitude
   * @param {number} lon2 - Second point longitude
   * @returns {number} Distance in kilometers
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }
  
  /**
   * Convert degrees to radians
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Get address from coordinates (reverse geocoding)
   * @param {number} latitude
   * @param {number} longitude
   */
  static async getAddressFromCoordinates(latitude, longitude) {
    try {
      // Check cache first
      const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      const cached = this.locationCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
        return cached.address;
      }
      
      const addressData = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (addressData && addressData.length > 0) {
        const address = addressData[0];
        const formattedAddress = {
          street: `${address.streetNumber || ''} ${address.street || ''}`.trim(),
          city: address.city || address.subregion || '',
          state: address.region || '',
          postalCode: address.postalCode || '',
          country: address.country || '',
          formattedAddress: [
            `${address.streetNumber || ''} ${address.street || ''}`.trim(),
            address.city || address.subregion || '',
            `${address.region || ''} ${address.postalCode || ''}`.trim(),
            address.country || ''
          ].filter(part => part).join(', '),
        };
        
        // Cache the result
        this.locationCache.set(cacheKey, {
          address: formattedAddress,
          timestamp: Date.now(),
        });
        
        return formattedAddress;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting address from coordinates:', error);
      return null;
    }
  }
  
  /**
   * Get coordinates from address (geocoding)
   * @param {string} address
   */
  static async getCoordinatesFromAddress(address) {
    try {
      // Check cache first
      const cached = this.locationCache.get(address);
      if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
        return cached.coordinates;
      }
      
      const geocodeData = await Location.geocodeAsync(address);
      
      if (geocodeData && geocodeData.length > 0) {
        const coordinates = {
          latitude: geocodeData[0].latitude,
          longitude: geocodeData[0].longitude,
        };
        
        // Cache the result
        this.locationCache.set(address, {
          coordinates,
          timestamp: Date.now(),
        });
        
        return coordinates;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting coordinates from address:', error);
      return null;
    }
  }
  
  /**
   * Check if location is in service area
   * @param {Object} location - Location coordinates
   * @param {Array} serviceAreas - Array of service area polygons
   */
  static isLocationInServiceArea(location, serviceAreas) {
    try {
      for (const area of serviceAreas) {
        if (area.type === 'circle') {
          const distance = this.calculateDistance(
            location.latitude,
            location.longitude,
            area.center.latitude,
            area.center.longitude
          );
          if (distance <= area.radius) {
            return true;
          }
        } else if (area.type === 'polygon') {
          // Point-in-polygon algorithm (ray casting)
          if (this.isPointInPolygon(location, area.coordinates)) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error checking service area:', error);
      return false;
    }
  }
  
  /**
   * Point-in-polygon algorithm
   */
  static isPointInPolygon(point, polygon) {
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].longitude > point.longitude !== polygon[j].longitude > point.longitude &&
        point.latitude <
          ((polygon[j].latitude - polygon[i].latitude) *
            (point.longitude - polygon[i].longitude)) /
            (polygon[j].longitude - polygon[i].longitude) +
            polygon[i].latitude
      ) {
        inside = !inside;
      }
    }
    
    return inside;
  }
  
  /**
   * Format distance for display
   */
  static formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }
  
  /**
   * Save location to storage
   */
  static async saveLocationToStorage(location) {
    try {
      await AsyncStorage.setItem('lastKnownLocation', JSON.stringify(location));
    } catch (error) {
      console.error('❌ Error saving location to storage:', error);
    }
  }
  
  /**
   * Get location from storage
   */
  static async getLocationFromStorage() {
    try {
      const stored = await AsyncStorage.getItem('lastKnownLocation');
      if (stored) {
        const location = JSON.parse(stored);
        // Check if location is not too old (max 24 hours)
        if (Date.now() - location.timestamp < 24 * 60 * 60 * 1000) {
          return location;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting location from storage:', error);
      return null;
    }
  }
  
  /**
   * Get location permission status
   */
  static async getPermissionStatus() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    } catch (error) {
      console.error('❌ Error getting permission status:', error);
      return 'undetermined';
    }
  }
  
  /**
   * Clean up location service
   */
  static cleanup() {
    this.stopWatching();
    this.locationCache.clear();
    this.currentLocation = null;
    console.log('🧹 Location service cleaned up');
  }
}

export default LocationService;
