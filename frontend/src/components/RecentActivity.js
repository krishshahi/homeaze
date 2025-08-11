import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const RecentActivity = ({ activities, loading, onActivityPress }) => {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now - activityTime;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  };

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => onActivityPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.activityIcon}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityTime}>{formatTimeAgo(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLoadingItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, styles.loadingIcon]} />
      <View style={styles.activityContent}>
        <View style={[styles.loadingPlaceholder, styles.loadingTitle]} />
        <View style={[styles.loadingPlaceholder, styles.loadingDescription]} />
        <View style={[styles.loadingPlaceholder, styles.loadingTime]} />
      </View>
    </View>
  );

  if (loading) {
    const loadingData = Array.from({ length: 3 }, (_, index) => ({ id: index }));
    
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activitiesContainer}>
          <FlatList
            data={loadingData}
            renderItem={renderLoadingItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </View>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No recent activity</Text>
          <Text style={styles.emptySubtext}>Your activity will appear here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activitiesContainer}>
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  activitiesContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  activityItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconText: {
    fontSize: FONTS.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs / 2,
  },
  activityDescription: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
  },
  activityTime: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingIcon: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingPlaceholder: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
  },
  loadingTitle: {
    width: '60%',
    height: 14,
    marginBottom: SPACING.xs / 2,
  },
  loadingDescription: {
    width: '80%',
    height: 12,
    marginBottom: SPACING.xs / 2,
  },
  loadingTime: {
    width: '30%',
    height: 10,
  },
});

export default RecentActivity;
