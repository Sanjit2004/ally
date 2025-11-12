import { formatConversation, sendChatRequest } from '@/api/chat';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { VoiceButton } from '@/components/VoiceButton';
import { Colors, PrimaryColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addMemory, getMemories } from '@/store/memory';
import { useUserProfileStore } from '@/store/userProfileStore';
import { logMemorySaved, logMessageSent, logTtsToggled } from '@/utils/analytics';
import { isRepetition, loadConversation, saveMessage, summarizeConversation } from '@/utils/conversationStorage';
import { setupNotificationResponseListener } from '@/utils/notifications';
import { buildSystemPrompt } from '@/utils/systemPrompt';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// NOTE: Styles are now defined *once* at the top.
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  messagesList: {
    padding: 20,
    paddingBottom: 120,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  userMessage: {
    borderBottomRightRadius: 6,
  },
  botMessage: {
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    paddingHorizontal: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 56,
  },
  // ADDED MISSING STYLES HERE
  voiceButton: {
    marginRight: 8,
  },
  ttsButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  // END OF ADDED STYLES
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 20,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 16,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  therapistModeButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
});

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Get top memories for API context
async function getTopMemories(count: number = 3): Promise<string> {
  try {
    const memories = await getMemories();
    return memories.slice(0, count).map(m => m.content).join('; ') || '';
  } catch (error) {
    console.error('Error getting memories:', error);
    return '';
  }
}

export default function ChatScreen() {
  const { userProfile } = useUserProfileStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: userProfile 
        ? `Hello ${userProfile.displayName}! I'm your chat assistant. How can I help you today?`
        : 'Hello! I\'m your chat assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [therapistMode, setTherapistMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Load past conversations and set up notification listener
  useEffect(() => {
    const loadPastConversations = async () => {
      if (userProfile?.displayName) {
        const pastMessages = await loadConversation(userProfile.displayName);
        if (pastMessages.length > 0) {
          // Convert stored messages to Message format
          const convertedMessages = pastMessages.map((m) => ({
            id: `${m.timestamp}`,
            text: m.text,
            isUser: m.sender === 'user',
            timestamp: new Date(m.timestamp),
          }));
          setMessages(convertedMessages);
        }
      }
    };

    loadPastConversations();

    // Set up notification response listener
    const unsubscribe = setupNotificationResponseListener();
    return unsubscribe;
  }, [userProfile?.displayName]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessageText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Save user message to storage
      if (userProfile?.displayName) {
        await saveMessage(userProfile.displayName, {
          id: userMessage.id,
          sender: 'user',
          text: userMessageText,
          timestamp: userMessage.timestamp.getTime(),
        });
      }

      // Log message sent
      logMessageSent(userProfile?.displayName || 'unknown', userMessageText.length);

      // Build system prompt from user profile with therapist mode
      const systemPrompt = await buildSystemPrompt(userProfile, therapistMode);

      // Get last 6 conversation messages (excluding the initial greeting)
      const recentMessages = messages.slice(-6);
      const conversation = formatConversation([
        ...recentMessages.map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.text,
        })),
        { role: 'user' as const, content: userMessageText },
      ]);

      // Get top 3 memory items
      const memory = await getTopMemories(3);
      const memoryContext = memory || undefined;

      // Call API with therapist mode flag
      const response = await sendChatRequest(systemPrompt, conversation, memoryContext, therapistMode);

      // Check for repetition in last 3 assistant replies
      const lastAssistantReplies = messages
        .filter((m) => !m.isUser)
        .slice(-3)
        .map((m) => m.text);

      if (isRepetition(response.message, lastAssistantReplies)) {
        console.warn('Repetitive response detected, requesting variation');
        // Could regenerate here, but for now just log
      }

      // Add response to messages
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Save assistant message to storage
      if (userProfile?.displayName) {
        await saveMessage(userProfile.displayName, {
          id: botMessage.id,
          sender: 'assistant',
          text: response.message,
          timestamp: botMessage.timestamp.getTime(),
        });
      }

      // Speak the response if TTS is enabled
      if (ttsEnabled && response.message) {
        Speech.speak(response.message, {
          language: 'en-US',
          rate: 0.9,
          pitch: 1.1,
          onDone: () => console.log('Finished speaking'),
          onError: (error) => console.error('Speech error:', error),
        });
      }

      // Check if conversation is long and needs summarization
      if (messages.length > 50) {
        const summary = summarizeConversation(
          messages.map((m) => ({
            id: m.id,
            sender: m.isUser ? 'user' : 'assistant',
            text: m.text,
            timestamp: m.timestamp.getTime(),
          }))
        );
        if (summary) {
          await addMemory(summary);
        }
      }

      // Save memory if API indicates we should
      if (response.shouldSaveMemory && response.memoryBlob) {
        try {
          await addMemory(response.memoryBlob);
          logMemorySaved(userProfile?.displayName || 'unknown', response.memoryBlob.length);
          console.log('Memory saved:', response.memoryBlob.substring(0, 50));
        } catch (error) {
          console.error('Error saving memory:', error);
        }
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to get response. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.isUser;
    const bubbleColor = isUser 
      ? colors.tint 
      : (colorScheme === 'dark' ? colors.surface : PrimaryColors.surface);
    const textColor = isUser ? '#ffffff' : (colorScheme === 'dark' ? colors.text : PrimaryColors.textPrimary);
    
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={[styles.avatarContainer, { backgroundColor: colors.tint + '20' }]}>
            <IconSymbol name="sparkles" size={20} color={colors.tint} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessage : styles.botMessage,
            { backgroundColor: bubbleColor },
            isUser && { shadowColor: colors.tint },
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              { color: textColor },
            ]}
          >
            {item.text}
          </ThemedText>
          <Text style={[styles.timestamp, { color: isUser ? '#ffffff99' : (colorScheme === 'dark' ? '#888' : '#999') }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        {isUser && (
          <View style={[styles.avatarContainer, { backgroundColor: colors.tint }]}>
            <IconSymbol name="person.fill" size={16} color="#ffffff" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Modern Header with Gradient Effect */}
        <ThemedView style={[styles.header, { 
          backgroundColor: colors.surface,
          borderBottomColor: colorScheme === 'dark' ? '#2a2a2a' : '#E5E7EB',
        }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: colors.tint + '15' }]}>
              <IconSymbol name="sparkles" size={24} color={colors.tint} />
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText type="defaultSemiBold" style={styles.headerSubtitle}>
                {userProfile ? 'Your Ally' : 'Chat Assistant'}
              </ThemedText>
              <ThemedText type="title" style={styles.headerTitle}>
                {userProfile ? userProfile.displayName : 'Welcome'}
              </ThemedText>
            </View>
            <View style={styles.headerControls}>
              <TouchableOpacity
                style={[
                  styles.therapistModeButton,
                  {
                    borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                  },
                ]}
                onPress={() => router.push('/CallScreen')}
              >
                <IconSymbol
                  name="phone.fill"
                  size={20}
                  color={colors.tint}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.therapistModeButton,
                  {
                    borderColor: therapistMode ? colors.tint : (colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB'),
                    backgroundColor: therapistMode ? colors.tint + '15' : 'transparent',
                  },
                ]}
                onPress={() => {
                  setTherapistMode(!therapistMode);
                  logTtsToggled(userProfile?.displayName || 'unknown', !therapistMode);
                }}
              >
                <IconSymbol
                  name={therapistMode ? 'heart.fill' : 'heart'}
                  size={20}
                  color={therapistMode ? colors.tint : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.tint + '15' }]}>
                <IconSymbol name="bubble.left.and.bubble.right" size={40} color={colors.tint} />
              </View>
              <ThemedText style={styles.emptyText}>Start a conversation</ThemedText>
              <ThemedText style={styles.emptySubtext}>I'm here to listen and support you</ThemedText>
            </View>
          }
        />

        {/* Modern Input Container */}
        <ThemedView style={[styles.inputContainer, {
          backgroundColor: 'transparent',
          borderTopColor: 'transparent',
        }]}>
          <View style={[styles.inputWrapper, {
            backgroundColor: colors.background,
            borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
          }]}>
            <VoiceButton
              onResult={(text) => {
                setInputText(prev => prev ? `${prev} ${text}` : text);
              }}
              onError={(error) => {
                console.error('Voice input error:', error);
                Alert.alert('Voice Input Error', error);
              }}
              style={styles.voiceButton}
            />
            <TextInput
              style={[
                styles.input,
                { color: colors.text },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
              multiline
            />
            <TouchableOpacity
              style={[styles.ttsButton, { 
                borderColor: ttsEnabled ? colors.tint : (colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB') 
              }]}
              onPress={() => setTtsEnabled(!ttsEnabled)}
            >
              <IconSymbol
                name={ttsEnabled ? 'volume.2' : 'volume.x'}
                size={20}
                color={ttsEnabled ? colors.tint : colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, { 
                backgroundColor: inputText.trim() ? colors.tint : (colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB'),
                opacity: inputText.trim() ? 1 : 0.7
              }]}
              onPress={handleSend}
              disabled={isLoading || inputText.trim() === ''}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <IconSymbol name="arrow.up" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// All duplicated styles below this line have been removed.