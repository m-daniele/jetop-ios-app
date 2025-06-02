// styles/shared.ts
import { StyleSheet } from 'react-native';
import { theme } from 'theme/theme';

export const sharedStyles = StyleSheet.create({
  // Layout containers
  gradient: {
    flex: 1,
  },
  
  container: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Headers
  headerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  
  // Cards and containers
  blurCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    backgroundColor: theme.colors.ui.cardBg,
  },
  
  cardContent: {
    padding: theme.spacing.lg,
  },
  
  // Buttons
  buttonContainer: {
    alignItems: 'center',
  },
  
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius['3xl'],
    ...theme.shadows.lg,
  },
  
  buttonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  
  // Form inputs
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  
  inputBlurContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  
  input: {
    backgroundColor: theme.colors.ui.cardBg,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.status.error,
    textAlign: 'center',
  },
  
  // Footer
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    textAlign: 'center',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});

// Helper functions
export const createGradientStyle = (colors: readonly string[] = theme.colors.primary.gradient) => ({
  colors: [...colors], // Create a mutable copy
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
});

export const createBlurStyle = (intensity: number = 20, tint: 'light' | 'dark' = 'dark') => ({
  intensity,
  tint,
});

export const createShadow = (level: keyof typeof theme.shadows) => theme.shadows[level];