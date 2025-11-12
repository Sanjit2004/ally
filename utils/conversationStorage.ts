import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number; // milliseconds since epoch
}

const CONVERSATIONS_PREFIX = '@ally_conversations:';

/**
 * Get storage key for user's conversations
 */
function getConversationKey(userId: string): string {
  return `${CONVERSATIONS_PREFIX}${userId}`;
}

/**
 * Save a message to conversation storage
 */
export async function saveMessage(
  userId: string,
  message: ConversationMessage
): Promise<void> {
  try {
    const key = getConversationKey(userId);
    const existing = await AsyncStorage.getItem(key);
    const messages: ConversationMessage[] = existing ? JSON.parse(existing) : [];
    messages.push(message);
    await AsyncStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving message:', error);
  }
}

/**
 * Load all messages for a user
 */
export async function loadConversation(userId: string): Promise<ConversationMessage[]> {
  try {
    const key = getConversationKey(userId);
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading conversation:', error);
    return [];
  }
}

/**
 * Clear all messages for a user
 */
export async function clearConversation(userId: string): Promise<void> {
  try {
    const key = getConversationKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing conversation:', error);
  }
}

/**
 * Export conversation as JSON
 */
export async function exportConversation(userId: string): Promise<string> {
  try {
    const messages = await loadConversation(userId);
    return JSON.stringify(messages, null, 2);
  } catch (error) {
    console.error('Error exporting conversation:', error);
    return '[]';
  }
}

/**
 * Summarize conversation for long threads (>50 messages)
 * Returns a short summary string
 */
export function summarizeConversation(messages: ConversationMessage[]): string {
  if (messages.length === 0) return '';

  // Extract key topics from messages
  const userMessages = messages
    .filter((m) => m.sender === 'user')
    .map((m) => m.text);

  if (userMessages.length === 0) return '';

  // Simple summarization: take first and last user message as context
  const firstMessage = userMessages[0].substring(0, 50);
  const lastMessage = userMessages[userMessages.length - 1].substring(0, 50);

  return `Conversation with ${messages.length} messages. Started with: "${firstMessage}..." Latest: "${lastMessage}..."`;
}

/**
 * Check if a reply is repetitive
 * Compares word overlap ratio with last N replies
 * Returns true if overlap > 0.6 (60%)
 */
export function isRepetition(
  newReply: string,
  lastNReplies: string[],
  overlapThreshold: number = 0.6
): boolean {
  if (lastNReplies.length === 0) return false;

  const newWords = new Set(
    newReply
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

  for (const reply of lastNReplies) {
    const replyWords = new Set(
      reply
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

    // Calculate overlap ratio
    const intersection = new Set([...newWords].filter((w) => replyWords.has(w)));
    const union = new Set([...newWords, ...replyWords]);

    const overlapRatio = intersection.size / union.size;

    if (overlapRatio > overlapThreshold) {
      return true;
    }
  }

  return false;
}
