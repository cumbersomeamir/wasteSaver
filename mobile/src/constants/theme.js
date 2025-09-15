import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Primary colors
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',
  
  // Secondary colors
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFB74D',
  
  // Accent colors
  accent: '#2196F3',
  accentDark: '#1976D2',
  accentLight: '#64B5F6',
  
  // Success colors
  success: '#4CAF50',
  successDark: '#388E3C',
  successLight: '#81C784',
  
  // Warning colors
  warning: '#FF9800',
  warningDark: '#F57C00',
  warningLight: '#FFB74D',
  
  // Error colors
  error: '#F44336',
  errorDark: '#D32F2F',
  errorLight: '#E57373',
  
  // Info colors
  info: '#2196F3',
  infoDark: '#1976D2',
  infoLight: '#64B5F6',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Gray scale
  lightGray: '#F5F5F5',
  gray: '#9E9E9E',
  darkGray: '#424242',
  veryDarkGray: '#212121',
  
  // Background colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textHint: '#9E9E9E',
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#F5F5F5',
  borderDark: '#BDBDBD',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
  
  // Status colors
  online: '#4CAF50',
  offline: '#9E9E9E',
  busy: '#FF9800',
  
  // Rating colors
  rating: '#FFD700',
  ratingEmpty: '#E0E0E0',
  
  // Price colors
  priceOriginal: '#9E9E9E',
  priceDiscounted: '#F44336',
  priceSale: '#4CAF50',
  
  // Environmental impact colors
  co2Saved: '#4CAF50',
  waterSaved: '#2196F3',
  moneySaved: '#FF9800',
  
  // Gradient colors
  gradientPrimary: ['#4CAF50', '#66BB6A'],
  gradientSecondary: ['#FF9800', '#FFB74D'],
  gradientAccent: ['#2196F3', '#64B5F6'],
  gradientSuccess: ['#4CAF50', '#81C784'],
  
  // Category colors
  bakery: '#FF9800',
  restaurant: '#F44336',
  cafe: '#795548',
  grocery: '#4CAF50',
  convenience: '#2196F3',
  wholesale: '#9C27B0',
  other: '#607D8B'
};

export const FONTS = {
  // Font families
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
  
  // Font weights
  thin: '100',
  ultraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  heavy: '800',
  black: '900'
};

export const SIZES = {
  // Base sizes
  base: 8,
  radius: 12,
  padding: 15,
  margin: 15,
  
  // Font sizes
  largeTitle: 34,
  title1: 28,
  title2: 22,
  title3: 20,
  headline: 17,
  body: 17,
  callout: 16,
  subhead: 15,
  footnote: 13,
  caption1: 12,
  caption2: 11,
  
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  
  // Component sizes
  buttonHeight: 50,
  inputHeight: 50,
  cardHeight: 200,
  avatarSize: 50,
  iconSize: 24,
  
  // Screen dimensions
  width,
  height,
  
  // Responsive breakpoints
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
  
  // Safe area
  statusBarHeight: 44,
  bottomTabHeight: 83,
  headerHeight: 88
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
  extraLarge: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 12,
  }
};

export const SPACING = {
  xs: SIZES.xs,
  sm: SIZES.sm,
  md: SIZES.md,
  lg: SIZES.lg,
  xl: SIZES.xl,
  xxl: SIZES.xxl,
  
  // Component spacing
  screenPadding: SIZES.padding,
  sectionSpacing: SIZES.lg,
  itemSpacing: SIZES.md,
  buttonSpacing: SIZES.sm,
  
  // Layout spacing
  headerPadding: SIZES.md,
  contentPadding: SIZES.padding,
  footerPadding: SIZES.md,
  
  // Grid spacing
  gridGutter: SIZES.md,
  gridMargin: SIZES.sm,
  gridPadding: SIZES.xs
};

export const ANIMATIONS = {
  // Duration
  fast: 200,
  normal: 300,
  slow: 500,
  
  // Easing
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Spring
  spring: {
    tension: 100,
    friction: 8
  },
  
  // Micro-interactions
  pressIn: 0.95,
  pressOut: 1.0,
  scale: {
    small: 0.95,
    medium: 0.98,
    large: 1.02
  }
};

export default {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
  SPACING,
  ANIMATIONS
};
