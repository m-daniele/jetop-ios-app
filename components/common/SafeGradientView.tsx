// components/common/SafeGradientView.tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { GradientBackground } from '../GradientBackground';

interface SafeGradientViewProps {
  children: React.ReactNode;
  edges?: readonly Edge[];
  colors?: string[];
  style?: ViewStyle;
}

export const SafeGradientView: React.FC<SafeGradientViewProps> = ({
  children,
  edges = ['top', 'bottom'],
  colors,
  style,
}) => {
  return (
    <GradientBackground colors={colors}>
      <SafeAreaView style={[styles.container, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});