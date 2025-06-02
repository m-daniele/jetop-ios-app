// components/common/GradientBackground.tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from 'theme/theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: readonly string[] | string[];
  style?: ViewStyle;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors = theme.colors.background.gradient,
  style,
}) => {
  // Ensure we have at least 2 colors for LinearGradient
  const gradientColors = colors && colors.length >= 2 
    ? [...colors] 
    : [...theme.colors.background.gradient];
    
  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});