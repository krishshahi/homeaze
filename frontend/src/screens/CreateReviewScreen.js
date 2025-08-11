import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import {
  createReview,
  selectReviewLoading,
  selectReviewError,
  selectReviewSuccessMessage,
  clearReviewError,
  clearSuccessMessage,
} from '../store/slices/reviewSlice';
import { selectAuthToken } from '../store/slices/authSlice';
import CustomButton from '../components/CustomButton';
import RatingStars from '../components/RatingStars';

const CreateReviewScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { bookingId, providerId, serviceId } = route.params;
  
  const loading = useSelector(selectReviewLoading);
  const error = useSelector(selectReviewError);
  const successMessage = useSelector(selectReviewSuccessMessage);
  const authToken = useSelector(selectAuthToken);

  const [ratings, setRatings] = useState({
    overall: 0,
    quality: 0,
    punctuality: 0,
    professionalism: 0,
    value: 0,
  });
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (error.creating) {
      Alert.alert('Error', error.creating);
      dispatch(clearReviewError('creating'));
    }
  }, [error.creating]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            dispatch(clearSuccessMessage());
            navigation.goBack();
          },
        },
      ]);
    }
  }, [successMessage]);

  const handleRatingChange = (aspect, rating) => {
    setRatings(prev => ({
      ...prev,
      [aspect]: rating,
    }));
  };

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      Alert.alert('Error', 'Please provide at least an overall rating');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Error', 'Please write a comment of at least 10 characters');
      return;
    }

    const reviewData = {
      bookingId,
      providerId,
      serviceId,
      rating: ratings,
      comment: comment.trim(),
    };

    try {
      await dispatch(createReview({ reviewData, token: authToken })).unwrap();
    } catch (err) {
      console.error('Failed to create review:', err);
    }
  };

  const renderRatingSection = (title, aspect, description) => (
    <View style={styles.ratingSection}>
      <Text style={styles.ratingTitle}>{title}</Text>
      <Text style={styles.ratingDescription}>{description}</Text>
      <RatingStars
        rating={ratings[aspect]}
        interactive={true}
        onRatingChange={(rating) => handleRatingChange(aspect, rating)}
        size={24}
        style={styles.ratingStars}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Write a Review</Text>
          <Text style={styles.subtitle}>
            Share your experience to help others make informed decisions
          </Text>
        </View>

        <View style={styles.content}>
          {renderRatingSection(
            'Overall Rating',
            'overall',
            'How would you rate your overall experience?'
          )}

          {renderRatingSection(
            'Quality of Service',
            'quality',
            'How was the quality of work provided?'
          )}

          {renderRatingSection(
            'Punctuality',
            'punctuality',
            'Did they arrive on time?'
          )}

          {renderRatingSection(
            'Professionalism',
            'professionalism',
            'How professional was their conduct?'
          )}

          {renderRatingSection(
            'Value for Money',
            'value',
            'Was the service worth the price paid?'
          )}

          <View style={styles.commentSection}>
            <Text style={styles.commentTitle}>Your Review</Text>
            <Text style={styles.commentDescription}>
              Tell others about your experience (minimum 10 characters)
            </Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={6}
              placeholder="Write your detailed review here..."
              placeholderTextColor={COLORS.textMuted}
              value={comment}
              onChangeText={setComment}
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {comment.length}/1000 characters
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title={loading.creating ? 'Submitting...' : 'Submit Review'}
          onPress={handleSubmit}
          disabled={loading.creating || ratings.overall === 0}
          style={styles.submitButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.md * 1.4,
  },
  content: {
    padding: SPACING.lg,
  },
  ratingSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  ratingTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  ratingDescription: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  ratingStars: {
    justifyContent: 'center',
  },
  commentSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  commentTitle: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  commentDescription: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    minHeight: 120,
    backgroundColor: COLORS.backgroundTertiary,
  },
  characterCount: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    marginTop: 0,
  },
});

export default CreateReviewScreen;
