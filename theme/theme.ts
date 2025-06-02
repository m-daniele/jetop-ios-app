// theme/index.ts 
import { TextStyle } from 'react-native';

// Define the allowed font weight type
type FontWeight = TextStyle['fontWeight'];

export const theme = {
  colors: {
    // Primary colors
    primary: {
      gradient: ['#5000ce', '#6900a3'],
      purple: '#a855f7',
      purpleDark: '#9333ea',
    },
    // Background gradients
    background: {
      gradient: ['#0F0C29', '#302B63', '#24243e'],
      dark: 'rgba(15,12,41,0.7)',
    },
    // Text colors
    text: {
      primary: '#fff',
      secondary: 'rgba(255,255,255,0.7)',
      muted: 'rgba(255,255,255,0.5)',
      disabled: 'rgba(255,255,255,0.3)',
    },
    // UI elements
    ui: {
      border: 'rgba(255,255,255,0.1)',
      cardBg: 'rgba(255,255,255,0.05)',
      blurBg: 'rgba(255,255,255,0.03)',
    },
    // Status colors
    status: {
      error: '#ef4444',
      errorDark: '#dc2626',
      success: '#10b981',
      warning: '#f59e0b',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  
  typography: {
    // Font sizes
    fontSize: {
      xs: 11,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 36,
    },
    // Font weights with proper typing
    fontWeight: {
      regular: '400' as FontWeight,
      medium: '500' as FontWeight,
      semibold: '600' as FontWeight,
      bold: '700' as FontWeight,
      extrabold: '800' as FontWeight,
    },
    // Letter spacing
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
    },
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#a855f7',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#a855f7',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  
  animations: {
    duration: {
      fast: 200,
      normal: 400,
      slow: 800,
    },
    spring: {
      tension: 20,
      friction: 7,
    },
  },
} as const;

// Type helpers
export type Theme = typeof theme;
export type Colors = typeof theme.colors;
export type Spacing = keyof typeof theme.spacing;
export type FontSize = keyof typeof theme.typography.fontSize;
export type ThemeFontWeight = keyof typeof theme.typography.fontWeight;