// Theme constants for Homeaze platform
export const COLORS = {
  // Primary colors - Professional blue theme
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#42A5F5',
  primaryUltraLight: '#E3F2FD',
  
  // Secondary colors - Warm accent
  secondary: '#FF6B35',
  secondaryDark: '#E64A19',
  secondaryLight: '#FF8A65',
  secondaryUltraLight: '#FFF3E0',
  
  // Gradient colors
  gradientPrimary: ['#1E88E5', '#1565C0'],
  gradientSecondary: ['#FF6B35', '#E64A19'],
  gradientNeutral: ['#F8F9FA', '#E9ECEF'],
  gradientSuccess: ['#4CAF50', '#388E3C'],
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#F5F5F5',
  lightGray: '#F5F5F5', // Alias for compatibility
  grayMedium: '#BDBDBD',
  grayDark: '#424242',
  grayLight: '#FAFAFA',
  grayUltraLight: '#FCFCFC',
  
  // Status colors
  success: '#4CAF50',
  successLight: '#81C784',
  successDark: '#388E3C',
  warning: '#FF9800',
  warningLight: '#FFB74D',
  warningDark: '#F57C00',
  error: '#F44336',
  errorLight: '#E57373',
  errorDark: '#D32F2F',
  info: '#2196F3',
  infoLight: '#64B5F6',
  infoDark: '#1976D2',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundTertiary: '#F1F3F4',
  backgroundCard: '#FFFFFF',
  backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
  backgroundModal: 'rgba(0, 0, 0, 0.7)',
  
  // Text colors
  text: '#212121', // Main text color alias
  textPrimary: '#212121',
  textSecondary: '#757575',
  textMuted: '#9E9E9E',
  textWhite: '#FFFFFF',
  textLight: '#F5F5F5',
  textDark: '#1A1A1A',
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderMedium: '#CCCCCC',
  borderDark: '#999999',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  shadowHeavy: 'rgba(0, 0, 0, 0.3)',
  
  // Interactive states
  ripple: 'rgba(30, 136, 229, 0.12)',
  rippleLight: 'rgba(30, 136, 229, 0.08)',
  hover: 'rgba(30, 136, 229, 0.04)',
  pressed: 'rgba(30, 136, 229, 0.16)',
};

export const FONTS = {
  // Font families
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
  
  // Font sizes with semantic naming
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  
  // Typography scale
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body1: 17,
  body2: 14,
  caption: 12,
  overline: 10,
  button: 14,
  
  // Font weights
  weightThin: '100',
  weightExtraLight: '200',
  weightLight: '300',
  weightRegular: '400',
  weightMedium: '500',
  weightSemiBold: '600',
  weightBold: '700',
  weightExtraBold: '800',
  weightBlack: '900',
  
  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.6,
  lineHeightLoose: 1.8,
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  xxxxl: 56,
  
  // Semantic spacing
  gutter: 16,
  section: 36,
  component: 8,
};

// Legacy SIZES constant for compatibility
export const SIZES = {
  // Padding and margins
  padding: 16,
  paddingSmall: 8,
  paddingLarge: 24,
  margin: 16,
  marginSmall: 8,
  marginLarge: 24,
  
  // Border radius
  borderRadius: 12,
  borderRadiusSmall: 8,
  borderRadiusLarge: 16,
  
  // Heights and widths
  buttonHeight: 48,
  inputHeight: 48,
  headerHeight: 60,
  tabBarHeight: 80,
  
  // Icon sizes
  iconSmall: 16,
  icon: 20,
  iconLarge: 24,
  iconXLarge: 32,
  
  // Avatar sizes
  avatarSmall: 32,
  avatar: 40,
  avatarLarge: 56,
  avatarXLarge: 80,
  
  // Spacing shortcuts
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BORDER_RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
  
  // Semantic radius
  button: 8,
  card: 12,
  input: 8,
  avatar: 999,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
  },
  light: {
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  heavy: {
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  floating: {
    shadowColor: 'rgba(0, 0, 0, 0.14)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const LAYOUT = {
  window: {
    width: '100%',
    height: '100%',
  },
  container: {
    paddingHorizontal: SPACING.md,
  },
  headerHeight: 60,
  tabBarHeight: 80,
  cardMinHeight: 120,
  buttonMinHeight: 44,
  inputHeight: 48,
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
  },
  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
  },
};

// Animation constants
export const ANIMATIONS = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Component variants
export const VARIANTS = {
  button: {
    primary: 'primary',
    secondary: 'secondary',
    tertiary: 'tertiary',
    outline: 'outline',
    ghost: 'ghost',
    danger: 'danger',
    success: 'success',
  },
  card: {
    default: 'default',
    elevated: 'elevated',
    outlined: 'outlined',
    filled: 'filled',
    gradient: 'gradient',
  },
  text: {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body1: 'body1',
    body2: 'body2',
    caption: 'caption',
    overline: 'overline',
  },
};
