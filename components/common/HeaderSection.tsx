// components/common/HeaderSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from 'theme/theme';

interface HeaderSectionProps {
  title: string;
  subtitle?: string;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    letterSpacing: theme.typography.letterSpacing.tight,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: theme.spacing.md,
  },
});