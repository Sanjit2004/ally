import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import ModernTheme from '@/constants/modernTheme';

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
  backgroundColor?: string;
}

export default function ModernHeader({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
  backgroundColor = ModernTheme.colors.neutral.white,
}: ModernHeaderProps) {
  return (
    <View
      style={[
        {
          backgroundColor,
          paddingHorizontal: ModernTheme.spacing.lg,
          paddingVertical: ModernTheme.spacing.lg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...ModernTheme.shadows.sm,
        },
        style,
      ]}
    >
      {/* Left Icon */}
      {leftIcon ? (
        <TouchableOpacity onPress={onLeftPress} activeOpacity={0.7}>
          <IconSymbol
            name={leftIcon}
            size={24}
            color={ModernTheme.colors.primary.dark}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      {/* Title and Subtitle */}
      <View style={{ flex: 1, marginHorizontal: ModernTheme.spacing.md }}>
        <ThemedText
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: ModernTheme.colors.neutral.charcoal,
            textAlign: 'center',
          }}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            style={{
              fontSize: 12,
              color: ModernTheme.colors.neutral.dark_gray,
              textAlign: 'center',
              marginTop: ModernTheme.spacing.xs,
              opacity: 0.7,
            }}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>

      {/* Right Icon */}
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} activeOpacity={0.7}>
          <IconSymbol
            name={rightIcon}
            size={24}
            color={ModernTheme.colors.primary.dark}
          />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  );
}
