import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';

import CustomButton from '../components/CustomButton';
import Text from '../components/Text';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import OnboardingAPI from '../services/onboardingApi';

// Components

const { width } = Dimensions.get('window');

const DEFAULT_SLIDES = [
  { id: '1', title: 'Trustworthy Services', description: 'Get connected with verified and professional service providers for all your home needs.', icon: 'shield' },
  { id: '2', title: 'Convenient Booking', description: 'Book services at your preferred time with just a few taps. Real-time availability and instant confirmation.', icon: 'calendar' },
  { id: '3', title: 'Transparent Pricing', description: 'No hidden charges. Get upfront pricing and pay securely through the app.', icon: 'dollar-sign' },
  { id: '4', title: 'Quality Assured', description: 'All service providers are vetted and rated. Your satisfaction is our priority.', icon: 'star' },
];
const DEFAULT_INTRO = { title: 'Your Ultimate Home Solution', subtitle: 'Find trusted professionals for all your home service needs' };

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [slides, setSlides] = useState([]);
  const [intro, setIntro] = useState(DEFAULT_INTRO);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      navigation.navigate('Auth');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

// Load dynamic onboarding if available
React.useEffect(() => {
  (async () => {
    try {
      const data = await OnboardingAPI.getOnboardingContent();
      if (data?.slides?.length) {
        setSlides(data.slides);
      } else {
        setSlides(DEFAULT_SLIDES);
      }
      if (data?.intro) {
        setIntro({ ...DEFAULT_INTRO, ...data.intro });
      }
    } catch (e) {
      // Fallback to local defaults if API fails
      setSlides(DEFAULT_SLIDES);
      setIntro(DEFAULT_INTRO);
    }
  })();
}, []);

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
    });

    return (
      <View style={styles.itemContainer}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.primaryLight, COLORS.primary]}
            style={styles.iconGradient}
          >
            <Feather name={item.icon} size={32} color={COLORS.white} />
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text variant="h2" weight="bold" style={styles.title}>
            {item.title}
          </Text>
          <Text
            variant="body1"
            color={COLORS.textSecondary}
            style={styles.description}
          >
            {item.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.white, COLORS.grayLight]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h1" weight="bold" style={styles.appTitle}>
            Homeaze
          </Text>
          <Text variant="body1" color={COLORS.textSecondary} style={styles.appSubtitle}>
            {intro.subtitle}
          </Text>
        </View>

        {/* Slides */}
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
        />

        {/* Pagination */}
        {renderPagination()}

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <CustomButton
            title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
            onPress={() => {
if (currentIndex < slides.length - 1) {
                flatListRef.current?.scrollToIndex({
                  index: currentIndex + 1,
                  animated: true,
                });
              } else {
                completeOnboarding();
              }
            }}
            gradient
            style={styles.button}
          />

{currentIndex < slides.length - 1 && (
            <TouchableOpacity
              onPress={completeOnboarding}
              style={styles.skipButton}
            >
              <Text variant="body2" color={COLORS.textSecondary}>
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  appTitle: {
    fontSize: FONTS.h1 * 1.2,
    marginBottom: SPACING.xs,
  },
  appSubtitle: {
    textAlign: 'center',
    maxWidth: '80%',
  },
  itemContainer: {
    width,
    alignItems: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    textAlign: 'center',
    maxWidth: '80%',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  button: {
    marginBottom: SPACING.md,
  },
  skipButton: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
});

export default OnboardingScreen;
