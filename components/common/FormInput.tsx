// components/common/FormInput.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { theme } from 'theme/theme';

interface FormInputProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  required = false,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={14} color={theme.colors.status.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  required: {
    color: theme.colors.status.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.status.error,
    flex: 1,
  },
});