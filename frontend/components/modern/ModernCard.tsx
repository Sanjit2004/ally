import React from 'react';
import { View, ViewStyle } from 'react-native';
import ModernTheme from '@/constants/modernTheme';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  onPress?: () => void;
}

export default function ModernCard({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  onPress,
}: ModernCardProps) {
  const getPaddingValue = () => {
    switch (padding) {
      case 'sm':
        return ModernTheme.spacing.md;
      case 'md':
        return ModernTheme.spacing.lg;
      case 'lg':
        return ModernTheme.spacing.xl;
      default:
        return ModernTheme.spacing.lg;
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: ModernTheme.colors.neutral.white,
          borderRadius: ModernTheme.radius.lg,
          ...ModernTheme.shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: ModernTheme.colors.neutral.white,
          borderRadius: ModernTheme.radius.lg,
          borderWidth: 1,
          borderColor: ModernTheme.colors.neutral.light_gray,
        };
      case 'filled':
        return {
          backgroundColor: ModernTheme.colors.primary.light,
          borderRadius: ModernTheme.radius.lg,
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: ModernTheme.radius.lg,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          ...ModernTheme.shadows.sm,
        };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        {
          padding: getPaddingValue(),
        },
        getVariantStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );
}
