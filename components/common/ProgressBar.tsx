// components/common/ProgressBar.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from 'theme/theme';

interface ProgressBarProps {
  percentage: number;
  colors?: readonly [string, string, ...string[]];
  height?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  colors,
  height = 6,
  backgroundColor = theme.colors.ui.border,
  style,
}) => {
  // Ensure percentage is between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Ensure we have valid gradient colors
  const gradientColors = colors || [...theme.colors.primary.gradient] as [string, string];

  return (
    <View 
      style={[
        styles.container, 
        { height, backgroundColor },
        style
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.progressFill,
          { width: `${clampedPercentage}%` }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
});