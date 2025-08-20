import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../constants/modernTheme';
import ModernButton from '../components/modern/ModernButton';
import ModernCard from '../components/modern/ModernCard';
import {
  SkeletonLoader,
  ServiceCardSkeleton,
  ListItemSkeleton,
  PulsingLoader,
  SpinningLoader,
  LoadingOverlay,
  SuccessAnimation,
  ErrorAnimation,
  useFadeAnimation,
  useSlideAnimation,
  useScaleAnimation,
} from '../components/modern/LoadingStates';
import {
  RippleEffect,
  FloatingActionButton,
  SwipeToAction,
  InteractiveRating,
  LongPressMenu,
  usePressAnimation,
} from '../components/modern/MicroInteractions';

const MicroInteractionsDemo = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [rating, setRating] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation hooks
  const fadeStyle = useFadeAnimation(isVisible);
  const slideStyle = useSlideAnimation(isVisible, 'up', 30);
  const scaleStyle = useScaleAnimation(isVisible, 1);

  const handleButtonPress = (type) => {
    switch (type) {
      case 'loading':
        setLoading(true);
        setTimeout(() => setLoading(false), 3000);
        break;
      case 'success':
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        break;
      case 'error':
        setShowError(true);
        setTimeout(() => setShowError(false), 2000);
        break;
      case 'toggle':
        setIsVisible(!isVisible);
        break;
    }
  };

  const handleSwipeAction = (direction) => {
    Alert.alert('Swipe Action', `Swiped ${direction}!`);
  };

  const handleLongPressMenu = (item, index) => {
    Alert.alert('Menu Action', `Selected: ${item.title}`);
  };

  const menuItems = [
    { icon: 'heart', title: 'Like', color: theme.colors.error[500] },
    { icon: 'bookmark', title: 'Save', color: theme.colors.primary[500] },
    { icon: 'share', title: 'Share', color: theme.colors.success[500] },
    { icon: 'flag', title: 'Report', color: theme.colors.warning[500] },
  ];

  const swipeActions = [
    { icon: 'trash', color: theme.colors.error[500], onPress: () => handleSwipeAction('delete') },
    { icon: 'heart', color: theme.colors.error[400], onPress: () => handleSwipeAction('like') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Micro-Interactions Demo</Text>
          <Text style={styles.subtitle}>
            Showcase of modern UI interactions and loading states
          </Text>
        </View>

        {/* Enhanced Buttons */}
        <ModernCard style={styles.section}>
          <Text style={styles.sectionTitle}>Enhanced Buttons</Text>
          <View style={styles.buttonGrid}>
            <ModernButton 
              title="Basic Button" 
              onPress={() => {}} 
              style={styles.demoButton}
            />
            <ModernButton 
              title="With Haptic" 
              onPress={() => {}} 
              withHaptic={true}
              style={styles.demoButton}
            />
            <ModernButton 
              title="With Ripple" 
              onPress={() => {}} 
              withRipple={true}
              style={styles.demoButton}
            />
            <ModernButton 
              title="Gradient + Ripple" 
              onPress={() => {}} 
              variant="gradient"
              withRipple={true}
              style={styles.demoButton}
            />
          </View>
        </ModernCard>

        {/* Loading States */}
        <ModernCard style={styles.section}>
          <Text style={styles.sectionTitle}>Loading States</Text>
          <View style={styles.loadingGrid}>
            <View style={styles.loadingItem}>
              <Text style={styles.loadingLabel}>Skeleton</Text>
              <SkeletonLoader width={100} height={16} />
            </View>
            <View style={styles.loadingItem}>
              <Text style={styles.loadingLabel}>Pulsing</Text>
              <PulsingLoader size={32} />
            </View>
            <View style={styles.loadingItem}>
              <Text style={styles.loadingLabel}>Spinning</Text>
              <SpinningLoader size={32} />
            </View>
          </View>

          <ServiceCardSkeleton />
          <ListItemSkeleton />

          <View style={styles.buttonRow}>
            <ModernButton 
              title="Show Loading" 
              onPress={() => handleButtonPress('loading')}
              size="sm"
              style={{ marginRight: theme.spacing[2] }}
            />
            <ModernButton 
              title="Success" 
              onPress={() => handleButtonPress('success')}
              variant="success"
              size="sm"
              style={{ marginRight: theme.spacing[2] }}
            />
            <ModernButton 
              title="Error" 
              onPress={() => handleButtonPress('error')}
              variant="danger"
              size="sm"
            />
          </View>
        </ModernCard>

        {/* Interactive Components */}
        <ModernCard style={styles.section}>
          <Text style={styles.sectionTitle}>Interactive Components</Text>
          
          {/* Ripple Effect */}
          <View style={styles.interactiveSection}>
            <Text style={styles.interactiveLabel}>Ripple Effect</Text>
            <RippleEffect
              onPress={() => Alert.alert('Ripple!', 'Ripple effect triggered')}
              style={styles.rippleDemo}
            >
              <View style={styles.rippleContent}>
                <Ionicons name="finger-print" size={24} color={theme.colors.primary[500]} />
                <Text style={styles.rippleText}>Tap for Ripple</Text>
              </View>
            </RippleEffect>
          </View>

          {/* Interactive Rating */}
          <View style={styles.interactiveSection}>
            <Text style={styles.interactiveLabel}>Interactive Rating</Text>
            <InteractiveRating
              rating={rating}
              onRatingChange={setRating}
              size={32}
            />
            <Text style={styles.ratingText}>Rating: {rating}/5</Text>
          </View>

          {/* Long Press Menu */}
          <View style={styles.interactiveSection}>
            <Text style={styles.interactiveLabel}>Long Press Menu</Text>
            <LongPressMenu
              menuItems={menuItems}
              onMenuItemPress={handleLongPressMenu}
            >
              <ModernCard variant="outlined" style={styles.longPressCard}>
                <View style={styles.longPressContent}>
                  <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text.secondary} />
                  <Text style={styles.longPressText}>Long press for menu</Text>
                </View>
              </ModernCard>
            </LongPressMenu>
          </View>

          {/* Swipe to Action */}
          <View style={styles.interactiveSection}>
            <Text style={styles.interactiveLabel}>Swipe to Action</Text>
            <SwipeToAction
              rightActions={swipeActions}
              actionThreshold={60}
            >
              <ModernCard style={styles.swipeCard}>
                <View style={styles.swipeContent}>
                  <Ionicons name="arrow-forward" size={24} color={theme.colors.primary[500]} />
                  <Text style={styles.swipeText}>Swipe left for actions</Text>
                </View>
              </ModernCard>
            </SwipeToAction>
          </View>
        </ModernCard>

        {/* Animations */}
        <ModernCard style={styles.section}>
          <Text style={styles.sectionTitle}>Animations</Text>
          
          <ModernButton 
            title="Toggle Animations" 
            onPress={() => handleButtonPress('toggle')}
            style={styles.toggleButton}
          />

          <Animated.View style={[styles.animationDemo, fadeStyle]}>
            <Text style={styles.animationLabel}>Fade Animation</Text>
          </Animated.View>

          <Animated.View style={[styles.animationDemo, slideStyle]}>
            <Text style={styles.animationLabel}>Slide Animation</Text>
          </Animated.View>

          <Animated.View style={[styles.animationDemo, scaleStyle]}>
            <Text style={styles.animationLabel}>Scale Animation</Text>
          </Animated.View>
        </ModernCard>

        {/* Spacing for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => Alert.alert('FAB', 'Floating Action Button pressed!')}
        icon="add"
        style={styles.fab}
      />

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={loading}
        message="Loading awesome content..."
      />

      {/* Success Animation */}
      <SuccessAnimation
        visible={showSuccess}
        message="Success!"
      />

      {/* Error Animation */}
      <ErrorAnimation
        visible={showError}
        message="Something went wrong!"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: theme.spacing[4],
  },

  header: {
    marginBottom: theme.spacing[6],
    alignItems: 'center',
  },

  title: {
    ...theme.typography.styles.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },

  subtitle: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },

  section: {
    marginBottom: theme.spacing[6],
  },

  sectionTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },

  // Button Styles
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  demoButton: {
    width: '48%',
    marginBottom: theme.spacing[3],
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: theme.spacing[4],
  },

  // Loading Styles
  loadingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing[4],
  },

  loadingItem: {
    alignItems: 'center',
  },

  loadingLabel: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },

  // Interactive Styles
  interactiveSection: {
    marginBottom: theme.spacing[5],
  },

  interactiveLabel: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },

  // Ripple Demo
  rippleDemo: {
    backgroundColor: theme.colors.surface.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
  },

  rippleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rippleText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing[3],
  },

  // Rating
  ratingText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[2],
    textAlign: 'center',
  },

  // Long Press
  longPressCard: {
    padding: theme.spacing[4],
  },

  longPressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  longPressText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[3],
  },

  // Swipe
  swipeCard: {
    padding: theme.spacing[4],
    backgroundColor: theme.colors.surface.secondary,
  },

  swipeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  swipeText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing[3],
  },

  // Animations
  toggleButton: {
    marginBottom: theme.spacing[4],
    alignSelf: 'center',
  },

  animationDemo: {
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    alignItems: 'center',
  },

  animationLabel: {
    ...theme.typography.styles.body1,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.weight.semiBold,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: theme.spacing[6],
    right: theme.spacing[6],
  },
});

export default MicroInteractionsDemo;
