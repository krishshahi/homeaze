import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Animated,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT, ANIMATIONS } from '../constants/theme';
import * as bookingsApi from '../services/bookingsApi';
import { useAppDispatch, useBookings, useAuth } from '../store/hooks';
import { fetchUserBookings, updateBooking, cancelBooking } from '../store/slices/bookingSlice';

const EnhancedBookingsScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { bookings, loading } = useBookings();
  const { user } = useAuth();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State
  const [selectedTab, setSelectedTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showActions, setShowActions] = useState(false);

  // Enhanced tabs with better descriptions
  const tabs = [
    { 
      key: 'all', 
      label: 'All', 
      icon: 'list-outline',
      count: bookings.length,
      color: COLORS.primary 
    },
    { 
      key: 'upcoming', 
      label: 'Upcoming', 
      icon: 'time-outline',
      count: bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length,
      color: COLORS.info 
    },
    { 
      key: 'active', 
      label: 'Active', 
      icon: 'flash-outline',
      count: bookings.filter(b => b.status === 'in-progress').length,
      color: COLORS.warning 
    },
    { 
      key: 'completed', 
      label: 'Completed', 
      icon: 'checkmark-circle-outline',
      count: bookings.filter(b => b.status === 'completed').length,
      color: COLORS.success 
    },
    { 
      key: 'cancelled', 
      label: 'Cancelled', 
      icon: 'close-circle-outline',
      count: bookings.filter(b => b.status === 'cancelled').length,
      color: COLORS.error 
    },
  ];

  useEffect(() => {
    loadBookings();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.timing.normal,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadBookings = async () => {
    try {
      console.log('📅 Loading bookings...');
      await dispatch(fetchUserBookings());
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleTabPress = (tabKey) => {
    setSelectedTab(tabKey);
    // Animate tab change
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.7, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleBookingPress = (booking) => {
    navigation.navigate('BookingDetails', { 
      bookingId: booking.id,
      booking: booking 
    });
  };

  const handleBookingAction = (booking) => {
    setSelectedBooking(booking);
    setShowActions(true);
  };

  const getFilteredBookings = () => {
    let filtered = [...bookings];

    // Filter by tab
    if (selectedTab !== 'all') {
      if (selectedTab === 'upcoming') {
        filtered = filtered.filter(b => ['pending', 'confirmed'].includes(b.status));
      } else if (selectedTab === 'active') {
        filtered = filtered.filter(b => b.status === 'in-progress');
      } else {
        filtered = filtered.filter(b => b.status === selectedTab);
      }
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.providerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort bookings
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.scheduledDate) - new Date(a.createdAt || a.scheduledDate);
        case 'oldest':
          return new Date(a.createdAt || a.scheduledDate) - new Date(b.createdAt || b.scheduledDate);
        case 'date':
          return new Date(a.scheduledDate) - new Date(b.scheduledDate);
        case 'price':
          return (b.totalCost || 0) - (a.totalCost || 0);
        default:
          return 0;
      }
    });
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      'pending': { 
        color: COLORS.warning, 
        icon: 'time-outline', 
        label: 'Pending',
        description: 'Waiting for provider confirmation'
      },
      'confirmed': { 
        color: COLORS.info, 
        icon: 'checkmark-outline', 
        label: 'Confirmed',
        description: 'Service confirmed and scheduled'
      },
      'in-progress': { 
        color: COLORS.primary, 
        icon: 'flash-outline', 
        label: 'In Progress',
        description: 'Service is currently active'
      },
      'completed': { 
        color: COLORS.success, 
        icon: 'checkmark-circle-outline', 
        label: 'Completed',
        description: 'Service completed successfully'
      },
      'cancelled': { 
        color: COLORS.error, 
        icon: 'close-circle-outline', 
        label: 'Cancelled',
        description: 'Booking was cancelled'
      },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const BookingCard = ({ booking, index }) => {
    const statusInfo = getStatusInfo(booking.status);
    
    return (
      <Animated.View
        style={[
          styles.bookingCard,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 20 + index * 5],
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleBookingPress(booking)}
          activeOpacity={0.7}
        >
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceIcon}>{booking.serviceIcon || '🏠'}</Text>
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceTitle}>{booking.serviceTitle}</Text>
                <Text style={styles.providerName}>by {booking.providerName}</Text>
              </View>
            </View>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.moreButton}
                onPress={() => handleBookingAction(booking)}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>{formatDate(booking.scheduledDate)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>{booking.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.priceText}>${booking.totalCost}</Text>
            </View>
          </View>

          {/* Card Actions */}
          {booking.status === 'pending' && (
            <View style={styles.cardActions}>
              <CustomButton
                title="Cancel"
                variant="outline"
                size="small"
                style={styles.actionButton}
                onPress={() => handleCancelBooking(booking)}
              />
              <CustomButton
                title="Reschedule"
                variant="secondary"
                size="small"
                style={styles.actionButton}
                onPress={() => handleRescheduleBooking(booking)}
              />
            </View>
          )}

          {booking.status === 'completed' && !booking.hasReview && (
            <View style={styles.cardActions}>
              <CustomButton
                title="Leave Review"
                variant="primary"
                size="small"
                style={styles.reviewButton}
                onPress={() => handleLeaveReview(booking)}
                icon={<Ionicons name="star-outline" size={16} color={COLORS.white} />}
              />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleCancelBooking = (booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel "${booking.serviceTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelBooking(booking.id));
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const handleRescheduleBooking = (booking) => {
    navigation.navigate('RescheduleBooking', { bookingId: booking.id });
  };

  const handleLeaveReview = (booking) => {
    navigation.navigate('LeaveReview', { bookingId: booking.id });
  };

  const FilterModal = () => (
    <Modal visible={showFilters} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort & Filter</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            {[
              { key: 'newest', label: '📅 Newest First' },
              { key: 'oldest', label: '📅 Oldest First' },
              { key: 'date', label: '⏰ By Date' },
              { key: 'price', label: '💰 By Price' },
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  sortBy === option.key && styles.selectedFilterOption
                ]}
                onPress={() => setSortBy(option.key)}
              >
                <Text style={[
                  styles.filterOptionText,
                  sortBy === option.key && styles.selectedFilterOptionText
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <CustomButton
            title="Apply"
            variant="primary"
            onPress={() => setShowFilters(false)}
            style={styles.applyButton}
          />
        </View>
      </View>
    </Modal>
  );

  const ActionsModal = () => (
    <Modal visible={showActions} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.actionsModal}>
          <Text style={styles.actionsTitle}>Booking Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionOption}
            onPress={() => {
              setShowActions(false);
              handleBookingPress(selectedBooking);
            }}
          >
            <Ionicons name="eye-outline" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>View Details</Text>
          </TouchableOpacity>

          {selectedBooking?.status === 'pending' && (
            <>
              <TouchableOpacity 
                style={styles.actionOption}
                onPress={() => {
                  setShowActions(false);
                  handleRescheduleBooking(selectedBooking);
                }}
              >
                <Ionicons name="calendar-outline" size={24} color={COLORS.info} />
                <Text style={styles.actionText}>Reschedule</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionOption}
                onPress={() => {
                  setShowActions(false);
                  handleCancelBooking(selectedBooking);
                }}
              >
                <Ionicons name="close-circle-outline" size={24} color={COLORS.error} />
                <Text style={styles.actionText}>Cancel Booking</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            style={styles.cancelAction}
            onPress={() => setShowActions(false)}
          >
            <Text style={styles.cancelActionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const filteredBookings = getFilteredBookings();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Enhanced Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <LinearGradient
          colors={COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>My Bookings</Text>
              <Text style={styles.headerSubtitle}>
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="funnel-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <CustomInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search bookings..."
              variant="filled"
              leftIcon={<Ionicons name="search" size={20} color={COLORS.textSecondary} />}
              rightIcon={searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ) : null}
              style={styles.searchInput}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Enhanced Tabs */}
      <Animated.View
        style={[
          styles.tabsContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && [styles.selectedTab, { backgroundColor: tab.color + '20' }]
              ]}
              onPress={() => handleTabPress(tab.key)}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={selectedTab === tab.key ? tab.color : COLORS.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && { color: tab.color, fontWeight: FONTS.weightBold }
              ]}>
                {tab.label}
              </Text>
              <View style={[
                styles.tabBadge,
                selectedTab === tab.key && { backgroundColor: tab.color }
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  selectedTab === tab.key && { color: COLORS.white }
                ]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={({ item, index }) => <BookingCard booking={item} index={index} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bookingsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>No bookings found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {selectedTab === 'all' 
                ? 'Book your first service to get started!' 
                : `No ${selectedTab} bookings at the moment.`}
            </Text>
            {selectedTab === 'all' && (
              <CustomButton
                title="Browse Services"
                variant="primary"
                onPress={() => navigation.navigate('Services')}
                style={styles.browseButton}
              />
            )}
          </View>
        )}
      />

      <FilterModal />
      <ActionsModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Enhanced Header
  headerContainer: {
    overflow: 'hidden',
  },

  headerGradient: {
    paddingBottom: SPACING.xl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: FONTS.h1,
    fontWeight: FONTS.weightExtraBold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },

  headerSubtitle: {
    fontSize: FONTS.body2,
    color: COLORS.white + 'CC',
    fontWeight: FONTS.weightMedium,
  },

  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.round,
    padding: SPACING.md,
  },

  // Search Container
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },

  searchInput: {
    backgroundColor: COLORS.white,
  },

  // Enhanced Tabs
  tabsContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    ...SHADOWS.light,
  },

  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },

  selectedTab: {
    borderWidth: 1,
  },

  tabText: {
    fontSize: FONTS.body3,
    fontWeight: FONTS.weightMedium,
    color: COLORS.textSecondary,
  },

  tabBadge: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 20,
    alignItems: 'center',
  },

  tabBadgeText: {
    fontSize: FONTS.caption,
    fontWeight: FONTS.weightBold,
    color: COLORS.textSecondary,
  },

  // Bookings List
  bookingsList: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },

  // Enhanced Booking Card
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },

  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  serviceIcon: {
    fontSize: FONTS.xxl,
    marginRight: SPACING.md,
  },

  serviceDetails: {
    flex: 1,
  },

  serviceTitle: {
    fontSize: FONTS.body1,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },

  providerName: {
    fontSize: FONTS.body3,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weightMedium,
  },

  statusContainer: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },

  statusText: {
    fontSize: FONTS.caption,
    fontWeight: FONTS.weightBold,
  },

  moreButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
  },

  cardContent: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  infoText: {
    fontSize: FONTS.body3,
    color: COLORS.textSecondary,
    flex: 1,
  },

  priceText: {
    fontSize: FONTS.body2,
    fontWeight: FONTS.weightBold,
    color: COLORS.success,
  },

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  actionButton: {
    flex: 1,
  },

  reviewButton: {
    flex: 1,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },

  filterModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    maxHeight: '70%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  modalTitle: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
  },

  filterSection: {
    marginBottom: SPACING.xl,
  },

  filterSectionTitle: {
    fontSize: FONTS.body1,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  selectedFilterOption: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },

  filterOptionText: {
    fontSize: FONTS.body2,
    color: COLORS.textPrimary,
  },

  selectedFilterOptionText: {
    color: COLORS.primary,
    fontWeight: FONTS.weightBold,
  },

  applyButton: {
    marginTop: SPACING.lg,
  },

  // Actions Modal
  actionsModal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    margin: SPACING.xl,
    padding: SPACING.xl,
  },

  actionsTitle: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },

  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.lg,
  },

  actionText: {
    fontSize: FONTS.body2,
    color: COLORS.textPrimary,
  },

  cancelAction: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.md,
  },

  cancelActionText: {
    fontSize: FONTS.body2,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weightMedium,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },

  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },

  emptyStateTitle: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },

  emptyStateSubtitle: {
    fontSize: FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: FONTS.body2 * FONTS.lineHeightNormal,
  },

  browseButton: {
    paddingHorizontal: SPACING.xxl,
  },
});

export default EnhancedBookingsScreen;
