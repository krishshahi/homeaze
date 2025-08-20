import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

import RatingStars from './RatingStars';

const ReviewCard = ({ review }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.reviewerName}>{review.customerId?.name}</Text>
        <RatingStars rating={review.rating.overall} size={18} showRatingText={false} />
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
      <View style={styles.footer}>
        <Text style={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.helpfulness}>Helpfulness: {review.helpfulnessScore}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  reviewerName: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },
  comment: {
    fontSize: FONTS.body1,
    color: COLORS.textSecondary,
    lineHeight: FONTS.body1 * FONTS.lineHeightNormal,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  helpfulness: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
});

export default ReviewCard;
