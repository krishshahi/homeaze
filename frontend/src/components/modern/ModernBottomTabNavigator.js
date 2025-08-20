import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import theme from '../../constants/modernTheme';
import { triggerHaptic } from './MicroInteractions';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const AnimatedTabButton = ({ 
  route, 
  isFocused, 
  onPress, 
  icon, 
  badgeCount = 0 
}) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.1 : 1)).current;
  const translateYAnim = useRef(new Animated.Value(isFocused ? -2 : 0)).current;
  const badgeScale = useRef(new Animated.Value(badgeCount > 0 ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.1 : 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: isFocused ? -2 : 0,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, scaleAnim, translateYAnim]);

  useEffect(() => {
    Animated.spring(badgeScale, {
      toValue: badgeCount > 0 ? 1 : 0,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [badgeCount, badgeScale]);

  const handlePress = () => {
    if (!isFocused) {
      triggerHaptic('light');
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.tabIconContainer,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        <View style={styles.iconWrapper}>
          <Ionicons
            name={isFocused ? icon : `${icon}-outline`}
            size={24}
            color={isFocused ? theme.colors.primary[500] : theme.colors.text.secondary}
          />
          
          {/* Badge */}
          {badgeCount > 0 && (
            <Animated.View
              style={[
                styles.badge,
                {
                  transform: [{ scale: badgeScale }],
                },
              ]}
            >
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? '99+' : badgeCount.toString()}
              </Text>
            </Animated.View>
          )}
        </View>
        
        <Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? theme.colors.primary[500] : theme.colors.text.secondary,
              fontWeight: isFocused ? theme.typography.weight.semiBold : theme.typography.weight.regular,
            },
          ]}
        >
          {route.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const ModernTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarGradient}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            // Get icon and badge from route params or options
            const icon = options.tabBarIcon || getIconForRoute(route.name);
            const badgeCount = options.tabBarBadgeCount || 0;

            return (
              <AnimatedTabButton
                key={route.key}
                route={route}
                isFocused={isFocused}
                onPress={onPress}
                icon={icon}
                badgeCount={badgeCount}
              />
            );
          })}
        </View>
        <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
      </View>
    </View>
  );
};

const getIconForRoute = (routeName) => {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Services':
      return 'grid';
    case 'Bookings':
      return 'calendar';
    case 'Profile':
      return 'person';
    default:
      return 'ellipse';
  }
};

const ModernBottomTabNavigator = ({ screens = [] }) => {
  return (
    <Tab.Navigator
      tabBar={(props) => <ModernTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {screens.map((screen, index) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarIcon: screen.icon,
            tabBarBadgeCount: screen.badgeCount || 0,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: theme.colors.surface.primary,
  },

  tabBarGradient: {
    backgroundColor: theme.colors.surface.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
  },

  tabBar: {
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: theme.spacing[2],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[1],
    alignItems: 'center',
  },
  
  bottomSafeArea: {
    backgroundColor: theme.colors.surface.primary,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[1],
  },

  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  tabLabel: {
    ...theme.typography.styles.caption,
    fontSize: 12,
    textAlign: 'center',
  },

  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: theme.colors.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.surface.primary,
  },

  badgeText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
    textAlign: 'center',
  },
});

export default ModernBottomTabNavigator;
