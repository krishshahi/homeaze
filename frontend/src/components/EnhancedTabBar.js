import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const EnhancedTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          // Support an optional badge count via screen options.
          // Use either options.tabBarBadgeCount or options.tabBarBadge (if numeric).
          const rawBadge = options.tabBarBadgeCount ?? options.tabBarBadge;
          const badgeCount = typeof rawBadge === 'number' ? rawBadge : undefined;

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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Define icons based on route name
          const getTabIcon = (routeName, focused) => {
            const iconMap = {
              Home: {
                focused: '🏠',
                unfocused: '🏡',
                gradient: ['#667eea', '#764ba2']
              },
              Services: {
                focused: '🔧',
                unfocused: '🛠️',
                gradient: ['#f093fb', '#f5576c']
              },
              Bookings: {
                focused: '📅',
                unfocused: '📋',
                gradient: ['#4facfe', '#00f2fe']
              },
              Profile: {
                focused: '👤',
                unfocused: '👥',
                gradient: ['#43e97b', '#38f9d7']
              },
              Dashboard: {
                focused: '📊',
                unfocused: '📈',
                gradient: ['#fa709a', '#fee140']
              },
            };

            return iconMap[routeName] || { 
              focused: '●', 
              unfocused: '○', 
              gradient: [COLORS.primary, COLORS.primaryLight] 
            };
          };

          const tabIcon = getTabIcon(route.name, isFocused);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tab,
                isFocused && styles.activeTab,
              ]}
              activeOpacity={0.7}
            >
              {/* Icon Container */}
              <View style={[
                styles.iconContainer,
                isFocused && styles.activeIconContainer,
              ]}>
                <Text style={[
                  styles.icon,
                  isFocused && styles.activeIcon,
                ]}>
                  {isFocused ? tabIcon.focused : tabIcon.unfocused}
                </Text>
                
                {/* Active indicator */}
                {isFocused && <View style={styles.activeIndicator} />}
              </View>

              {/* Label */}
              <Text style={[
                styles.label,
                isFocused && styles.activeLabel,
              ]}>
                {label}
              </Text>

              {/* Notification Badge - render only when a positive numeric badgeCount is provided */}
              {typeof badgeCount === 'number' && badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
  
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.lg : SPACING.md,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.light,
  },
  
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    position: 'relative',
  },
  
  activeTab: {
    // Additional styling for active tab if needed
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  
  activeIconContainer: {
    backgroundColor: COLORS.primaryUltraLight,
    ...SHADOWS.subtle,
  },
  
  icon: {
    fontSize: 22,
  },
  
  activeIcon: {
    fontSize: 24,
  },
  
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  
  label: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightRegular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  
  activeLabel: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.weightSemiBold,
    color: COLORS.primary,
  },
  
  badge: {
    position: 'absolute',
    top: 4,
    right: 12,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxs,
    ...SHADOWS.subtle,
  },
  
  badgeText: {
    fontSize: FONTS.xxs,
    fontWeight: FONTS.weightBold,
    color: COLORS.white,
  },
});

export default EnhancedTabBar;
