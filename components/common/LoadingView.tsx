// components/common/LoadingView.tsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from 'theme/theme'; 

interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message,
  size = 'large',
  color = theme.colors.primary.purple,
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});