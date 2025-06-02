// components/common/BlurCard.tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from 'theme/theme';

interface BlurCardProps {
  children: React.ReactNode;
  intensity?: number;
  style?: ViewStyle;
  tint?: 'light' | 'dark' | 'default';
}

export const BlurCard: React.FC<BlurCardProps> = ({
  children,
  intensity = 20,
  style,
  tint = 'dark',
}) => {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[styles.container, style]}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    backgroundColor: theme.colors.ui.cardBg,
  },
});