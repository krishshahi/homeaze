import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const UpcomingServices = ({ services, loading, onServicePress }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    // Check if it's this week
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7 && diffDays > 0) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => onServicePress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.serviceIcon}>
        <Text style={styles.iconText}>{item.serviceIcon}</Text>
      </View>
      <View style={styles.serviceContent}>
        <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>
        <Text style={styles.providerName}>{item.providerName}</Text>
        <View style={styles.serviceDetails}>
          <Text style={styles.serviceDate}>{formatDate(item.scheduledDate)}</Text>
          <Text style={styles.serviceTime}>{item.scheduledTime}</Text>
        </View>
      </View>
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLoadingItem = ({ item }) => (
    <View style={styles.serviceItem}>
      <View style={[styles.serviceIcon, styles.loadingIcon]} />
      <View style={styles.serviceContent}>
        <View style={[styles.loadingPlaceholder, styles.loadingTitle]} />
        <View style={[styles.loadingPlaceholder, styles.loadingProvider]} />
        <View style={styles.serviceDetails}>
          <View style={[styles.loadingPlaceholder, styles.loadingDate]} />
          <View style={[styles.loadingPlaceholder, styles.loadingTime]} />
        </View>
      </View>
    </View>
  );

  if (loading) {
    const loadingData = Array.from({ length: 2 }, (_, index) => ({ id: index }));
    
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Upcoming Services</Text>
        <View style={styles.servicesContainer}>
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

  if (!services || services.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Upcoming Services</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>No upcoming services</Text>
          <Text style={styles.emptySubtext}>Book a service to see it here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Services</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.servicesContainer}>
        <FlatList
          data={services.slice(0, 3)} // Show only first 3 items
          renderItem={renderServiceItem}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
  },
  servicesContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.light,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconText: {
    fontSize: FONTS.lg,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs / 2,
  },
  providerName: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDate: {
    fontSize: FONTS.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weightMedium,
    marginRight: SPACING.sm,
  },
  serviceTime: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  chevron: {
    marginLeft: SPACING.sm,
  },
  chevronText: {
    fontSize: FONTS.lg,
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
    width: '70%',
    height: 14,
    marginBottom: SPACING.xs / 2,
  },
  loadingProvider: {
    width: '50%',
    height: 12,
    marginBottom: SPACING.xs,
  },
  loadingDate: {
    width: 50,
    height: 10,
    marginRight: SPACING.sm,
  },
  loadingTime: {
    width: 40,
    height: 10,
  },
});

export default UpcomingServices;
