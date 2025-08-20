import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const DashboardStats = ({ stats, loading, onStatPress }) => {
  const statItems = [
    {
      key: 'totalBookings',
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: '📅',
      color: COLORS.primary,
    },
    {
      key: 'completedServices',
      label: 'Completed',
      value: stats.completedServices,
      icon: '✅',
      color: COLORS.success,
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      value: `$${stats.totalSpent?.toFixed(2) || '0.00'}`,
      icon: '💰',
      color: COLORS.warning,
    },
    {
      key: 'savedAmount',
      label: 'Saved',
      value: `$${stats.savedAmount?.toFixed(2) || '0.00'}`,
      icon: '💎',
      color: COLORS.info,
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        {statItems.map((item) => (
          <View key={item.key} style={[styles.statCard, styles.loadingCard]}>
            <View style={styles.loadingPlaceholder} />
            <View style={[styles.loadingPlaceholder, styles.loadingText]} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {statItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.statCard}
          onPress={() => onStatPress?.(item.key)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  loadingCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  icon: {
    fontSize: FONTS.lg,
  },
  statValue: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  loadingText: {
    width: 60,
    height: 12,
    borderRadius: BORDER_RADIUS.sm,
  },
});

export default DashboardStats;
