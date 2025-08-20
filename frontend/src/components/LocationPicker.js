// LocationPicker Component - Geographic Location Selection
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const LocationPicker = ({
  value,
  onLocationSelect,
  onLocationChange,
  placeholder = "Enter your location",
  showCurrentLocationButton = true,
  showMapButton = false,
  style,
  disabled = false,
  searchLocations,  // Function to search locations
  geocodeAddress,   // Function to geocode address
  getCurrentLocation, // Function to get current location
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState(value?.address || '');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(value);
  
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedLocation(value);
      setSearchQuery(value.address || '');
    }
  }, [value]);

  // Handle search input change
  const handleSearchChange = async (text) => {
    setSearchQuery(text);
    setShowDropdown(true);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Don't search for very short queries
    if (text.length < 3) {
      setSearchResults([]);
      return;
    }
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      await performSearch(text);
    }, 500);
  };

  // Perform location search
  const performSearch = async (query) => {
    if (!searchLocations) return;
    
    setLoadingSearch(true);
    try {
      const results = await searchLocations({
        query,
        limit: 10,
        includeCoordinates: true
      });
      
      if (results.success) {
        setSearchResults(results.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.address || location.formattedAddress);
    setShowDropdown(false);
    inputRef.current?.blur();
    
    // Call callbacks
    onLocationSelect && onLocationSelect(location);
    onLocationChange && onLocationChange(location);
  };

  // Get current location
  const handleGetCurrentLocation = async () => {
    setLoadingCurrentLocation(true);
    
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please grant location permission to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address
      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      if (getCurrentLocation) {
        try {
          const result = await getCurrentLocation();
          if (result.success) {
            // If we have a geocoding service, use it
            if (geocodeAddress) {
              const geocodeResult = await geocodeAddress(`${latitude},${longitude}`);
              if (geocodeResult.success && geocodeResult.data.formattedAddress) {
                address = geocodeResult.data.formattedAddress;
              }
            }
          }
        } catch (error) {
          console.warn('Geocoding error:', error);
        }
      }

      const currentLocation = {
        latitude,
        longitude,
        address,
        formattedAddress: address,
        type: 'current',
        name: 'Current Location'
      };

      handleLocationSelect(currentLocation);
    } catch (error) {
      console.error('Get current location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or enter manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingCurrentLocation(false);
    }
  };

  // Handle manual address input
  const handleManualInput = async () => {
    if (!searchQuery.trim() || !geocodeAddress) return;
    
    setLoadingSearch(true);
    try {
      const result = await geocodeAddress(searchQuery.trim());
      if (result.success && result.data) {
        const location = {
          ...result.data,
          address: searchQuery.trim(),
          type: 'manual'
        };
        handleLocationSelect(location);
      } else {
        Alert.alert(
          'Location Not Found',
          'Unable to find the location. Please check the address and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert(
        'Error',
        'Unable to geocode the address. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingSearch(false);
    }
  };

  // Render search result item
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.name || item.formattedAddress || item.address}
          </Text>
          <MaterialCommunityIcons name={getLocationTypeIcon(item.type)} size={16} style={styles.resultType} />
        </View>
        
        {item.formattedAddress && item.formattedAddress !== item.name && (
          <Text style={styles.resultAddress} numberOfLines={2}>
            {item.formattedAddress}
          </Text>
        )}
        
        {item.distance && (
          <Text style={styles.resultDistance}><MaterialCommunityIcons name="map-marker-outline" /> {item.distance.toFixed(1)} km away</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Get location type icon
  const getLocationTypeIcon = (type) => {
    const icons = {
      current: 'map-marker-outline',
      city: 'city-variant-outline',
      neighborhood: 'home-group',
      address: 'home-outline',
      business: 'office-building-outline',
      landmark: 'map-outline',
      manual: 'pencil-outline'
    };
    return icons[type] || 'map-marker-outline';
  };

  // Clear selection
  const handleClear = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    onLocationSelect && onLocationSelect(null);
    onLocationChange && onLocationChange(null);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Input Container */}
      <View style={[
        styles.inputContainer,
        disabled && styles.disabledContainer,
        showDropdown && styles.activeContainer
      ]}>
        <View style={styles.inputWrapper}>
          {/* Location Icon */}
          <MaterialCommunityIcons name="map-marker-outline" size={18} style={styles.locationIcon} />
          
          {/* Text Input */}
          <TextInput
            ref={inputRef}
            style={[styles.textInput, disabled && styles.disabledInput]}
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            editable={!disabled}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              // Delay hiding dropdown to allow selection
              setTimeout(() => setShowDropdown(false), 200);
            }}
            returnKeyType="search"
            onSubmitEditing={handleManualInput}
          />

          {/* Loading Indicator */}
          {(loadingSearch || loading) && (
            <ActivityIndicator 
              size="small" 
              color={COLORS.primary} 
              style={styles.loadingIndicator}
            />
          )}

          {/* Clear Button */}
          {searchQuery.length > 0 && !disabled && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <MaterialCommunityIcons name="close" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        {!disabled && (
          <View style={styles.actionButtons}>
            {/* Current Location Button */}
            {showCurrentLocationButton && (
              <TouchableOpacity
                style={[styles.actionButton, styles.currentLocationButton]}
                onPress={handleGetCurrentLocation}
                disabled={loadingCurrentLocation}
              >
                {loadingCurrentLocation ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.actionButtonText}><MaterialCommunityIcons name="crosshairs-gps" /> Current</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Map Button */}
            {showMapButton && (
              <TouchableOpacity
                style={[styles.actionButton, styles.mapButton]}
                onPress={() => {
                  // TODO: Open map picker modal
                  console.log('Open map picker');
                }}
              >
                <Text style={styles.actionButtonText}><MaterialCommunityIcons name="map-search-outline" /> Map</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Search Results Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => `${item.id || index}`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.resultsList}
            nestedScrollEnabled
          />
        </View>
      )}

      {/* Selected Location Display */}
      {selectedLocation && !showDropdown && (
        <View style={styles.selectedLocation}>
          <LinearGradient
            colors={[COLORS.primary + '20', COLORS.primary + '10']}
            style={styles.selectedLocationGradient}
          >
            <View style={styles.selectedLocationContent}>
              <Text style={styles.selectedLocationIcon}>
                {getLocationTypeIcon(selectedLocation.type)}
              </Text>
              <View style={styles.selectedLocationDetails}>
                <Text style={styles.selectedLocationName}>
                  {selectedLocation.name || 'Selected Location'}
                </Text>
                <Text style={styles.selectedLocationAddress}>
                  {selectedLocation.formattedAddress || selectedLocation.address}
                </Text>
                {selectedLocation.latitude && selectedLocation.longitude && (
                  <Text style={styles.selectedLocationCoords}>
                    {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                  </Text>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  activeContainer: {
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  disabledContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    opacity: 0.7,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.xs,
  },
  disabledInput: {
    color: COLORS.textSecondary,
  },
  loadingIndicator: {
    marginLeft: SPACING.sm,
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  currentLocationButton: {
    backgroundColor: COLORS.primary,
  },
  mapButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.primary,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    maxHeight: 200,
    zIndex: 1000,
    ...SHADOWS.medium,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  resultTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    flex: 1,
  },
  resultType: {
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  resultAddress: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: FONTS.sm * 1.3,
  },
  resultDistance: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  selectedLocation: {
    marginTop: SPACING.sm,
  },
  selectedLocationGradient: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  selectedLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLocationIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  selectedLocationDetails: {
    flex: 1,
  },
  selectedLocationName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  selectedLocationAddress: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  selectedLocationCoords: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
});

export default LocationPicker;
