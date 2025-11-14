/**
 * Chat API wrapper for communicating with the AI model
 * 
 * Environment Variables Required:
 * - MODEL_API_URL: The base URL for the model API endpoint
 * - MODEL_API_KEY: API key for authentication (optional for dev mode)
 * 
 * Dev Mode: If MODEL_API_KEY is missing, returns a canned response for development
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  system_prompt: string;
  conversation: ChatMessage[];
  memory?: string;
  therapist_mode?: boolean;
}

interface ChatResponse {
  message: string;
  error?: string;
  should_save_memory?: boolean;
  memory_blob?: string;
}

/**
 * Response from chat API including memory save instructions
 */
export interface ChatResponseWithMemory {
  message: string;
  shouldSaveMemory: boolean;
  memoryBlob?: string;
}

/**
 * Sends a chat request to the model API
 * @param systemPrompt - The system prompt for the AI
 * @param conversation - Array of conversation messages
 * @param memory - Optional memory/context string
 * @param therapistMode - Optional flag for CBT-style supportive responses
 * @returns Promise with the AI's response and memory save instructions
 */
export async function sendChatRequest(
  systemPrompt: string,
  conversation: ChatMessage[],
  memory?: string,
  therapistMode?: boolean
): Promise<ChatResponseWithMemory> {
  const apiUrl = process.env.MODEL_API_URL;
  const apiKey = process.env.MODEL_API_KEY;

  // Dev mode: Return canned response if API key is missing
  if (!apiKey) {
    console.warn('MODEL_API_KEY not found. Running in dev mode with canned response.');
    const devMessage = getDevModeResponse(conversation);
    return {
      message: devMessage,
      shouldSaveMemory: false,
    };
  }

  if (!apiUrl) {
    throw new Error('MODEL_API_URL is not configured. Please set it in your environment variables.');
  }

  const requestBody: ChatRequest = {
    system_prompt: systemPrompt,
    conversation,
    ...(memory && { memory }),
    ...(therapistMode && { therapist_mode: therapistMode }),
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        ...(apiKey && { 'X-API-Key': apiKey }), // Alternative header format
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || 
        errorData.message || 
        `API request failed with status ${response.status}`
      );
    }

    const data: ChatResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      message: data.message || 'I apologize, but I didn\'t receive a valid response.',
      shouldSaveMemory: data.should_save_memory === true,
      memoryBlob: data.memory_blob,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Chat API Error:', error.message);
      throw error;
    }
    throw new Error('An unexpected error occurred while communicating with the API.');
  }
}

/**
 * Returns a canned response for development mode
 * @param conversation - Current conversation messages
 * @returns A development-friendly response
 */
function getDevModeResponse(conversation: ChatMessage[]): string {
  const lastUserMessage = conversation
    .filter(msg => msg.role === 'user')
    .pop()?.content || '';

  const lowerMessage = lastUserMessage.toLowerCase();

  // Simple pattern matching for dev responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello! I\'m here to help. This is a dev mode response. Set MODEL_API_KEY to use the real API.';
  }

  if (lowerMessage.includes('help')) {
    return 'I\'m in development mode right now. To use the real AI, please configure MODEL_API_KEY and MODEL_API_URL in your environment variables.';
  }

  if (lowerMessage.includes('how are you')) {
    return 'I\'m doing well, thank you for asking! (Dev mode response)';
  }

  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return 'Goodbye! Have a great day! (Dev mode)';
  }

  // Default dev response
  return `I understand you said: "${lastUserMessage}". This is a development mode response. To enable the real AI, configure MODEL_API_KEY and MODEL_API_URL.`;
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

