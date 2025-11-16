import Constants from 'expo-constants';

const DEFAULT_API_BASE_URL = 'http://localhost:4000';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AllyBackendRequest {
  message: string;
  userId?: string | null;
  system_prompt?: string;
  conversation?: ChatMessage[];
  memory?: string;
  therapist_mode?: boolean;
}

interface AllyBackendResponse {
  message: string;
  emotion?: string;
  shouldSaveMemory?: boolean;
  memoryBlob?: string;
  error?: string;
}

/**
 * Response from chat API including memory save instructions
 */
export interface ChatResponseWithMemory {
  message: string;
  shouldSaveMemory: boolean;
  memoryBlob?: string | null;
  emotion?: string;
}

export interface SendChatMessageInput {
  message: string;
  userId?: string;
  systemPrompt?: string;
  conversation?: ChatMessage[];
  memory?: string;
  therapistMode?: boolean;
}

export const getApiBaseUrl = (): string => {
  const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
  return process.env.EXPO_PUBLIC_API_BASE_URL || extra?.apiBaseUrl || DEFAULT_API_BASE_URL;
};

/**
 * Sends a chat message through the Ally backend.
 */
export async function sendChatMessage(input: SendChatMessageInput): Promise<ChatResponseWithMemory> {
  const trimmedMessage = input.message?.trim();
  if (!trimmedMessage) {
    throw new Error('Message is required to chat with Ally.');
  }

  const requestPayload: AllyBackendRequest = {
    message: trimmedMessage,
    userId: input.userId ?? null,
    system_prompt: input.systemPrompt,
    conversation: input.conversation,
    memory: input.memory,
    therapist_mode: input.therapistMode,
  };

  const response = await fetch(`${getApiBaseUrl()}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(
      errorPayload.error ||
      errorPayload.message ||
      `Chat request failed with status ${response.status}`
    );
  }

  const data: AllyBackendResponse = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    message: data.message || 'I\'m still listening but need a moment to respond.',
    shouldSaveMemory: data.shouldSaveMemory ?? false,
    memoryBlob: data.memoryBlob ?? null,
    emotion: data.emotion ?? 'supportive',
  };
}

/**
 * Maintains backwards compatibility with the rest of the app by accepting the
 * original arguments and routing them through the backend-powered helper.
 */
export async function sendChatRequest(
  systemPrompt: string,
  conversation: ChatMessage[],
  memory?: string,
  therapistMode?: boolean,
  userId?: string
): Promise<ChatResponseWithMemory> {
  const lastUserMessage = conversation
    .filter((msg) => msg.role === 'user')
    .pop()?.content ?? '';

  return sendChatMessage({
    message: lastUserMessage || 'How are you feeling right now?',
    userId,
    systemPrompt,
    conversation,
    memory,
    therapistMode,
  });
}

/**
 * Helper function to format conversation history for the API
 * @param messages - Array of message objects with role and content
 * @returns Formatted conversation array
 */
export function formatConversation(messages: Array<{ role: 'user' | 'assistant'; content: string }>): ChatMessage[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

