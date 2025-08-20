import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { RATING_CRITERIA } from '../../constants/provider';

const ProviderReviews = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const mockData = {
    summary: {
      overall: 4.8,
      total: 245,
      criteria: {
        quality: 4.9,
        punctuality: 4.7,
        professionalism: 4.8,
        value: 4.6,
        cleanliness: 4.9,
      },
      distribution: {
        5: 180,
        4: 45,
        3: 15,
        2: 3,
        1: 2,
      },
    },
    reviews: [
      {
        id: '1',
        customer: {
          name: 'John Smith',
          image: null,
        },
        rating: 5,
        criteria: {
          quality: 5,
          punctuality: 5,
          professionalism: 5,
          value: 5,
          cleanliness: 5,
        },
        comment:
          'Excellent service! Very thorough and professional. The team arrived on time and did an amazing job. Would definitely recommend!',
        date: '2024-02-15',
        service: 'Deep Cleaning',
        response: null,
      },
      {
        id: '2',
        customer: {
          name: 'Sarah Wilson',
          image: null,
        },
        rating: 4,
        criteria: {
          quality: 4,
          punctuality: 4,
          professionalism: 5,
          value: 4,
          cleanliness: 4,
        },
        comment:
          'Great service overall. Very professional team. Only minor issue was they were a bit late, but they called ahead to inform.',
        date: '2024-02-10',
        service: 'Regular Cleaning',
        response: {
          text: 'Thank you for your feedback! We apologize for the delay and appreciate your understanding. We\'re always working to improve our service.',
          date: '2024-02-11',
        },
      },
    ],
  };

  const renderStars = (rating, size = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="star"
            size={size}
            color={star <= rating ? '#FFC107' : '#EEEEEE'}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const renderRatingBar = (count, total, rating) => {
    const percentage = (count / total) * 100;
    return (
      <View style={styles.ratingBar}>
        <Text style={styles.ratingNumber}>{rating}</Text>
        <View style={styles.barContainer}>
          <View
            style={[styles.barFill, { width: `${percentage}%` }]}
          />
        </View>
        <Text style={styles.ratingCount}>{count}</Text>
      </View>
    );
  };

  const renderCriteriaRating = (criterion, rating) => (
    <View key={criterion} style={styles.criteriaItem}>
      <Text style={styles.criteriaLabel}>{RATING_CRITERIA[criterion]}</Text>
      <View style={styles.criteriaRating}>
        {renderStars(rating, 14)}
        <Text style={styles.criteriaValue}>{rating.toFixed(1)}</Text>
      </View>
    </View>
  );

  const renderReview = (review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            <Icon name="user" size={24} color="#666" />
          </View>
          <View>
            <Text style={styles.reviewerName}>{review.customer.name}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceText}>{review.service}</Text>
        </View>
      </View>

      <View style={styles.ratingSection}>
        {renderStars(review.rating)}
        <View style={styles.criteriaGrid}>
          {Object.entries(review.criteria).map(([criterion, rating]) =>
            renderCriteriaRating(criterion, rating)
          )}
        </View>
      </View>

      <Text style={styles.reviewComment}>{review.comment}</Text>

      {review.response && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <Icon name="corner-up-left" size={16} color="#2196F3" />
            <Text style={styles.responseTitle}>Your Response</Text>
            <Text style={styles.responseDate}>{review.response.date}</Text>
          </View>
          <Text style={styles.responseText}>{review.response.text}</Text>
        </View>
      )}

      {!review.response && (
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() =>
            navigation.navigate('ReviewResponse', { reviewId: review.id })
          }
        >
          <Icon name="message-circle" size={16} color="#2196F3" />
          <Text style={styles.replyButtonText}>Reply to Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFilterButton = (filter, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Reviews & Ratings</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('ReviewSettings')}
        >
          <Icon name="settings" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summarySection}>
          <View style={styles.overallRating}>
            <Text style={styles.ratingNumber}>
              {mockData.summary.overall.toFixed(1)}
            </Text>
            {renderStars(mockData.summary.overall, 24)}
            <Text style={styles.totalReviews}>
              {mockData.summary.total} reviews
            </Text>
          </View>

          <View style={styles.ratingDistribution}>
            {Object.entries(mockData.summary.distribution)
              .reverse()
              .map(([rating, count]) =>
                renderRatingBar(count, mockData.summary.total, rating)
              )}
          </View>
        </View>

        <View style={styles.criteriaSection}>
          <Text style={styles.sectionTitle}>Rating Breakdown</Text>
          <View style={styles.criteriaGrid}>
            {Object.entries(mockData.summary.criteria).map(([criterion, rating]) =>
              renderCriteriaRating(criterion, rating)
            )}
          </View>
        </View>

        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <View style={styles.filters}>
              {renderFilterButton('all', 'All')}
              {renderFilterButton('recent', 'Recent')}
              {renderFilterButton('positive', '5 Star')}
              {renderFilterButton('critical', 'Critical')}
            </View>
          </View>

          {mockData.reviews.map(renderReview)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
  },
  ratingDistribution: {
    marginTop: 16,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
    minWidth: 30,
    textAlign: 'right',
  },
  criteriaSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  criteriaItem: {
    width: '50%',
    padding: 8,
  },
  criteriaLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  criteriaRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criteriaValue: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  reviewsHeader: {
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    marginTop: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reviewCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  serviceInfo: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  serviceText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  ratingSection: {
    marginBottom: 12,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  responseContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 8,
  },
  responseDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  responseText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  replyButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default ProviderReviews;
