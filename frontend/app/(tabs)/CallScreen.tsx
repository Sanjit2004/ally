import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, PrimaryColors } from '@/constants/theme';
import { FLOATING_TAB_BAR_OFFSET } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserProfileStore } from '@/store/userProfileStore';
import { logMessageSent } from '@/utils/analytics';
import { saveMessage } from '@/utils/conversationStorage';
import { getTTSParametersForMood, loadMoodState, updateMoodFromUserSentiment } from '@/utils/moodEngine';
import { buildSystemPrompt } from '@/utils/systemPrompt';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendChatRequest } from '../../../api/chat';

interface CallState {
  isActive: boolean;
  isMuted: boolean;
  isListening: boolean;
  currentTranscript: string;
  allyResponse: string;
  callDuration: number;
}

export default function CallScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const navigation = useNavigation();
  const { userProfile } = useUserProfileStore();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 16);
  const bottomPadding = bottomInset + FLOATING_TAB_BAR_OFFSET;
  
  const [callState, setCallState] = useState<CallState>({
    isActive: true,
    isMuted: false,
    isListening: false,
    currentTranscript: '',
    allyResponse: '',
    callDuration: 0,
  });
  
  const [wavePhase, setWavePhase] = useState(0);
  const callDurationInterval = useRef<NodeJS.Timeout | null>(null);
  const waveAnimationInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize call
  useEffect(() => {
    startCall();
    
    return () => {
      if (callDurationInterval.current) clearInterval(callDurationInterval.current);
      if (waveAnimationInterval.current) clearInterval(waveAnimationInterval.current);
      Speech.stop?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update call duration
  useEffect(() => {
    callDurationInterval.current = setInterval(() => {
      setCallState(prev => ({
        ...prev,
        callDuration: prev.callDuration + 1,
      }));
    }, 1000) as unknown as NodeJS.Timeout;

    return () => {
      if (callDurationInterval.current) clearInterval(callDurationInterval.current);
    };
  }, []);

  // Wave animation
  useEffect(() => {
    waveAnimationInterval.current = setInterval(() => {
      setWavePhase(prev => (prev + 1) % 360);
    }, 50) as unknown as NodeJS.Timeout;

    return () => {
      if (waveAnimationInterval.current) clearInterval(waveAnimationInterval.current);
    };
  }, []);

  const startCall = async () => {
    try {
      // Greet user
      const greeting = `Hello ${userProfile?.displayName || 'there'}! I'm ready to chat. How are you doing today?`;
      
      // Get mood-adjusted TTS parameters
      const mood = await loadMoodState();
      const ttsParams = getTTSParametersForMood(mood.currentMood);
      
      // Speak greeting
      await Speech.speak(greeting, {
        language: 'en-US',
        rate: ttsParams.rate,
        pitch: ttsParams.pitch,
      });
      
      setCallState(prev => ({
        ...prev,
        allyResponse: greeting,
      }));
    } catch (error) {
      console.error('Error starting call:', error);
      Alert.alert('Error', 'Failed to start call');
    }
  };

  const handleUserInput = async (transcript: string) => {
    if (!transcript.trim()) return;

    try {
      setCallState(prev => ({
        ...prev,
        isListening: false,
        currentTranscript: transcript,
      }));

      // Update mood based on user sentiment
      const moodState = await updateMoodFromUserSentiment(transcript);
      
      // Save user message
      const userId = userProfile?.displayName || 'unknown';
      await saveMessage(userId, {
        id: `msg_${Date.now()}`,
        sender: 'user',
        text: transcript,
        timestamp: Date.now(),
      });

      logMessageSent(userId, transcript.length);

      // Get AI response
      const systemPrompt = await buildSystemPrompt(userProfile);
      const response = await sendChatRequest(
        systemPrompt,
        [{ role: 'user', content: transcript }]
      );

      // Save assistant message
      await saveMessage(userId, {
        id: `msg_${Date.now() + 1}`,
        sender: 'assistant',
        text: response.message,
        timestamp: Date.now(),
      });

      // Get mood-adjusted TTS parameters
      const ttsParams = getTTSParametersForMood(moodState.currentMood);

      // Speak response
      await Speech.speak(response.message, {
        language: 'en-US',
        rate: ttsParams.rate,
        pitch: ttsParams.pitch,
      });

      setCallState(prev => ({
        ...prev,
        allyResponse: response.message,
      }));
    } catch (error) {
      console.error('Error processing user input:', error);
      Alert.alert('Error', 'Failed to process your message');
    }
  };

  const toggleMute = () => {
    setCallState(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
    
    if (callState.isMuted) {
      Speech.resume?.();
    } else {
      Speech.pause?.();
    }
  };

  const endCall = () => {
    Speech.stop();
    if (callDurationInterval.current) clearInterval(callDurationInterval.current);
    if (waveAnimationInterval.current) clearInterval(waveAnimationInterval.current);
    
    navigation.goBack?.();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Wave animation component
  const WaveAnimation = () => {
    const waves = [0, 1, 2];
    return (
      <View style={styles.waveContainer}>
        {waves.map((index) => {
          const scale = 1 + (index * 0.3) + (Math.sin((wavePhase + index * 120) * Math.PI / 180) * 0.2);
          const opacity = 1 - (index * 0.25);
          
          return (
            <View
              key={index}
              style={[
                styles.wavePulse,
                {
                  transform: [{ scale }],
                  opacity,
                  borderColor: colors.tint,
                },
              ]}
            />
          );
        })}
        <View
          style={[
            styles.waveCenter,
            { backgroundColor: colors.tint },
          ]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background, paddingBottom: bottomPadding }]}
    > 
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={endCall}>
          <IconSymbol name="xmark.circle.fill" size={24} color={PrimaryColors.textSecondary} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>Voice Call</ThemedText>
        <ThemedText style={styles.duration}>{formatDuration(callState.callDuration)}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {/* Wave Animation */}
        <WaveAnimation />

        {/* Ally Name */}
        <ThemedText type="title" style={styles.allyName}>Ally</ThemedText>
        <ThemedText style={styles.status}>
          {callState.isListening ? 'Listening...' : 'Connected'}
        </ThemedText>

        {/* Current Transcript */}
        {callState.currentTranscript && (
          <View style={[styles.transcriptBox, { backgroundColor: colors.surface }]}>
            <ThemedText style={styles.transcriptLabel}>You said:</ThemedText>
            <ThemedText style={styles.transcriptText}>{callState.currentTranscript}</ThemedText>
          </View>
        )}

        {/* Ally Response */}
        {callState.allyResponse && (
          <View style={[styles.responseBox, { backgroundColor: colors.surface }]}>
            <ThemedText style={styles.responseLabel}>Ally:</ThemedText>
            <ThemedText style={styles.responseText}>{callState.allyResponse}</ThemedText>
          </View>
        )}

        {/* Loading Indicator */}
        {callState.isListening && (
          <ActivityIndicator size="large" color={colors.tint} style={styles.loader} />
        )}
      </ThemedView>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: bottomInset }]}> 
        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: callState.isMuted ? colors.error : colors.tint,
            },
          ]}
          onPress={toggleMute}
        >
          <IconSymbol
            name={callState.isMuted ? 'mic.slash' : 'mic'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.error }]}
          onPress={endCall}
        >
          <IconSymbol name="phone.down" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.tint }]}
          onPress={() => {
            setCallState(prev => ({
              ...prev,
              isListening: !prev.isListening,
            }));
            // In a real app, this would trigger speech recognition
            if (!callState.isListening) {
              // Simulate user input for demo
              setTimeout(() => {
                handleUserInput('I\'m doing well, thank you for asking!');
              }, 2000);
            }
          }}
        >
          <IconSymbol
            name={callState.isListening ? 'waveform' : 'waveform.circle'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  duration: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  waveContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  wavePulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  waveCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  allyName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 32,
  },
  transcriptBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
  },
  responseBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loader: {
    marginTop: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
