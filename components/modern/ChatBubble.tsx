import React from 'react';
import { View, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import ModernTheme from '@/constants/modernTheme';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  mood?: string;
  style?: ViewStyle;
}

export default function ChatBubble({
  message,
  isUser,
  timestamp,
  mood = 'neutral',
  style,
}: ChatBubbleProps) {
  const getMoodColor = () => {
    const moodColors = {
      happy: ModernTheme.colors.mood.happy.main,
      energetic: ModernTheme.colors.mood.energetic.main,
      neutral: ModernTheme.colors.mood.neutral.main,
      calm: ModernTheme.colors.mood.calm.main,
      sad: ModernTheme.colors.mood.sad.main,
    };
    return moodColors[mood as keyof typeof moodColors] || ModernTheme.colors.mood.neutral.main;
  };

  const getBubbleStyle = (): ViewStyle => {
    if (isUser) {
      return {
        backgroundColor: ModernTheme.colors.primary.main,
        borderTopLeftRadius: ModernTheme.radius.xl,
        borderTopRightRadius: ModernTheme.radius.xs,
        borderBottomLeftRadius: ModernTheme.radius.xl,
        borderBottomRightRadius: ModernTheme.radius.xl,
        marginLeft: 'auto',
        marginRight: 0,
        ...ModernTheme.shadows.sm,
      };
    } else {
      return {
        backgroundColor: getMoodColor(),
        borderTopLeftRadius: ModernTheme.radius.xs,
        borderTopRightRadius: ModernTheme.radius.xl,
        borderBottomLeftRadius: ModernTheme.radius.xl,
        borderBottomRightRadius: ModernTheme.radius.xl,
        marginRight: 'auto',
        marginLeft: 0,
        ...ModernTheme.shadows.glow_sm,
      };
    }
  };

  const getTextColor = () => {
    if (isUser) {
      return ModernTheme.colors.neutral.charcoal;
    } else {
      return ModernTheme.colors.neutral.charcoal;
    }
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View
      style={[
        {
          maxWidth: '85%',
          marginVertical: ModernTheme.spacing.sm,
          marginHorizontal: ModernTheme.spacing.md,
        },
        style,
      ]}
    >
      <View
        style={[
          {
            paddingVertical: ModernTheme.spacing.md,
            paddingHorizontal: ModernTheme.spacing.lg,
          },
          getBubbleStyle(),
        ]}
      >
        <ThemedText
          style={{
            color: getTextColor(),
            fontSize: 14,
            lineHeight: 20,
            fontWeight: '400',
          }}
        >
          {message}
        </ThemedText>
      </View>
      {timestamp && (
        <ThemedText
          style={{
            fontSize: 11,
            opacity: 0.5,
            marginTop: ModernTheme.spacing.xs,
            marginHorizontal: ModernTheme.spacing.md,
          }}
        >
          {formatTime(timestamp)}
        </ThemedText>
      )}
    </View>
  );
}
