// components/common/ErrorView.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { theme } from 'theme/theme';
import { ActionButton } from './ActionButton';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  showIcon?: boolean;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message,
  onRetry,
  showIcon = true,
}) => {
  return (
    <View style={styles.container}>
      {showIcon && (
        <AlertCircle 
          size={48} 
          color={theme.colors.status.error} 
          style={styles.icon}
        />
      )}
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <View style={styles.buttonContainer}>
          <ActionButton
            onPress={onRetry}
            title="Try Again"
            variant="primary"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  icon: {
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.status.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
});