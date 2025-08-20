import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { servicesAPI } from '../services/api';
import { useAppDispatch, useServices } from '../store/hooks';

const ServiceDetailsScreen = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { services } = useServices();
  const { serviceId: routeServiceId, service: routeService } = route.params || {};
  const serviceId = routeService?.id || routeServiceId;
  
  const [service, setService] = useState(routeService || null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(!routeService && !!serviceId);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  useEffect(() => {
    console.log('🔍 ServiceDetailsScreen mounted with:', { serviceId, routeService });
    
    // If we already have service data from route, use it immediately
    if (routeService) {
      console.log('✅ Using service data from navigation:', routeService.title);
      const normalizedService = {
        id: routeService.id || routeService._id,
        title: routeService.title || routeService.name,
        description: routeService.description || 'Professional service for your home',
        startingPrice: routeService.startingPrice || routeService.price || 75,
        rating: routeService.rating || 4.8,
        featured: !!routeService.featured,
        availability: typeof routeService.availability === 'object' ? 'Available' : routeService.availability || 'Available',
        icon: routeService.icon || '🧰',
        provider: routeService.provider || { 
          id: routeService.providerId, 
          name: routeService.providerName || 'Professional Provider', 
          rating: routeService.providerRating || 4.9, 
          reviewCount: routeService.providerReviewCount || 127 
        },
        services: routeService.includedServices || routeService.services || [
          'Professional service delivery',
          'Quality tools and equipment',
          'Licensed and insured',
          'Satisfaction guarantee'
        ],
      };
      setService(normalizedService);
      setLoading(false);
      return;
    }
    
    // Try to find service in Redux store
    if (serviceId) {
      const foundService = services.find((s) => (s.id || s._id) === serviceId);
      if (foundService) {
        console.log('✅ Found service in Redux store:', foundService.title);
        const normalizedService = {
          id: foundService.id || foundService._id,
          title: foundService.title || foundService.name,
          description: foundService.description || 'Professional service for your home',
          startingPrice: foundService.startingPrice || foundService.price || 75,
          rating: foundService.rating || 4.8,
          featured: !!foundService.featured,
          availability: typeof foundService.availability === 'object' ? 'Available' : foundService.availability || 'Available',
          icon: foundService.icon || '🧰',
          provider: foundService.provider || { 
            id: foundService.providerId, 
            name: foundService.providerName || 'Professional Provider', 
            rating: foundService.providerRating || 4.9, 
            reviewCount: foundService.providerReviewCount || 127 
          },
          services: foundService.includedServices || foundService.services || [
            'Professional service delivery',
            'Quality tools and equipment', 
            'Licensed and insured',
            'Satisfaction guarantee'
          ],
        };
        setService(normalizedService);
        setLoading(false);
        return;
      }
    }
    
    // Fallback: try to fetch from API
    if (serviceId) {
      (async () => {
        try {
          console.log('🌐 Fetching service details from API for ID:', serviceId);
          setLoading(true);
          setError(null);
          const res = await servicesAPI.getServiceDetails(serviceId);
          const data = res?.data || res;
          
          const normalizedService = {
            id: data.id || data._id,
            title: data.title || data.name,
            description: data.description || 'Professional service for your home',
            startingPrice: data.startingPrice || data.price || 75,
            rating: data.rating || 4.8,
            featured: !!data.featured,
            availability: typeof data.availability === 'object' ? 'Available' : data.availability || 'Available',
            icon: data.icon || '🧰',
            provider: data.provider || { 
              id: data.providerId, 
              name: data.providerName || 'Professional Provider', 
              rating: data.providerRating || 4.9, 
              reviewCount: data.providerReviewCount || 127 
            },
            services: data.includedServices || data.services || [
              'Professional service delivery',
              'Quality tools and equipment',
              'Licensed and insured', 
              'Satisfaction guarantee'
            ],
          };
          setService(normalizedService);
          console.log('✅ Service details loaded from API:', normalizedService.title);
        } catch (e) {
          console.error('❌ Failed to fetch service details from API:', e);
          setError('Failed to load service details');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      console.error('❌ No serviceId provided to ServiceDetailsScreen');
      setError('No service ID provided');
      setLoading(false);
    }
  }, [serviceId, routeService, services]);

  if (loading || !service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {error ? (
            <Text style={styles.loadingText}>{error}</Text>
          ) : (
            <ActivityIndicator size="large" color={COLORS.primary} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const handleBookService = () => {
    navigation.navigate('BookingForm', { 
      serviceId: service.id,
      service: {
        id: service.id,
        title: service.title,
        name: service.title,
        provider: service.provider,
        startingPrice: service.startingPrice,
        price: service.startingPrice
      }
    });
  };

  const handleProviderPress = () => {
    navigation.navigate('ProviderProfile', { providerId: service.provider.id });
  };

  const handleMessageProvider = () => {
    // Navigate to chat screen (to be implemented)
    console.log('Message provider:', service.provider.name);
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // In a real app, this would sync with backend/storage
    console.log(isFavorited ? 'Removed from favorites' : 'Added to favorites');
  };

  const calculatePrice = () => {
    let basePrice = service.startingPrice;
    let totalPrice = basePrice;
    
    // Add selected options pricing
    Object.entries(selectedOptions).forEach(([key, option]) => {
      if (option.selected && option.price) {
        totalPrice += option.price;
      }
    });
    
    setCalculatedPrice(totalPrice);
  };

  const handleOptionToggle = (optionKey, option) => {
    const newOptions = {
      ...selectedOptions,
      [optionKey]: {
        ...option,
        selected: !selectedOptions[optionKey]?.selected
      }
    };
    setSelectedOptions(newOptions);
    
    // Recalculate price
    let totalPrice = service.startingPrice;
    Object.entries(newOptions).forEach(([key, opt]) => {
      if (opt.selected && opt.price) {
        totalPrice += opt.price;
      }
    });
    setCalculatedPrice(totalPrice);
  };

  useEffect(() => {
    if (service) {
      setCalculatedPrice(service.startingPrice);
    }
  }, [service]);

  const renderImageGallery = () => (
    <View style={styles.imageGalleryContainer}>
      <View style={styles.mainImageContainer}>
        <View style={styles.placeholderImage}>
          <Text style={styles.serviceIcon}>{service.icon}</Text>
        </View>
        
        {/* Availability Badge */}
        <View style={styles.availabilityBadge}>
          <Text style={styles.availabilityText}>
            {typeof service.availability === 'object' ? 'Available' : service.availability || 'Available'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderServiceHeader = () => (
    <View style={styles.serviceHeader}>
      <View style={styles.serviceHeaderTop}>
        <View style={styles.serviceTitleContainer}>
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.price}>${service.startingPrice}</Text>
        </View>
      </View>
      
      <View style={styles.ratingRow}>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingIcon}>⭐</Text>
          <Text style={styles.rating}>{service.rating}</Text>
          <Text style={styles.reviewCount}>({service.provider?.reviewCount || 0} reviews)</Text>
        </View>
        
        {service.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Popular</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderProviderInfo = () => {
    const providerName = service.provider?.name || 'Provider';
    const providerRating = service.provider?.rating || 5;
    const reviewCount = service.provider?.reviewCount || 0;
    
    return (
      <TouchableOpacity style={styles.providerContainer} onPress={handleProviderPress}>
        <View style={styles.providerInfo}>
          <View style={styles.providerAvatar}>
            <Text style={styles.providerAvatarText}>
              {providerName.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{providerName}</Text>
            <View style={styles.providerRating}>
              <Text style={styles.providerRatingIcon}>⭐</Text>
              <Text style={styles.providerRatingText}>{providerRating}</Text>
              <Text style={styles.providerReviewCount}>
                • {reviewCount} reviews
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.messageButton} onPress={handleMessageProvider}>
          <Text style={styles.messageIcon}>💬</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            {(service.services || []).map((item, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.checkIcon}>✅</Text>
                <Text style={styles.serviceItemText}>{item}</Text>
              </View>
            ))}
            {(!service.services || service.services.length === 0) && (
              <View style={styles.serviceItem}>
                <Text style={styles.checkIcon}>ℹ️</Text>
                <Text style={styles.serviceItemText}>Service details will be provided by the provider</Text>
              </View>
            )}
          </View>
        );
      
      case 'pricing':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Service Options & Pricing</Text>
            
            {/* Base Service */}
            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <Text style={styles.pricingTitle}>Base Service</Text>
                <Text style={styles.pricingPrice}>${service.startingPrice}</Text>
              </View>
              <Text style={styles.pricingDescription}>Standard cleaning service with basic tasks</Text>
            </View>
            
            {/* Add-on Options */}
            <Text style={styles.sectionSubtitle}>Add-on Services</Text>
            
            {mockServiceOptions.map((option) => (
              <TouchableOpacity 
                key={option.id} 
                style={[styles.optionCard, selectedOptions[option.id]?.selected && styles.optionCardSelected]}
                onPress={() => handleOptionToggle(option.id, option)}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  <View style={styles.optionRight}>
                    <Text style={styles.optionPrice}>+${option.price}</Text>
                    <View style={[styles.checkbox, selectedOptions[option.id]?.selected && styles.checkboxSelected]}>
                      {selectedOptions[option.id]?.selected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Total Price Summary */}
            <View style={styles.pricingSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Base Service</Text>
                <Text style={styles.summaryValue}>${service.startingPrice}</Text>
              </View>
              {Object.entries(selectedOptions).map(([key, option]) => 
                option.selected && (
                  <View key={key} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{option.title}</Text>
                    <Text style={styles.summaryValue}>+${option.price}</Text>
                  </View>
                )
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>${calculatedPrice}</Text>
              </View>
            </View>
          </View>
        );
      
      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            {mockReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerAvatarText}>
                      {review.customerName.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.customerName}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Text key={i} style={styles.reviewStar}>
                          {i < review.rating ? '⭐' : '☆'}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Text style={styles.reviewText}>{review.comment}</Text>
              </View>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Service Details</Text>
        
        <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
          <Text style={[styles.favoriteIcon, isFavorited && styles.favoriteIconActive]}>
            {isFavorited ? '❤️' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderServiceHeader()}
        {renderProviderInfo()}
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pricing' && styles.activeTab]}
            onPress={() => setActiveTab('pricing')}
          >
            <Text style={[styles.tabText, activeTab === 'pricing' && styles.activeTabText]}>
              Pricing
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews
            </Text>
          </TouchableOpacity>
        </View>
        
        {renderTabContent()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.bottomPriceLabel}>
            {calculatedPrice > service.startingPrice ? 'Total Price' : 'Starting from'}
          </Text>
          <Text style={[styles.bottomPrice, calculatedPrice > service.startingPrice && styles.dynamicPrice]}>
            ${calculatedPrice || service.startingPrice}
          </Text>
        </View>
        
        <CustomButton
          title="Book Now"
          onPress={handleBookService}
          style={styles.bookButton}
        />
      </View>
    </SafeAreaView>
  );
};

// Mock service options data
const mockServiceOptions = [
  {
    id: 'deep-clean',
    title: 'Deep Clean',
    description: 'Thorough deep cleaning including inside appliances, baseboards, and detailed dusting',
    price: 25,
  },
  {
    id: 'eco-products',
    title: 'Eco-Friendly Products',
    description: 'Use only environmentally safe and non-toxic cleaning products',
    price: 10,
  },
  {
    id: 'inside-oven',
    title: 'Inside Oven Cleaning',
    description: 'Deep clean inside of oven, including racks and glass door',
    price: 15,
  },
  {
    id: 'fridge-clean',
    title: 'Inside Refrigerator',
    description: 'Clean inside refrigerator shelves, drawers, and compartments',
    price: 12,
  },
  {
    id: 'window-cleaning',
    title: 'Window Cleaning',
    description: 'Clean interior windows and window sills (up to 10 windows)',
    price: 20,
  },
];

// Mock reviews data
const mockReviews = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    rating: 5,
    date: '2 days ago',
    comment: 'Excellent service! Very professional and thorough cleaning. Will definitely book again.',
  },
  {
    id: '2',
    customerName: 'Mike Chen',
    rating: 4,
    date: '1 week ago',
    comment: 'Good work overall. Arrived on time and did a great job. Minor issue with communication but resolved quickly.',
  },
  {
    id: '3',
    customerName: 'Emily Davis',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Outstanding! Exceeded my expectations. The team was friendly, efficient, and left my home spotless.',
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.xl,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
  },
  favoriteButton: {
    padding: SPACING.sm,
  },
  favoriteIcon: {
    fontSize: FONTS.lg,
    color: COLORS.textMuted,
  },
  favoriteIconActive: {
    color: COLORS.error,
  },
  content: {
    flex: 1,
  },
  
  // Image Gallery
  imageGalleryContainer: {
    height: 250,
    backgroundColor: COLORS.white,
  },
  mainImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    position: 'relative',
  },
  placeholderImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  serviceIcon: {
    fontSize: 50,
  },
  availabilityBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  availabilityText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  
  // Service Header
  serviceHeader: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  serviceHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  serviceTitleContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  serviceTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  serviceDescription: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: FONTS.md,
    marginRight: SPACING.xs,
  },
  rating: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  reviewCount: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  featuredBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  featuredBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  
  // Provider Info
  providerContainer: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  providerAvatarText: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerRatingIcon: {
    fontSize: FONTS.sm,
    marginRight: SPACING.xs,
  },
  providerRatingText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
  },
  providerReviewCount: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  messageButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary + '20',
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageIcon: {
    fontSize: FONTS.md,
  },
  
  // Tabs
  tabsContainer: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: FONTS.weightSemiBold,
  },
  
  // Tab Content
  tabContent: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  checkIcon: {
    fontSize: FONTS.md,
    marginRight: SPACING.sm,
  },
  serviceItemText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  
  // Reviews
  reviewCard: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  reviewerAvatarText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewStar: {
    fontSize: FONTS.sm,
    color: COLORS.warning,
    marginRight: 2,
  },
  reviewDate: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  reviewText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  
  // Bottom Bar
  bottomBar: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  priceInfo: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  bottomPrice: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  bookButton: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  
  bottomSpacing: {
    height: SPACING.xl,
  },
  
  // Pricing Styles
  sectionSubtitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  pricingCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pricingTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  pricingPrice: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  pricingDescription: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  optionCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  optionInfo: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  optionTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  optionRight: {
    alignItems: 'flex-end',
  },
  optionPrice: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  pricingSummary: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weightMedium,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  summaryTotalLabel: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  summaryTotalValue: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  dynamicPrice: {
    color: COLORS.success,
  },
});

export default ServiceDetailsScreen;
