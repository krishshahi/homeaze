// Location Redux Slice - State Management for Geographic Services
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as locationApi from '../../services/locationApi';

// Async thunks for API calls
export const fetchLocations = createAsyncThunk(
  'location/fetchLocations',
  async ({ params, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getLocations(params, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchLocations = createAsyncThunk(
  'location/searchLocations',
  async ({ searchParams, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.searchLocations(searchParams, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLocationDetails = createAsyncThunk(
  'location/fetchLocationDetails',
  async ({ locationId, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getLocationById(locationId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { locationId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNearbyLocations = createAsyncThunk(
  'location/fetchNearbyLocations',
  async ({ latitude, longitude, radius, params, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getLocationsNearby(latitude, longitude, radius, params, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const geocodeAddress = createAsyncThunk(
  'location/geocodeAddress',
  async ({ address, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.geocodeAddress(address, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { address, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reverseGeocode = createAsyncThunk(
  'location/reverseGeocode',
  async ({ latitude, longitude, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.reverseGeocode(latitude, longitude, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { latitude, longitude, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchServiceAreas = createAsyncThunk(
  'location/fetchServiceAreas',
  async ({ locationId, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getServiceAreasByLocation(locationId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { locationId, serviceAreas: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProvidersByLocation = createAsyncThunk(
  'location/fetchProvidersByLocation',
  async ({ locationId, params, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getProvidersByLocation(locationId, params, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { locationId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchServicesByLocation = createAsyncThunk(
  'location/fetchServicesByLocation',
  async ({ locationId, params, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getServicesByLocation(locationId, params, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { locationId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLocationDemographics = createAsyncThunk(
  'location/fetchLocationDemographics',
  async ({ locationId, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getLocationDemographics(locationId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { locationId, demographics: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLocationEconomics = createAsyncThunk(
  'location/fetchLocationEconomics',
  async ({ locationId, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getLocationEconomics(locationId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { locationId, economics: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLocationSafety = createAsyncThunk(
  'location/fetchLocationSafety',
  async ({ locationId, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getLocationSafety(locationId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { locationId, safety: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLocationAnalytics = createAsyncThunk(
  'location/fetchLocationAnalytics',
  async ({ locationId, params, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getLocationAnalytics(locationId, params, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { locationId, analytics: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPopularLocations = createAsyncThunk(
  'location/fetchPopularLocations',
  async ({ params, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getPopularLocations(params, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLocationHierarchy = createAsyncThunk(
  'location/fetchLocationHierarchy',
  async ({ parentId, token }, { rejectWithValue }) => {
    try {
      const response = await locationApi.getLocationHierarchy(parentId, token);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { parentId, hierarchy: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationApi.getCurrentLocation();
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || error.error);
    }
  }
);

const initialState = {
  // Location lists
  locations: [],
  totalLocations: 0,
  locationPagination: {
    page: 1,
    limit: 20,
    totalPages: 1
  },

  // Search results
  searchResults: [],
  searchPagination: {
    page: 1,
    limit: 20,
    totalPages: 1
  },

  // Nearby locations
  nearbyLocations: [],
  nearbyPagination: {
    page: 1,
    limit: 20,
    totalPages: 1
  },

  // Popular locations
  popularLocations: [],
  popularPagination: {
    page: 1,
    limit: 20,
    totalPages: 1
  },

  // Current location details
  currentLocationData: null,
  selectedLocation: null,

  // User's current position
  userLocation: {
    latitude: null,
    longitude: null,
    accuracy: null,
    address: null,
    lastUpdated: null
  },

  // Location hierarchy
  locationHierarchy: {},

  // Service areas by location
  serviceAreas: {}, // { locationId: serviceAreas[] }

  // Providers and services by location
  providersByLocation: {}, // { locationId: { providers: [], pagination: {} } }
  servicesByLocation: {}, // { locationId: { services: [], pagination: {} } }

  // Location analytics and demographics
  locationDemographics: {}, // { locationId: demographics }
  locationEconomics: {}, // { locationId: economics }
  locationSafety: {}, // { locationId: safety }
  locationAnalytics: {}, // { locationId: analytics }

  // Geocoding results
  geocodingResults: {}, // { address: coordinates }
  reverseGeocodingResults: {}, // { "lat,lng": address }

  // UI state
  loading: {
    locations: false,
    search: false,
    nearby: false,
    details: false,
    popular: false,
    hierarchy: false,
    geocoding: false,
    reverseGeocoding: false,
    serviceAreas: false,
    providers: false,
    services: false,
    demographics: false,
    economics: false,
    safety: false,
    analytics: false,
    userLocation: false
  },

  // Error state
  error: {
    locations: null,
    search: null,
    nearby: null,
    details: null,
    popular: null,
    hierarchy: null,
    geocoding: null,
    reverseGeocoding: null,
    serviceAreas: null,
    providers: null,
    services: null,
    demographics: null,
    economics: null,
    safety: null,
    analytics: null,
    userLocation: null
  },

  // Filters and settings
  filters: {
    locationType: 'all',
    radius: 10, // km
    sortBy: 'distance',
    sortOrder: 'asc'
  },

  // Map settings
  mapSettings: {
    center: { latitude: 40.7128, longitude: -74.0060 }, // Default to NYC
    zoom: 12,
    showServiceAreas: true,
    showProviders: true
  }
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    // Set user location
    setUserLocation: (state, action) => {
      const { latitude, longitude, accuracy, address } = action.payload;
      state.userLocation = {
        latitude,
        longitude,
        accuracy,
        address,
        lastUpdated: new Date().toISOString()
      };
      
      // Update map center
      state.mapSettings.center = { latitude, longitude };
    },

    // Clear user location
    clearUserLocation: (state) => {
      state.userLocation = {
        latitude: null,
        longitude: null,
        accuracy: null,
        address: null,
        lastUpdated: null
      };
    },

    // Set selected location
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },

    // Clear selected location
    clearSelectedLocation: (state) => {
      state.selectedLocation = null;
    },

    // Set location filters
    setLocationFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Set map settings
    setMapSettings: (state, action) => {
      state.mapSettings = { ...state.mapSettings, ...action.payload };
    },

    // Update map center
    setMapCenter: (state, action) => {
      const { latitude, longitude } = action.payload;
      state.mapSettings.center = { latitude, longitude };
    },

    // Set map zoom
    setMapZoom: (state, action) => {
      state.mapSettings.zoom = action.payload;
    },

    // Cache geocoding result
    cacheGeocodingResult: (state, action) => {
      const { address, coordinates } = action.payload;
      state.geocodingResults[address] = coordinates;
    },

    // Cache reverse geocoding result
    cacheReverseGeocodingResult: (state, action) => {
      const { latitude, longitude, address } = action.payload;
      const key = `${latitude},${longitude}`;
      state.reverseGeocodingResults[key] = address;
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = {
        page: 1,
        limit: 20,
        totalPages: 1
      };
    },

    // Clear nearby locations
    clearNearbyLocations: (state) => {
      state.nearbyLocations = [];
      state.nearbyPagination = {
        page: 1,
        limit: 20,
        totalPages: 1
      };
    },

    // Clear location errors
    clearLocationErrors: (state) => {
      state.error = {
        locations: null,
        search: null,
        nearby: null,
        details: null,
        popular: null,
        hierarchy: null,
        geocoding: null,
        reverseGeocoding: null,
        serviceAreas: null,
        providers: null,
        services: null,
        demographics: null,
        economics: null,
        safety: null,
        analytics: null,
        userLocation: null
      };
    },

    // Reset location state
    resetLocationState: () => initialState
  },
  extraReducers: (builder) => {
    // Fetch locations
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading.locations = true;
        state.error.locations = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading.locations = false;
        state.locations = action.payload.data;
        state.totalLocations = action.payload.total;
        if (action.payload.pagination) {
          state.locationPagination = action.payload.pagination;
        }
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading.locations = false;
        state.error.locations = action.payload;
      });

    // Search locations
    builder
      .addCase(searchLocations.pending, (state) => {
        state.loading.search = true;
        state.error.search = null;
      })
      .addCase(searchLocations.fulfilled, (state, action) => {
        state.loading.search = false;
        state.searchResults = action.payload.data;
        if (action.payload.pagination) {
          state.searchPagination = action.payload.pagination;
        }
      })
      .addCase(searchLocations.rejected, (state, action) => {
        state.loading.search = false;
        state.error.search = action.payload;
      });

    // Fetch location details
    builder
      .addCase(fetchLocationDetails.pending, (state) => {
        state.loading.details = true;
        state.error.details = null;
      })
      .addCase(fetchLocationDetails.fulfilled, (state, action) => {
        state.loading.details = false;
        state.selectedLocation = action.payload.data;
      })
      .addCase(fetchLocationDetails.rejected, (state, action) => {
        state.loading.details = false;
        state.error.details = action.payload;
      });

    // Fetch nearby locations
    builder
      .addCase(fetchNearbyLocations.pending, (state) => {
        state.loading.nearby = true;
        state.error.nearby = null;
      })
      .addCase(fetchNearbyLocations.fulfilled, (state, action) => {
        state.loading.nearby = false;
        state.nearbyLocations = action.payload.data;
        if (action.payload.pagination) {
          state.nearbyPagination = action.payload.pagination;
        }
      })
      .addCase(fetchNearbyLocations.rejected, (state, action) => {
        state.loading.nearby = false;
        state.error.nearby = action.payload;
      });

    // Geocode address
    builder
      .addCase(geocodeAddress.pending, (state) => {
        state.loading.geocoding = true;
        state.error.geocoding = null;
      })
      .addCase(geocodeAddress.fulfilled, (state, action) => {
        state.loading.geocoding = false;
        const { address, data } = action.payload;
        state.geocodingResults[address] = data;
      })
      .addCase(geocodeAddress.rejected, (state, action) => {
        state.loading.geocoding = false;
        state.error.geocoding = action.payload;
      });

    // Reverse geocode
    builder
      .addCase(reverseGeocode.pending, (state) => {
        state.loading.reverseGeocoding = true;
        state.error.reverseGeocoding = null;
      })
      .addCase(reverseGeocode.fulfilled, (state, action) => {
        state.loading.reverseGeocoding = false;
        const { latitude, longitude, data } = action.payload;
        const key = `${latitude},${longitude}`;
        state.reverseGeocodingResults[key] = data;
      })
      .addCase(reverseGeocode.rejected, (state, action) => {
        state.loading.reverseGeocoding = false;
        state.error.reverseGeocoding = action.payload;
      });

    // Fetch service areas
    builder
      .addCase(fetchServiceAreas.fulfilled, (state, action) => {
        const { locationId, serviceAreas } = action.payload;
        state.serviceAreas[locationId] = serviceAreas;
      });

    // Fetch providers by location
    builder
      .addCase(fetchProvidersByLocation.fulfilled, (state, action) => {
        const { locationId, data, pagination } = action.payload;
        state.providersByLocation[locationId] = {
          providers: data,
          pagination: pagination || { page: 1, limit: 20, totalPages: 1 }
        };
      });

    // Fetch services by location
    builder
      .addCase(fetchServicesByLocation.fulfilled, (state, action) => {
        const { locationId, data, pagination } = action.payload;
        state.servicesByLocation[locationId] = {
          services: data,
          pagination: pagination || { page: 1, limit: 20, totalPages: 1 }
        };
      });

    // Fetch location demographics
    builder
      .addCase(fetchLocationDemographics.fulfilled, (state, action) => {
        const { locationId, demographics } = action.payload;
        state.locationDemographics[locationId] = demographics;
      });

    // Fetch location economics
    builder
      .addCase(fetchLocationEconomics.fulfilled, (state, action) => {
        const { locationId, economics } = action.payload;
        state.locationEconomics[locationId] = economics;
      });

    // Fetch location safety
    builder
      .addCase(fetchLocationSafety.fulfilled, (state, action) => {
        const { locationId, safety } = action.payload;
        state.locationSafety[locationId] = safety;
      });

    // Fetch location analytics
    builder
      .addCase(fetchLocationAnalytics.fulfilled, (state, action) => {
        const { locationId, analytics } = action.payload;
        state.locationAnalytics[locationId] = analytics;
      });

    // Fetch popular locations
    builder
      .addCase(fetchPopularLocations.pending, (state) => {
        state.loading.popular = true;
        state.error.popular = null;
      })
      .addCase(fetchPopularLocations.fulfilled, (state, action) => {
        state.loading.popular = false;
        state.popularLocations = action.payload.data;
        if (action.payload.pagination) {
          state.popularPagination = action.payload.pagination;
        }
      })
      .addCase(fetchPopularLocations.rejected, (state, action) => {
        state.loading.popular = false;
        state.error.popular = action.payload;
      });

    // Fetch location hierarchy
    builder
      .addCase(fetchLocationHierarchy.fulfilled, (state, action) => {
        const { parentId, hierarchy } = action.payload;
        const key = parentId || 'root';
        state.locationHierarchy[key] = hierarchy;
      });

    // Get current location
    builder
      .addCase(getCurrentLocation.pending, (state) => {
        state.loading.userLocation = true;
        state.error.userLocation = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.loading.userLocation = false;
        const { latitude, longitude, accuracy } = action.payload.data;
        state.userLocation = {
          latitude,
          longitude,
          accuracy,
          address: null,
          lastUpdated: new Date().toISOString()
        };
        
        // Update map center
        state.mapSettings.center = { latitude, longitude };
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.loading.userLocation = false;
        state.error.userLocation = action.payload;
      });
  }
});

export const {
  setUserLocation,
  clearUserLocation,
  setSelectedLocation,
  clearSelectedLocation,
  setLocationFilters,
  setMapSettings,
  setMapCenter,
  setMapZoom,
  cacheGeocodingResult,
  cacheReverseGeocodingResult,
  clearSearchResults,
  clearNearbyLocations,
  clearLocationErrors,
  resetLocationState
} = locationSlice.actions;

export default locationSlice.reducer;
