import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import ModernTheme from '@/constants/modernTheme';

interface ModernButtonProps {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  glowing?: boolean;
}

export default function ModernButton({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  style,
  glowing = false,
}: ModernButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: ModernTheme.radius.xl,
      ...ModernTheme.shadows.md,
    };

    // Size variants
    const sizeStyles = {
      sm: {
        paddingVertical: ModernTheme.spacing.sm,
        paddingHorizontal: ModernTheme.spacing.md,
      },
      md: {
        paddingVertical: ModernTheme.spacing.md,
        paddingHorizontal: ModernTheme.spacing.lg,
      },
      lg: {
        paddingVertical: ModernTheme.spacing.lg,
        paddingHorizontal: ModernTheme.spacing.xl,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: ModernTheme.colors.primary.main,
        ...(glowing && ModernTheme.shadows.glow_md),
      },
      secondary: {
        backgroundColor: ModernTheme.colors.secondary.main,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: ModernTheme.colors.primary.main,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const textColor =
      variant === 'outline' || variant === 'ghost'
        ? ModernTheme.colors.primary.dark
        : ModernTheme.colors.neutral.charcoal;

    const sizeStyles = {
      sm: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
      md: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
      lg: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
    };

    return {
      color: textColor,
      ...sizeStyles[size],
    } as TextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? ModernTheme.colors.primary.dark
              : ModernTheme.colors.neutral.charcoal
          }
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <IconSymbol
              name={icon}
              size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
              color={
                variant === 'outline' || variant === 'ghost'
                  ? ModernTheme.colors.primary.dark
                  : ModernTheme.colors.neutral.charcoal
              }
              style={{ marginRight: ModernTheme.spacing.sm }}
            />
          )}
          <ThemedText style={getTextStyle()}>{label}</ThemedText>
          {icon && iconPosition === 'right' && (
            <IconSymbol
              name={icon}
              size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
              color={
                variant === 'outline' || variant === 'ghost'
                  ? ModernTheme.colors.primary.dark
                  : ModernTheme.colors.neutral.charcoal
              }
              style={{ marginLeft: ModernTheme.spacing.sm }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: ModernTheme.radius.xl,
  },
});
