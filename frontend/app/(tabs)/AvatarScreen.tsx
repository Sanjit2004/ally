import { sendChatRequest } from '@/api/chat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FLOATING_TAB_BAR_OFFSET } from '@/constants/layout';
import { Colors, PrimaryColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserProfileStore } from '@/store/userProfileStore';
import { logMessageSent } from '@/utils/analytics';
import { saveMessage } from '@/utils/conversationStorage';
import { getTTSParametersForMood, loadMoodState, updateMoodFromUserSentiment } from '@/utils/moodEngine';
import { buildSystemPrompt } from '@/utils/systemPrompt';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type InteractionMode = 'text' | 'voice' | 'avatar';

export default function AvatarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userProfile } = useUserProfileStore();
  const insets = useSafeAreaInsets();
  const bottomPadding = FLOATING_TAB_BAR_OFFSET + Math.max(insets.bottom, 16);

  const [mode, setMode] = useState<InteractionMode>('avatar');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMood, setCurrentMood] = useState('neutral');
  const [lastResponse, setLastResponse] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    initializeAvatar();
  }, []);

  const initializeAvatar = async () => {
    try {
      const mood = await loadMoodState();
      setCurrentMood(mood.currentMood);
    } catch (error) {
      console.error('Error initializing avatar:', error);
    }
  };

  const getMoodColor = (mood: string): string => {
    switch (mood) {
      case 'happy':
        return '#FFD700';
      case 'energetic':
        return '#FF6347';
      case 'neutral':
        return '#87CEEB';
      case 'calm':
        return '#98FB98';
      case 'sad':
        return '#4169E1';
      default:
        return '#87CEEB';
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      setIsLoading(true);

      // Update mood based on user sentiment
      const moodState = await updateMoodFromUserSentiment(inputText);
      setCurrentMood(moodState.currentMood);

      // Save user message
      const userId = userProfile?.displayName || 'unknown';
      await saveMessage(userId, {
        id: `msg_${Date.now()}`,
        sender: 'user',
        text: inputText,
        timestamp: Date.now(),
      });

      logMessageSent(userId, inputText.length);

      // Get AI response
      const systemPrompt = await buildSystemPrompt(userProfile);
      const response = await sendChatRequest(systemPrompt, [
        { role: 'user', content: inputText },
      ]);

      // Save assistant message
      await saveMessage(userId, {
        id: `msg_${Date.now() + 1}`,
        sender: 'assistant',
        text: response.message,
        timestamp: Date.now(),
      });

      setLastResponse(response.message);

      // Speak response
      const ttsParams = getTTSParametersForMood(moodState.currentMood);
      await Speech.speak(response.message, {
        language: 'en-US',
        rate: ttsParams.rate,
        pitch: ttsParams.pitch,
        onDone: () => {
          setIsSpeaking(false);
        },
      });

      setIsSpeaking(true);
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to process message');
    } finally {
      setIsLoading(false);
    }
  };

  const SimpleAvatarFallback = () => (
    <View style={[styles.avatarContainer, { backgroundColor: getMoodColor(currentMood) + '20' }]}> 
      <View
        style={[
          styles.avatarCircle,
          {
            borderColor: getMoodColor(currentMood),
            backgroundColor: getMoodColor(currentMood) + '10',
          },
        ]}
      >
        <ThemedText style={styles.avatarEmoji}>
          {currentMood === 'happy' && '😊'}
          {currentMood === 'energetic' && '⚡'}
          {currentMood === 'neutral' && '😌'}
          {currentMood === 'calm' && '🧘'}
          {currentMood === 'sad' && '💙'}
        </ThemedText>
      </View>

      <View style={styles.moodIndicator}>
        <View
          style={[
            styles.moodDot,
            { backgroundColor: getMoodColor(currentMood) },
          ]}
        />
        <ThemedText style={styles.moodText}>
          {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
        </ThemedText>
      </View>

      {isSpeaking && (
        <View style={styles.waveContainer}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.waveLine,
                {
                  backgroundColor: getMoodColor(currentMood),
                  height: 20 + i * 10,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );

  const TextMode = () => (
    <View style={[styles.modeContainer, { paddingBottom: bottomPadding }]}>
      <ScrollView
        style={styles.responseContainer}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {lastResponse ? (
          <ThemedView
            style={[
              styles.responseBox,
              { backgroundColor: colors.surface },
            ]}
          >
            <ThemedText style={styles.responseLabel}>Ally says:</ThemedText>
            <ThemedText style={styles.responseText}>{lastResponse}</ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.emptyResponse}>
            <IconSymbol name="bubble.left" size={40} color={PrimaryColors.textSecondary} />
            <ThemedText style={styles.emptyResponseText}>
              Send a message to see Ally&apos;s response
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surface,
              borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
              color: colors.text,
            },
          ]}
          placeholder="Type your message..."
          placeholderTextColor={PrimaryColors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: colors.tint,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleSendMessage}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );

  const VoiceMode = () => (
    <View style={[styles.modeContainer, { paddingBottom: bottomPadding }]}>
      <View style={styles.voiceContainer}>
        <ThemedText style={styles.voiceLabel}>Voice Mode</ThemedText>
        <ThemedText style={styles.voiceSubtext}>
          Speak naturally to Ally (speech-to-text coming soon)
        </ThemedText>

        <TouchableOpacity
          style={[
            styles.voiceButton,
            {
              backgroundColor: colors.tint,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          disabled={isLoading}
        >
          <IconSymbol name="mic.fill" size={32} color="#fff" />
        </TouchableOpacity>

        <ThemedText style={styles.voiceHint}>
          Tap the microphone to start speaking
        </ThemedText>

        {lastResponse && (
          <ThemedView
            style={[
              styles.responseBox,
              { backgroundColor: colors.surface, marginTop: 20 },
            ]}
          >
            <ThemedText style={styles.responseLabel}>Ally says:</ThemedText>
            <ThemedText style={styles.responseText}>{lastResponse}</ThemedText>
          </ThemedView>
        )}
      </View>
    </View>
  );

  const AvatarMode = () => (
    <View style={[styles.modeContainer, { paddingBottom: bottomPadding }]}>
      <SimpleAvatarFallback />

      <View style={styles.interactionArea}>
        {lastResponse && (
          <ThemedView
            style={[
              styles.responseBox,
              { backgroundColor: colors.surface },
            ]}
          >
            <ThemedText style={styles.responseLabel}>Ally:</ThemedText>
            <ThemedText style={styles.responseText} numberOfLines={3}>
              {lastResponse}
            </ThemedText>
          </ThemedView>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                color: colors.text,
              },
            ]}
            placeholder="Chat with Ally..."
            placeholderTextColor={PrimaryColors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: colors.tint,
                opacity: isLoading ? 0.6 : 1,
              },
            ]}
            onPress={handleSendMessage}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <IconSymbol name="paperplane.fill" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background, paddingBottom: bottomPadding }]}
    >
      {/* Header */}
      <ThemedView
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB',
          },
        ]}
      >
        <ThemedText type="title" style={styles.headerTitle}>
          Avatar Chat
        </ThemedText>
      </ThemedView>

      {/* Mode Tabs */}
      <View style={styles.tabContainer}>
        {(['text', 'voice', 'avatar'] as const).map((tabMode) => (
          <TouchableOpacity
            key={tabMode}
            style={[
              styles.tab,
              {
                borderBottomColor: mode === tabMode ? colors.tint : 'transparent',
                borderBottomWidth: mode === tabMode ? 2 : 0,
              },
            ]}
            onPress={() => setMode(tabMode)}
          >
            <IconSymbol
              name={
                tabMode === 'text'
                  ? 'bubble.left'
                  : tabMode === 'voice'
                    ? 'mic'
                    : 'person'
              }
              size={20}
              color={mode === tabMode ? colors.tint : PrimaryColors.textSecondary}
            />
            <ThemedText
              style={[
                styles.tabLabel,
                {
                  color: mode === tabMode ? colors.tint : PrimaryColors.textSecondary,
                },
              ]}
            >
              {tabMode.charAt(0).toUpperCase() + tabMode.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {mode === 'text' && <TextMode />}
      {mode === 'voice' && <VoiceMode />}
      {mode === 'avatar' && <AvatarMode />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeContainer: {
    flex: 1,
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 20,
    marginBottom: 20,
  },
  lottieAnimation: {
    width: 250,
    height: 250,
  },
  avatarCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarEmoji: {
    fontSize: 80,
  },
  moodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  moodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: 20,
  },
  waveLine: {
    width: 4,
    borderRadius: 2,
  },
  responseContainer: {
    flex: 1,
    marginBottom: 16,
  },
  responseBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyResponse: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyResponseText: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 12,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceLabel: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  voiceSubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 32,
    textAlign: 'center',
  },
  voiceButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  voiceHint: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  interactionArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
