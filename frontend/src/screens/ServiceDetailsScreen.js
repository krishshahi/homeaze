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

  useEffect(() => {
    if (service) return; // already set from route
    if (!serviceId) return;
    const foundService = services.find((s) => (s.id || s._id) === serviceId);
    if (foundService) {
      setService(foundService);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await servicesAPI.getServiceDetails(serviceId);
        const data = res?.data || res;
        setService({
          id: data.id || data._id,
          title: data.title || data.name,
          description: data.description || '',
          startingPrice: data.startingPrice || data.price || 0,
          rating: data.rating || 5,
          featured: !!data.featured,
          availability: typeof data.availability === 'object' ? 'Available' : data.availability || 'Available',
          icon: data.icon || '🧰',
          provider: data.provider || { id: data.providerId, name: data.providerName || 'Provider', rating: data.providerRating || 5, reviewCount: data.providerReviewCount || 0 },
          services: data.includedServices || data.services || [],
        });
      } catch (e) {
        console.error('Failed to fetch service details', e);
        setError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    })();
  }, [serviceId, services, service]);

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
        
        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favoriteIcon}>♡</Text>
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
          <Text style={styles.bottomPriceLabel}>Starting from</Text>
          <Text style={styles.bottomPrice}>${service.startingPrice}</Text>
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
});

export default ServiceDetailsScreen;
