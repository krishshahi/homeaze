// Modern Design System for HomeAze
// Comprehensive design tokens for consistent UI/UX

import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ============================================================================
// COLOR SYSTEM - Modern, accessible color palette
// ============================================================================

const COLORS = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Secondary Colors
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Main secondary
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },

  // Success Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning Colors  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Error Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Info Colors
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main info
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Neutral Colors (Gray Scale)
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Semantic Color Aliases
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
    inverse: '#171717',
  },

  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    placeholder: '#94a3b8',
    inverse: '#ffffff',
    disabled: '#cbd5e1',
  },

  border: {
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    focus: '#0ea5e9',
    error: '#ef4444',
    success: '#22c55e',
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.9)',
    medium: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(0, 0, 0, 0.6)',
    darker: 'rgba(0, 0, 0, 0.8)',
  },

  // Gradient Definitions
  gradients: {
    primary: ['#0ea5e9', '#0284c7'],
    secondary: ['#d946ef', '#c026d3'],
    success: ['#22c55e', '#16a34a'],
    sunset: ['#f59e0b', '#f97316'],
    ocean: ['#06b6d4', '#0891b2'],
    purple: ['#8b5cf6', '#7c3aed'],
  },
};

// ============================================================================
// TYPOGRAPHY SYSTEM - Modern, scalable typography
// ============================================================================

const TYPOGRAPHY = {
  // Font Families
  fonts: {
    primary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
    secondary: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'Roboto Mono',
      default: 'monospace',
    }),
  },

  // Font Sizes (using modular scale)
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
  },

  // Font Weights
  weight: {
    thin: '100',
    extraLight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },

  // Text Styles (Predefined combinations)
  styles: {
    h1: {
      fontSize: 36,
      fontWeight: '800',
      lineHeight: 1.25,
      letterSpacing: -0.025,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 1.25,
      letterSpacing: -0.025,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.375,
      letterSpacing: -0.025,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.375,
    },
    h5: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 1.5,
    },
    h6: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.375,
    },
    overline: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 1.375,
      letterSpacing: 0.05,
      textTransform: 'uppercase',
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.5,
    },
  },
};

// ============================================================================
// SPACING SYSTEM - Consistent spacing scale
// ============================================================================

const SPACING = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  full: 9999,
};

// ============================================================================
// SHADOW SYSTEM - Elevation-based shadows
// ============================================================================

const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 20,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 25,
  },
};

// ============================================================================
// COMPONENT SPECIFICATIONS
// ============================================================================

const COMPONENTS = {
  // Button Specifications
  button: {
    sizes: {
      xs: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        fontSize: 12,
        iconSize: 16,
        minHeight: 28,
      },
      sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        fontSize: 14,
        iconSize: 18,
        minHeight: 36,
      },
      md: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        fontSize: 16,
        iconSize: 20,
        minHeight: 44,
      },
      lg: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        fontSize: 18,
        iconSize: 24,
        minHeight: 52,
      },
      xl: {
        paddingVertical: 20,
        paddingHorizontal: 28,
        fontSize: 20,
        iconSize: 28,
        minHeight: 60,
      },
    },
  },

  // Input Specifications
  input: {
    sizes: {
      sm: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        minHeight: 36,
      },
      md: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        minHeight: 44,
      },
      lg: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 18,
        minHeight: 52,
      },
    },
  },

  // Card Specifications
  card: {
    padding: {
      sm: 16,
      md: 20,
      lg: 24,
    },
    borderRadius: 12,
  },

  // Avatar Specifications
  avatar: {
    sizes: {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
      '2xl': 80,
      '3xl': 96,
    },
  },

  // Icon Specifications
  icon: {
    sizes: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      '2xl': 40,
    },
  },
};

// ============================================================================
// LAYOUT SPECIFICATIONS
// ============================================================================

const LAYOUT = {
  // Screen dimensions
  screen: {
    width: screenWidth,
    height: screenHeight,
  },

  // Container specifications
  container: {
    paddingHorizontal: 20,
    maxWidth: 1200,
  },

  // Header specifications
  header: {
    height: Platform.select({
      ios: 88,
      android: 56,
      default: 56,
    }),
  },

  // Tab bar specifications
  tabBar: {
    height: Platform.select({
      ios: 83,
      android: 60,
      default: 60,
    }),
  },

  // Safe area
  safeArea: {
    top: Platform.select({
      ios: 44,
      android: 24,
      default: 24,
    }),
    bottom: Platform.select({
      ios: 34,
      android: 0,
      default: 0,
    }),
  },
};

// ============================================================================
// ANIMATION SPECIFICATIONS
// ============================================================================

const ANIMATIONS = {
  // Duration presets
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
  },

  // Easing curves
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'spring',
  },

  // Common animation configs
  configs: {
    fadeIn: {
      duration: 300,
      useNativeDriver: true,
    },
    slideIn: {
      duration: 300,
      useNativeDriver: true,
    },
    scale: {
      duration: 200,
      useNativeDriver: true,
    },
    spring: {
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    },
  },
};

// ============================================================================
// THEME VARIANTS
// ============================================================================

const THEMES = {
  light: {
    colors: COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    components: COMPONENTS,
    layout: LAYOUT,
    animations: ANIMATIONS,
  },
  dark: {
    colors: {
      ...COLORS,
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#334155',
        inverse: '#ffffff',
      },
      surface: {
        primary: '#1e293b',
        secondary: '#334155',
        tertiary: '#475569',
        elevated: '#334155',
        overlay: 'rgba(255, 255, 255, 0.1)',
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        placeholder: '#64748b',
        inverse: '#0f172a',
        disabled: '#475569',
      },
    },
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    components: COMPONENTS,
    layout: LAYOUT,
    animations: ANIMATIONS,
  },
};

// Export the default theme (light)
export default THEMES.light;

// Export individual theme systems
export {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  COMPONENTS,
  LAYOUT,
  ANIMATIONS,
  THEMES,
};
