import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const RatingStars = ({
  rating = 0,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRatingChange,
  showRatingText = false,
  style,
}) => {
  const handleStarPress = (selectedRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const renderStar = (position) => {
    const isFilled = position <= rating;
    const isHalfFilled = position - 0.5 <= rating && position > rating;
    
    let starIcon = '☆'; // Empty star
    if (isFilled) {
      starIcon = '⭐'; // Filled star
    } else if (isHalfFilled) {
      starIcon = '⭐'; // Half star (you could use a different icon)
    }

    if (interactive) {
      return (
        <TouchableOpacity
          key={position}
          onPress={() => handleStarPress(position)}
          style={styles.starButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.star, { fontSize: size }]}>
            {starIcon}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <Text key={position} style={[styles.star, { fontSize: size }]}>
        {starIcon}
      </Text>
    );
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(renderStar(i));
    }
    return stars;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {showRatingText && (
        <Text style={styles.ratingText}>
          {rating.toFixed(1)} / {maxRating}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
    color: '#FFD700', // Gold color for stars
  },
  starButton: {
    padding: 2,
  },
  ratingText: {
    marginLeft: SPACING.sm,
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weightMedium,
  },
});

export default RatingStars;
