import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import theme from '../constants/modernTheme';
import ModernHomeScreen from '../screens/modern/ModernHomeScreen';
import ModernServicesScreen from '../screens/modern/ModernServicesScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const CustomTabButton = ({ children, onPress, accessibilityState }) => {
  const isSelected = accessibilityState.selected;
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withSpring(isSelected ? 1 : 0, {
      damping: 15,
      stiffness: 100,
    });
  }, [isSelected]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(animatedValue.value, [0, 1], [1, 1.1]);
    const translateY = interpolate(animatedValue.value, [0, 1], [0, -2]);
    
    return {
      transform: [
        { scale },
        { translateY },
      ],
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedValue.value, [0, 1], [0, 1]);
    
    return {
      opacity,
    };
  });

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.tabButtonBackground, animatedBackgroundStyle]} />
      <Animated.View style={[styles.tabButtonContent, animatedIconStyle]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'android' ? 8 : insets.bottom;
  console.log('🎆 ModernBottomTabNavigator - Bottom padding:', bottomPadding, 'Insets:', insets);
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: bottomPadding }]}>
      {/* Background with blur effect simulation */}
      <LinearGradient
        colors={[theme.colors.surface.primary + 'F5', theme.colors.surface.primary]}
        style={styles.tabBarBackground}
      />
      
      {/* Tab buttons */}
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Get icon for route
          const getIconName = (routeName, focused) => {
            switch (routeName) {
              case 'Home':
                return focused ? 'home' : 'home-outline';
              case 'Services':
                return focused ? 'grid' : 'grid-outline';
              case 'Bookings':
                return focused ? 'calendar' : 'calendar-outline';
              case 'Profile':
                return focused ? 'person' : 'person-outline';
              default:
                return 'help-outline';
            }
          };

          return (
            <CustomTabButton
              key={route.key}
              onPress={onPress}
              accessibilityState={{ selected: isFocused }}
            >
              <Ionicons
                name={getIconName(route.name, isFocused)}
                size={24}
                color={isFocused ? theme.colors.primary[600] : theme.colors.text.tertiary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused 
                      ? theme.colors.primary[600] 
                      : theme.colors.text.tertiary,
                    fontWeight: isFocused 
                      ? theme.typography.weight.semiBold 
                      : theme.typography.weight.medium,
                  },
                ]}
              >
                {label}
              </Text>
            </CustomTabButton>
          );
        })}
      </View>
    </View>
  );
};

const ModernBottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={ModernHomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Services"
        component={ModernServicesScreen}
        options={{
          tabBarLabel: 'Services',
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: theme.colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary + '30',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
    position: 'relative',
    minHeight: 56,
  },
  
  tabButtonBackground: {
    position: 'absolute',
    top: theme.spacing[1],
    left: theme.spacing[2],
    right: theme.spacing[2],
    bottom: theme.spacing[1],
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
  },
  
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  
  tabLabel: {
    fontSize: theme.typography.size.xs,
    marginTop: theme.spacing[1],
    textAlign: 'center',
    letterSpacing: 0.25,
  },
});

export default ModernBottomTabNavigator;
