import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAppDispatch, useAuth } from '../store/hooks';

const EnhancedReviewsScreen = ({ route, navigation }) => {
  const { providerId, serviceName } = route.params || {};
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    serviceQuality: 5,
    communication: 5,
    timeliness: 5,
    value: 5,
  });

  const [filterByRating, setFilterByRating] = useState(0); // 0 means all ratings
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, rating

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setReviews(mockReviews);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error loading reviews:', error);
      setReviews(mockReviews);
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim() || !reviewForm.title.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const newReview = {
        id: Date.now().toString(),
        customerName: user?.name || 'Anonymous User',
        customerInitials: user?.name?.split(' ').map(n => n[0]).join('') || 'AU',
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        serviceQuality: reviewForm.serviceQuality,
        communication: reviewForm.communication,
        timeliness: reviewForm.timeliness,
        value: reviewForm.value,
        createdAt: new Date().toISOString(),
        verified: true,
        helpful: 0,
        photos: [], // In real app, would handle photo uploads
      };

      setReviews(prev => [newReview, ...prev]);
      setShowWriteReview(false);
      setReviewForm({
        rating: 5,
        title: '',
        comment: '',
        serviceQuality: 5,
        communication: 5,
        timeliness: 5,
        value: 5,
      });
      
      Alert.alert('Success', 'Your review has been submitted!');

    } catch (error) {
      console.error('❌ Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const calculateAverageRatings = () => {
    if (reviews.length === 0) return { overall: 0, breakdown: {} };

    const totals = reviews.reduce((acc, review) => ({
      overall: acc.overall + review.rating,
      serviceQuality: acc.serviceQuality + (review.serviceQuality || review.rating),
      communication: acc.communication + (review.communication || review.rating),
      timeliness: acc.timeliness + (review.timeliness || review.rating),
      value: acc.value + (review.value || review.rating),
    }), {
      overall: 0,
      serviceQuality: 0,
      communication: 0,
      timeliness: 0,
      value: 0,
    });

    const count = reviews.length;
    return {
      overall: (totals.overall / count).toFixed(1),
      breakdown: {
        serviceQuality: (totals.serviceQuality / count).toFixed(1),
        communication: (totals.communication / count).toFixed(1),
        timeliness: (totals.timeliness / count).toFixed(1),
        value: (totals.value / count).toFixed(1),
      }
    };
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

  const getFilteredReviews = () => {
    let filtered = [...reviews];

    if (filterByRating > 0) {
      filtered = filtered.filter(review => review.rating === filterByRating);
    }

    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  };

  const renderStars = (rating, size = 16, onPress = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Text style={[styles.star, { fontSize: size }]}>
              {star <= rating ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRatingSummary = () => {
    const averages = calculateAverageRatings();
    const distribution = getRatingDistribution();
    const totalReviews = reviews.length;

    return (
      <View style={styles.ratingSummary}>
        <View style={styles.overallRating}>
          <Text style={styles.overallRatingNumber}>{averages.overall}</Text>
          {renderStars(Math.round(averages.overall), 20)}
          <Text style={styles.totalReviewsText}>{totalReviews} reviews</Text>
        </View>

        <View style={styles.ratingBreakdown}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <TouchableOpacity 
              key={rating}
              style={styles.ratingRow}
              onPress={() => setFilterByRating(filterByRating === rating ? 0 : rating)}
            >
              <Text style={styles.ratingLabel}>{rating}★</Text>
              <View style={styles.ratingBar}>
                <View 
                  style={[
                    styles.ratingBarFill,
                    { 
                      width: `${totalReviews > 0 ? (distribution[rating] / totalReviews) * 100 : 0}%`,
                      backgroundColor: filterByRating === rating ? COLORS.primary : COLORS.warning 
                    }
                  ]}
                />
              </View>
              <Text style={styles.ratingCount}>{distribution[rating]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderDetailedBreakdown = () => {
    const averages = calculateAverageRatings();
    
    return (
      <View style={styles.detailedBreakdown}>
        <Text style={styles.sectionTitle}>⭐ Rating Breakdown</Text>
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Service Quality</Text>
            {renderStars(Math.round(averages.breakdown.serviceQuality))}
            <Text style={styles.breakdownValue}>{averages.breakdown.serviceQuality}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Communication</Text>
            {renderStars(Math.round(averages.breakdown.communication))}
            <Text style={styles.breakdownValue}>{averages.breakdown.communication}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Timeliness</Text>
            {renderStars(Math.round(averages.breakdown.timeliness))}
            <Text style={styles.breakdownValue}>{averages.breakdown.timeliness}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Value for Money</Text>
            {renderStars(Math.round(averages.breakdown.value))}
            <Text style={styles.breakdownValue}>{averages.breakdown.value}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'newest' && styles.sortButtonActive]}
          onPress={() => setSortBy('newest')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'newest' && styles.sortButtonTextActive]}>
            Newest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
          onPress={() => setSortBy('rating')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.sortButtonTextActive]}>
            Highest Rated
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'oldest' && styles.sortButtonActive]}
          onPress={() => setSortBy('oldest')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'oldest' && styles.sortButtonTextActive]}>
            Oldest
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderReviewCard = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitials}>{item.customerInitials}</Text>
          </View>
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>{item.customerName}</Text>
            <View style={styles.reviewMeta}>
              {renderStars(item.rating, 14)}
              <Text style={styles.reviewDate}>
                • {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              {item.verified && (
                <Text style={styles.verifiedBadge}>✓ Verified</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      {item.title && (
        <Text style={styles.reviewTitle}>{item.title}</Text>
      )}

      <Text style={styles.reviewComment}>{item.comment}</Text>

      {item.photos && item.photos.length > 0 && (
        <ScrollView horizontal style={styles.photosContainer}>
          {item.photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.reviewPhoto} />
          ))}
        </ScrollView>
      )}

      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <Text style={styles.helpfulButtonText}>👍 Helpful ({item.helpful || 0})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>⚠️ Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWriteReviewModal = () => (
    <Modal
      visible={showWriteReview}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowWriteReview(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Write Review</Text>
          <TouchableOpacity onPress={submitReview}>
            <Text style={styles.modalSubmitText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Overall Rating</Text>
            {renderStars(reviewForm.rating, 30, (rating) => 
              setReviewForm(prev => ({ ...prev, rating }))
            )}
          </View>

          <View style={styles.detailedRatingSection}>
            <Text style={styles.sectionTitle}>Detailed Ratings</Text>
            
            {[
              { key: 'serviceQuality', label: 'Service Quality' },
              { key: 'communication', label: 'Communication' },
              { key: 'timeliness', label: 'Timeliness' },
              { key: 'value', label: 'Value for Money' },
            ].map(({ key, label }) => (
              <View key={key} style={styles.detailedRatingRow}>
                <Text style={styles.detailedRatingLabel}>{label}</Text>
                {renderStars(reviewForm[key], 20, (rating) => 
                  setReviewForm(prev => ({ ...prev, [key]: rating }))
                )}
              </View>
            ))}
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Review Title</Text>
            <TextInput
              style={styles.titleInput}
              value={reviewForm.title}
              onChangeText={(title) => setReviewForm(prev => ({ ...prev, title }))}
              placeholder="Summarize your experience..."
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Your Review</Text>
            <TextInput
              style={styles.commentInput}
              value={reviewForm.comment}
              onChangeText={(comment) => setReviewForm(prev => ({ ...prev, comment }))}
              placeholder="Tell others about your experience..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={6}
            />
          </View>

          <TouchableOpacity style={styles.addPhotosButton}>
            <Text style={styles.addPhotosButtonText}>📷 Add Photos (Optional)</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const filteredReviews = getFilteredReviews();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <TouchableOpacity 
          style={styles.writeReviewButton}
          onPress={() => setShowWriteReview(true)}
        >
          <Text style={styles.writeReviewButtonText}>✏️ Write</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Rating Summary */}
        {renderRatingSummary()}

        {/* Detailed Breakdown */}
        {renderDetailedBreakdown()}

        {/* Filters */}
        {renderFilters()}

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>
            💬 Reviews ({filteredReviews.length})
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : filteredReviews.length > 0 ? (
            <FlatList
              data={filteredReviews}
              renderItem={renderReviewCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📝</Text>
              <Text style={styles.emptyStateTitle}>No reviews yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Be the first to leave a review!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {renderWriteReviewModal()}
    </SafeAreaView>
  );
};

// Mock reviews data
const mockReviews = [
  {
    id: '1',
    customerName: 'Mike Chen',
    customerInitials: 'MC',
    rating: 5,
    title: 'Exceptional service!',
    comment: 'Sarah did an amazing job cleaning our house. She was professional, punctual, and very thorough. The house looked spotless when she finished. Would definitely recommend!',
    serviceQuality: 5,
    communication: 5,
    timeliness: 5,
    value: 4,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    helpful: 5,
    photos: [],
  },
  {
    id: '2',
    customerName: 'Emily Davis',
    customerInitials: 'ED',
    rating: 4,
    title: 'Great job overall',
    comment: 'Very satisfied with the cleaning service. She was on time and did a thorough job. Only minor issue was that she forgot to clean the mirrors in one bathroom, but everything else was perfect.',
    serviceQuality: 4,
    communication: 5,
    timeliness: 5,
    value: 4,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    helpful: 2,
    photos: [],
  },
  {
    id: '3',
    customerName: 'David Wilson',
    customerInitials: 'DW',
    rating: 5,
    title: 'Highly professional',
    comment: 'Outstanding work! Sarah was very communicative, arrived exactly on time, and exceeded our expectations. The kitchen and bathrooms have never looked better. Will definitely book again.',
    serviceQuality: 5,
    communication: 5,
    timeliness: 5,
    value: 5,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
    helpful: 8,
    photos: [],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  writeReviewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  writeReviewButtonText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },

  // Content
  scrollContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Rating Summary
  ratingSummary: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  overallRating: {
    flex: 1,
    alignItems: 'center',
    paddingRight: SPACING.lg,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  overallRatingNumber: {
    fontSize: 48,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  totalReviewsText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  ratingBreakdown: {
    flex: 1,
    paddingLeft: SPACING.lg,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    width: 30,
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
  },
  ratingCount: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    width: 20,
    textAlign: 'right',
  },

  // Stars
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    color: COLORS.warning,
    marginRight: 2,
  },

  // Detailed Breakdown
  detailedBreakdown: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  breakdownItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  breakdownLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  breakdownValue: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },

  // Filters
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sortButton: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weightMedium,
  },
  sortButtonTextActive: {
    color: COLORS.white,
  },

  // Reviews
  reviewsSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
  },
  reviewCard: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reviewHeader: {
    marginBottom: SPACING.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  reviewerInitials: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  verifiedBadge: {
    fontSize: FONTS.xs,
    color: COLORS.success,
    marginLeft: SPACING.sm,
    fontWeight: FONTS.weightBold,
  },
  reviewTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  reviewComment: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  photosContainer: {
    marginBottom: SPACING.sm,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helpfulButton: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  helpfulButtonText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  reportButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  reportButtonText: {
    fontSize: FONTS.sm,
    color: COLORS.error,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalCancelText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  modalTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  modalSubmitText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  detailedRatingSection: {
    marginBottom: SPACING.xl,
  },
  detailedRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailedRatingLabel: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  titleInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
  },
  commentInput: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  addPhotosButton: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  addPhotosButtonText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },

  // Loading & Empty States
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default EnhancedReviewsScreen;
