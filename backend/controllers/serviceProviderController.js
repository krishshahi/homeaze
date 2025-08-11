const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Location = require('../models/Location');
const cacheService = require('../services/cacheService');
const loggingService = require('../services/loggingService');
const { validationResult } = require('express-validator');

class ServiceProviderController {
  
  // Create new service provider profile
  async createProvider(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      
      // Check if provider profile already exists
      const existingProvider = await ServiceProvider.findOne({ userId });
      if (existingProvider) {
        return res.status(400).json({
          success: false,
          message: 'Provider profile already exists for this user'
        });
      }

      // Create provider profile
      const providerData = {
        ...req.body,
        userId
      };

      const provider = new ServiceProvider(providerData);
      await provider.save();

      // Update user role
      await User.findByIdAndUpdate(userId, { 
        role: 'provider',
        'profile.isProvider': true 
      });

      // Cache the new provider
      await cacheService.cacheServiceProvider(provider._id.toString(), provider.toJSON());

      loggingService.logAuth('provider_profile_created', userId, {
        providerId: provider._id,
        businessName: provider.businessName
      });

      res.status(201).json({
        success: true,
        message: 'Service provider profile created successfully',
        data: provider
      });

    } catch (error) {
      loggingService.error('Create provider error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create provider profile'
      });
    }
  }

  // Get provider profile
  async getProvider(req, res) {
    try {
      const { providerId } = req.params;
      
      // Try cache first
      let provider = await cacheService.getCachedServiceProvider(providerId);
      
      if (!provider) {
        provider = await ServiceProvider.findById(providerId)
          .populate('userId', 'firstName lastName email phone avatar')
          .populate('services.serviceId', 'name description category')
          .populate('services.categoryId', 'name slug');
          
        if (!provider) {
          return res.status(404).json({
            success: false,
            message: 'Service provider not found'
          });
        }

        // Cache the result
        await cacheService.cacheServiceProvider(providerId, provider.toJSON());
      }

      res.json({
        success: true,
        data: provider
      });

    } catch (error) {
      loggingService.error('Get provider error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve provider profile'
      });
    }
  }

  // Update provider profile
  async updateProvider(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { providerId } = req.params;
      const userId = req.user.id;

      const provider = await ServiceProvider.findById(providerId);
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Service provider not found'
        });
      }

      // Check ownership
      if (provider.userId.toString() !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this provider profile'
        });
      }

      // Update provider
      Object.assign(provider, req.body);
      await provider.save();

      // Invalidate cache
      await cacheService.invalidateServiceProvider(providerId);

      loggingService.logAuth('provider_profile_updated', userId, {
        providerId: provider._id,
        changes: Object.keys(req.body)
      });

      res.json({
        success: true,
        message: 'Provider profile updated successfully',
        data: provider
      });

    } catch (error) {
      loggingService.error('Update provider error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update provider profile'
      });
    }
  }

  // Search service providers
  async searchProviders(req, res) {
    try {
      const {
        query = '',
        location,
        coordinates,
        radius = 25,
        services,
        category,
        minRating = 0,
        maxPrice,
        availability,
        sortBy = 'distance',
        page = 1,
        limit = 20
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      let searchCriteria = {
        status: 'active',
        'verification.isVerified': true
      };

      // Text search
      if (query) {
        searchCriteria.$or = [
          { businessName: { $regex: query, $options: 'i' } },
          { businessDescription: { $regex: query, $options: 'i' } },
          { 'services.serviceName': { $regex: query, $options: 'i' } }
        ];
      }

      // Filter by services
      if (services) {
        const serviceIds = services.split(',');
        searchCriteria['services.serviceId'] = { $in: serviceIds };
      }

      // Filter by category
      if (category) {
        searchCriteria['services.categoryId'] = category;
      }

      // Filter by rating
      if (minRating > 0) {
        searchCriteria['ratings.averageRating'] = { $gte: parseFloat(minRating) };
      }

      // Filter by price
      if (maxPrice) {
        searchCriteria['services.pricing.basePrice'] = { $lte: parseFloat(maxPrice) };
      }

      let query_obj = ServiceProvider.find(searchCriteria);

      // Location-based search
      if (coordinates) {
        const [lng, lat] = coordinates.split(',').map(Number);
        const radiusInMeters = parseFloat(radius) * 1609.34; // Convert miles to meters
        
        query_obj = ServiceProvider.find({
          ...searchCriteria,
          'serviceAreas.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat]
              },
              $maxDistance: radiusInMeters
            }
          }
        });
      }

      // Sorting
      let sortOptions = {};
      switch (sortBy) {
        case 'rating':
          sortOptions = { 'ratings.averageRating': -1 };
          break;
        case 'price_low':
          sortOptions = { 'services.pricing.basePrice': 1 };
          break;
        case 'price_high':
          sortOptions = { 'services.pricing.basePrice': -1 };
          break;
        case 'experience':
          sortOptions = { 'businessMetrics.totalJobs': -1 };
          break;
        case 'recent':
          sortOptions = { joinedDate: -1 };
          break;
        default:
          // Distance sorting is handled by $near in location search
          if (!coordinates) {
            sortOptions = { 'ratings.averageRating': -1 };
          }
      }

      const providers = await query_obj
        .populate('userId', 'firstName lastName avatar')
        .populate('services.serviceId', 'name description')
        .populate('services.categoryId', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count
      const total = await ServiceProvider.countDocuments(searchCriteria);

      // Add distance calculation if coordinates provided
      if (coordinates && providers.length > 0) {
        const [lng, lat] = coordinates.split(',').map(Number);
        providers.forEach(provider => {
          if (provider.serviceAreas && provider.serviceAreas.length > 0) {
            const nearestArea = provider.serviceAreas[0];
            if (nearestArea.coordinates) {
              provider.distance = this.calculateDistance(
                [lng, lat],
                nearestArea.coordinates
              );
            }
          }
        });
      }

      res.json({
        success: true,
        data: {
          providers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          },
          searchCriteria: {
            query,
            location,
            radius,
            services,
            category,
            minRating,
            maxPrice,
            sortBy
          }
        }
      });

    } catch (error) {
      loggingService.error('Search providers error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search service providers'
      });
    }
  }

  // Get providers by location
  async getProvidersByLocation(req, res) {
    try {
      const { lat, lng, radius = 25, limit = 50 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const radiusInMeters = parseFloat(radius) * 1609.34; // Convert miles to meters
      
      const providers = await ServiceProvider.find({
        status: 'active',
        'serviceAreas.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radiusInMeters
          }
        }
      })
      .populate('userId', 'firstName lastName avatar')
      .populate('services.serviceId', 'name')
      .limit(parseInt(limit))
      .lean();

      // Calculate distances
      providers.forEach(provider => {
        if (provider.serviceAreas && provider.serviceAreas.length > 0) {
          const nearestArea = provider.serviceAreas[0];
          if (nearestArea.coordinates) {
            provider.distance = this.calculateDistance(
              [parseFloat(lng), parseFloat(lat)],
              nearestArea.coordinates
            );
          }
        }
      });

      res.json({
        success: true,
        data: providers
      });

    } catch (error) {
      loggingService.error('Get providers by location error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve providers by location'
      });
    }
  }

  // Get provider analytics
  async getProviderAnalytics(req, res) {
    try {
      const { providerId } = req.params;
      const { timeframe = '30d' } = req.query;

      const provider = await ServiceProvider.findById(providerId);
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Service provider not found'
        });
      }

      // Check ownership
      if (provider.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view analytics for this provider'
        });
      }

      // Calculate timeframe
      let startDate = new Date();
      switch (timeframe) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      // Get bookings data (you would need to create aggregation queries)
      const analytics = {
        overview: {
          totalJobs: provider.businessMetrics.totalJobs,
          completedJobs: provider.businessMetrics.completedJobs,
          totalRevenue: provider.businessMetrics.totalRevenue,
          averageRating: provider.ratings.averageRating,
          responseTime: provider.businessMetrics.responseTime,
          completionRate: provider.completionRate
        },
        ratings: {
          averageRating: provider.ratings.averageRating,
          totalReviews: provider.ratings.totalReviews,
          breakdown: provider.ratings.ratingBreakdown,
          qualityScores: provider.ratings.qualityScores
        },
        services: provider.services.map(service => ({
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          isActive: service.isActive,
          basePrice: service.pricing.basePrice
        })),
        // Add more analytics as needed
      };

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      loggingService.error('Get provider analytics error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve provider analytics'
      });
    }
  }

  // Update provider availability
  async updateAvailability(req, res) {
    try {
      const { providerId } = req.params;
      const { schedule, blackoutDates, emergencyAvailable } = req.body;

      const provider = await ServiceProvider.findById(providerId);
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Service provider not found'
        });
      }

      // Check ownership
      if (provider.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update availability for this provider'
        });
      }

      // Update availability
      if (schedule) provider.availability.schedule = schedule;
      if (blackoutDates) provider.availability.blackoutDates = blackoutDates;
      if (emergencyAvailable !== undefined) provider.availability.emergencyAvailable = emergencyAvailable;

      await provider.save();

      // Invalidate cache
      await cacheService.invalidateServiceProvider(providerId);

      res.json({
        success: true,
        message: 'Availability updated successfully',
        data: provider.availability
      });

    } catch (error) {
      loggingService.error('Update availability error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update availability'
      });
    }
  }

  // Add or update service
  async updateServices(req, res) {
    try {
      const { providerId } = req.params;
      const { services } = req.body;

      const provider = await ServiceProvider.findById(providerId);
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Service provider not found'
        });
      }

      // Check ownership
      if (provider.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update services for this provider'
        });
      }

      // Update services
      provider.services = services;
      await provider.save();

      // Invalidate cache
      await cacheService.invalidateServiceProvider(providerId);

      res.json({
        success: true,
        message: 'Services updated successfully',
        data: provider.services
      });

    } catch (error) {
      loggingService.error('Update services error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update services'
      });
    }
  }

  // Get featured providers
  async getFeaturedProviders(req, res) {
    try {
      const { limit = 10, category } = req.query;
      
      let searchCriteria = {
        status: 'active',
        'verification.isVerified': true,
        'subscription.featuresEnabled.priorityListing': true
      };

      if (category) {
        searchCriteria['services.categoryId'] = category;
      }

      const providers = await ServiceProvider.find(searchCriteria)
        .populate('userId', 'firstName lastName avatar')
        .populate('services.serviceId', 'name')
        .populate('services.categoryId', 'name')
        .sort({ 'ratings.averageRating': -1, 'businessMetrics.totalJobs': -1 })
        .limit(parseInt(limit))
        .lean();

      res.json({
        success: true,
        data: providers
      });

    } catch (error) {
      loggingService.error('Get featured providers error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve featured providers'
      });
    }
  }

  // Helper method to calculate distance between two coordinates
  calculateDistance(coord1, coord2) {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round((R * c) * 100) / 100; // Round to 2 decimal places
  }

  // Admin: Get all providers with pagination
  async getAllProviders(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        verified,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      let searchCriteria = {};

      if (status) searchCriteria.status = status;
      if (verified !== undefined) searchCriteria['verification.isVerified'] = verified === 'true';

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const providers = await ServiceProvider.find(searchCriteria)
        .populate('userId', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await ServiceProvider.countDocuments(searchCriteria);

      res.json({
        success: true,
        data: {
          providers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      loggingService.error('Get all providers error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve providers'
      });
    }
  }

  // Admin: Verify provider
  async verifyProvider(req, res) {
    try {
      const { providerId } = req.params;
      const { verified, reason } = req.body;

      const provider = await ServiceProvider.findById(providerId);
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Service provider not found'
        });
      }

      provider.verification.isVerified = verified;
      provider.verification.verificationDate = verified ? new Date() : null;
      
      if (reason) {
        provider.internalNotes.push({
          note: reason,
          addedBy: req.user.id,
          addedDate: new Date()
        });
      }

      await provider.save();

      // Invalidate cache
      await cacheService.invalidateServiceProvider(providerId);

      loggingService.logAuth('provider_verification', req.user.id, {
        providerId: provider._id,
        verified,
        reason
      });

      res.json({
        success: true,
        message: `Provider ${verified ? 'verified' : 'unverified'} successfully`,
        data: provider
      });

    } catch (error) {
      loggingService.error('Verify provider error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify provider'
      });
    }
  }
}

module.exports = new ServiceProviderController();
