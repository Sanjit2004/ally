import React from 'react';
import { View, ViewStyle } from 'react-native';
import ModernTheme from '@/constants/modernTheme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  gradient?: 'primary' | 'secondary' | 'warm' | 'cool' | 'vibrant' | 'dark' | 'happy' | 'energetic' | 'neutral' | 'calm' | 'sad';
  style?: ViewStyle;
}

export default function GradientBackground({
  children,
  gradient = 'primary',
  style,
}: GradientBackgroundProps) {
  const getBackgroundColor = (): string => {
    const colorMap = {
      primary: ModernTheme.colors.primary.light,
      secondary: ModernTheme.colors.secondary.light,
      warm: ModernTheme.colors.accent.light,
      cool: ModernTheme.colors.secondary.light,
      vibrant: ModernTheme.colors.mood.happy.light,
      dark: ModernTheme.colors.dark.bg,
      happy: ModernTheme.colors.mood.happy.light,
      energetic: ModernTheme.colors.mood.energetic.light,
      neutral: ModernTheme.colors.mood.neutral.light,
      calm: ModernTheme.colors.mood.calm.light,
      sad: ModernTheme.colors.mood.sad.light,
    };

    return colorMap[gradient as keyof typeof colorMap] || ModernTheme.colors.primary.light;
  };

  return (
    <View
      style={[
        { flex: 1, backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      {children}
    </View>
  );
}
