// components/common/ActionButton.tsx
import React from 'react';
import { TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ViewStyle,
  TextStyle 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { theme } from 'theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

interface ActionButtonProps {
  onPress: () => void;
  title: string;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantColors: Record<ButtonVariant, readonly [string, string, ...string[]]> = {
  primary: [...theme.colors.primary.gradient] as [string, string],
  secondary: ['#6b7280', '#4b5563'],
  danger: ['#dc2626', '#b91c1c'],
  success: ['#10b981', '#059669'],
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  onPress,
  title,
  icon: Icon,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  const colors = isDisabled ? variantColors.secondary : variantColors[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : Icon ? (
          <Icon size={20} color="white" />
        ) : null}
        <Text style={[styles.text, textStyle]}>{loading ? 'Loading...' : title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius['3xl'],
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
});