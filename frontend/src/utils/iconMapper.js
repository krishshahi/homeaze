/**
 * Icon Mapper Utility
 * Maps emoji icons to proper Ionicons for React Native
 */

/**
 * Map emoji icons to corresponding Ionicons
 * This prevents the warning "X is not a valid icon name for family 'ionicons'"
 */
export const mapEmojiToIcon = (emoji) => {
  const iconMap = {
    // Service category icons
    '🏠': 'home-outline',
    '🔧': 'construct-outline',
    '⚡': 'flash-outline',
    '🌱': 'leaf-outline',
    '🧹': 'brush-outline',
    '🛠️': 'hammer-outline',
    '🎨': 'color-palette-outline',
    '🚰': 'water-outline',
    '🧽': 'hand-left-outline',
    '💡': 'bulb-outline',
    '❄️': 'snow-outline',
    '🔥': 'flame-outline',
    '🚗': 'car-outline',
    '🏊': 'fitness-outline',
    '🍳': 'restaurant-outline',
    '🧺': 'basket-outline',
    '🪟': 'apps-outline',
    '🚿': 'water-outline',
    '🌿': 'leaf-outline',
    
    // Status and action icons
    '✅': 'checkmark-circle-outline',
    '❌': 'close-circle-outline',
    '⏳': 'time-outline',
    '📅': 'calendar-outline',
    '💰': 'cash-outline',
    '⭐': 'star-outline',
    '📱': 'phone-portrait-outline',
    '📧': 'mail-outline',
    '🔔': 'notifications-outline',
    '⚙️': 'settings-outline',
    '👤': 'person-outline',
    '🏪': 'storefront-outline',
    '📊': 'bar-chart-outline',
    '📈': 'trending-up-outline',
    '🎯': 'location-outline',
    '🔍': 'search-outline',
    '📋': 'list-outline',
    '💸': 'cash-outline',
    '📞': 'call-outline',
    '🏆': 'trophy-outline',
    '🎉': 'balloon-outline',
    '🚪': 'exit-outline',
    '🔐': 'lock-closed-outline',
    '🛡️': 'shield-outline',
    '❓': 'help-circle-outline',
    '💌': 'heart-outline',
    '📦': 'cube-outline',
    '🎪': 'business-outline',
    '🏷️': 'pricetag-outline',
    '📝': 'document-text-outline',
    
    // Fallback for any unrecognized emoji
    default: 'ellipse-outline'
  };

  return iconMap[emoji] || iconMap.default;
};

/**
 * Get icon props for a given emoji or icon name
 * Returns proper Ionicon name and handles both emojis and existing icon names
 */
export const getIconProps = (iconInput) => {
  // If it's already a valid Ionicon name (contains '-'), return as is
  if (typeof iconInput === 'string' && iconInput.includes('-')) {
    return iconInput;
  }
  
  // If it's an emoji, map it to Ionicon
  if (typeof iconInput === 'string') {
    return mapEmojiToIcon(iconInput);
  }
  
  // Fallback
  return 'ellipse-outline';
};

/**
 * Create icon component props
 */
export const createIconProps = (iconInput, size = 24, color = '#3B82F6') => ({
  name: getIconProps(iconInput),
  size,
  color
});

/**
 * Common icon configurations
 */
export const ICON_CONFIGS = {
  service: {
    size: 24,
    color: '#3B82F6'
  },
  category: {
    size: 28,
    color: '#3B82F6'
  },
  status: {
    size: 16,
    color: '#6B7280'
  },
  action: {
    size: 20,
    color: '#FFFFFF'
  },
  tab: {
    size: 24,
    color: '#6B7280'
  }
};

export default {
  mapEmojiToIcon,
  getIconProps,
  createIconProps,
  ICON_CONFIGS
};
