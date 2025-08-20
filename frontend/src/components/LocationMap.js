// LocationMap Component - Interactive Map with Providers and Service Areas
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Circle, Polygon, Callout } from 'react-native-maps';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const LocationMap = ({
  providers = [],
  serviceAreas = [],
  userLocation,
  selectedProvider,
  showUserLocation = true,
  showProviders = true,
  showServiceAreas = true,
  showControls = true,
  mapType = 'standard',
  onProviderPress,
  onMapPress,
  onRegionChange,
  onLocationSelect,
  style
}) => {
  const [region, setRegion] = useState({
    latitude: userLocation?.latitude || 40.7128,
    longitude: userLocation?.longitude || -74.0060,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  
  const [currentLocation, setCurrentLocation] = useState(userLocation);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapTypeState, setMapTypeState] = useState(mapType);
  const [followUser, setFollowUser] = useState(false);
  
  const mapRef = useRef(null);

  // Update region when userLocation changes
  useEffect(() => {
    if (userLocation && (userLocation.latitude !== currentLocation?.latitude || userLocation.longitude !== currentLocation?.longitude)) {
      setCurrentLocation(userLocation);
      if (followUser) {
        const newRegion = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      }
    }
  }, [userLocation, currentLocation, followUser]);

  // Get current location
  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your location on the map.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      };

      setCurrentLocation(newLocation);
      setFollowUser(true);

      const newRegion = {
        ...newLocation,
        latitudeDelta: LATITUDE_DELTA / 4, // Zoom in a bit
        longitudeDelta: LONGITUDE_DELTA / 4,
      };

      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);

      onLocationSelect && onLocationSelect(newLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your current location. Please try again.');
    } finally {
      setLoadingLocation(false);
    }
  };

  // Handle region change
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    setFollowUser(false); // Stop following user when manually moved
    onRegionChange && onRegionChange(newRegion);
  };

  // Handle map press
  const handleMapPress = (event) => {
    const coordinate = event.nativeEvent.coordinate;
    onMapPress && onMapPress(coordinate);
  };

  // Get provider marker color based on rating
  const getProviderMarkerColor = (provider) => {
    const rating = provider.rating?.average || 0;
    if (rating >= 4.5) return COLORS.success;
    if (rating >= 4.0) return COLORS.warning;
    if (rating >= 3.5) return COLORS.info;
    return COLORS.primary;
  };

  // Fit map to show all providers
  const fitToProviders = () => {
    if (providers.length === 0) return;

    const coordinates = providers
      .filter(p => p.location?.coordinates)
      .map(p => ({
        latitude: p.location.coordinates.latitude,
        longitude: p.location.coordinates.longitude,
      }));

    if (currentLocation && showUserLocation) {
      coordinates.push({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
    }

    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  };

  // Toggle map type
  const toggleMapType = () => {
    const types = ['standard', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(mapTypeState);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapTypeState(types[nextIndex]);
  };

  // Render provider markers
  const renderProviderMarkers = () => {
    if (!showProviders) return null;

    return providers
      .filter(provider => provider.location?.coordinates)
      .map((provider) => (
        <Marker
          key={provider.id}
          coordinate={{
            latitude: provider.location.coordinates.latitude,
            longitude: provider.location.coordinates.longitude,
          }}
          pinColor={getProviderMarkerColor(provider)}
          onPress={() => onProviderPress && onProviderPress(provider)}
        >
          <View style={[
            styles.providerMarker,
            {
              backgroundColor: getProviderMarkerColor(provider),
              borderColor: selectedProvider?.id === provider.id ? COLORS.textPrimary : COLORS.white
            }
          ]}>
            <Text style={styles.providerMarkerText}>
              {provider.businessName?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>

          <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle} numberOfLines={1}>
                {provider.businessName}
              </Text>
              <View style={styles.calloutRating}>
                <Text style={styles.calloutRatingText}>
                  ⭐ {provider.rating?.average?.toFixed(1) || 'N/A'}
                </Text>
                <Text style={styles.calloutReviews}>
                  ({provider.rating?.count || 0})
                </Text>
              </View>
              {provider.distance && (
                <Text style={styles.calloutDistance}>
                  📍 {provider.distance < 1 ? `${(provider.distance * 1000).toFixed(0)}m` : `${provider.distance.toFixed(1)}km`} away
                </Text>
              )}
            </View>
          </Callout>
        </Marker>
      ));
  };

  // Render service areas
  const renderServiceAreas = () => {
    if (!showServiceAreas || serviceAreas.length === 0) return null;

    return serviceAreas.map((area, index) => {
      if (area.type === 'circle' && area.center && area.radius) {
        return (
          <Circle
            key={`circle-${index}`}
            center={area.center}
            radius={area.radius * 1000} // Convert km to meters
            strokeColor={COLORS.primary + '80'}
            fillColor={COLORS.primary + '20'}
            strokeWidth={2}
          />
        );
      } else if (area.type === 'polygon' && area.coordinates) {
        return (
          <Polygon
            key={`polygon-${index}`}
            coordinates={area.coordinates}
            strokeColor={COLORS.primary + '80'}
            fillColor={COLORS.primary + '20'}
            strokeWidth={2}
          />
        );
      }
      return null;
    });
  };

  // Render controls
  const renderControls = () => {
    if (!showControls) return null;

    return (
      <>
        {/* Location Control */}
        <TouchableOpacity
          style={styles.locationControl}
          onPress={getCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.controlIcon}>📍</Text>
          )}
        </TouchableOpacity>

        {/* Map Type Control */}
        <TouchableOpacity
          style={styles.mapTypeControl}
          onPress={toggleMapType}
        >
          <Text style={styles.controlIcon}>🗺️</Text>
        </TouchableOpacity>

        {/* Fit to Providers Control */}
        {providers.length > 0 && (
          <TouchableOpacity
            style={styles.fitControl}
            onPress={fitToProviders}
          >
            <Text style={styles.controlIcon}>🎯</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  // Render legend
  const renderLegend = () => {
    if (!showProviders && !showServiceAreas) return null;

    return (
      <View style={styles.legend}>
        <LinearGradient
          colors={[COLORS.white, COLORS.backgroundSecondary]}
          style={styles.legendGradient}
        >
          <Text style={styles.legendTitle}>Map Legend</Text>
          
          {showProviders && (
            <View style={styles.legendSection}>
              <Text style={styles.legendSectionTitle}>Providers</Text>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
                <Text style={styles.legendText}>4.5+ ⭐ Excellent</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.legendText}>4.0+ ⭐ Good</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.info }]} />
                <Text style={styles.legendText}>3.5+ ⭐ Fair</Text>
              </View>
            </View>
          )}

          {showServiceAreas && (
            <View style={styles.legendSection}>
              <Text style={styles.legendSectionTitle}>Service Areas</Text>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.primary + '40' }]} />
                <Text style={styles.legendText}>Coverage Zone</Text>
              </View>
            </View>
          )}

          {showUserLocation && currentLocation && (
            <View style={styles.legendSection}>
              <Text style={styles.legendSectionTitle}>Your Location</Text>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: COLORS.error }]} />
                <Text style={styles.legendText}>Current Position</Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapPress}
        mapType={mapTypeState}
        showsUserLocation={showUserLocation && !!currentLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {/* User Location Marker */}
        {showUserLocation && currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            description="Current position"
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
            </View>
          </Marker>
        )}

        {/* Provider Markers */}
        {renderProviderMarkers()}

        {/* Service Areas */}
        {renderServiceAreas()}
      </MapView>

      {/* Controls */}
      {renderControls()}

      {/* Legend */}
      {renderLegend()}

      {/* Provider Count */}
      {showProviders && providers.length > 0 && (
        <View style={styles.providerCount}>
          <Text style={styles.providerCountText}>
            {providers.length} Provider{providers.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  providerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  providerMarkerText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userLocationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  calloutContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    minWidth: 120,
    maxWidth: 200,
    ...SHADOWS.medium,
  },
  calloutTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  calloutRatingText: {
    fontSize: FONTS.sm,
    color: COLORS.warning,
    marginRight: SPACING.xs,
  },
  calloutReviews: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  calloutDistance: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  locationControl: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  mapTypeControl: {
    position: 'absolute',
    top: 104,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  fitControl: {
    position: 'absolute',
    top: 158,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  controlIcon: {
    fontSize: 20,
  },
  legend: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    maxWidth: 160,
  },
  legendGradient: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOWS.medium,
  },
  legendTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  legendSection: {
    marginBottom: SPACING.sm,
  },
  legendSectionTitle: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  providerCount: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  providerCountText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.white,
  },
});

export default LocationMap;
