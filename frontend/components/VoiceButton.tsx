import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface VoiceButtonProps {
  onResult: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  style?: any;
}

export function VoiceButton({ onResult, onError, disabled, style }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission] = useState<boolean | null>(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const startListening = async () => {
    try {
      setIsRecording(true);
      
      // Simulate speech recognition: after short delay, emit sample text
      await new Promise(resolve => setTimeout(resolve, 1200));
      const simulatedText = 'This is a simulated voice input';
      onResult(simulatedText);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onError?.('Failed to start speech recognition');
    } finally {
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    // No-op for simulated input
    setIsRecording(false);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
        isRecording && styles.recording,
        { backgroundColor: isRecording ? colors.tint + '33' : 'transparent' }
      ]}
      onPressIn={startListening}
      onPressOut={stopListening}
      disabled={disabled === true}
      activeOpacity={0.7}
    >
      <IconSymbol
        name="mic"
        size={24}
        color={isRecording ? colors.tint : colors.text}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    borderWidth: 2,
    borderColor: 'red',
  },
});
