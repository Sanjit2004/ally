# Ally API Integration Guide

This guide explains how to integrate Ally with real AI models (OpenAI, HuggingFace, or other providers).

## Environment Setup

Create a `.env` file in the root directory with:

```
MODEL_API_URL=https://api.openai.com/v1/chat/completions
MODEL_API_KEY=your_api_key_here
```

Or in `app.json` under `expo.extra`:

```json
{
  "expo": {
    "extra": {
      "MODEL_API_URL": "https://api.openai.com/v1/chat/completions",
      "MODEL_API_KEY": "your_api_key_here"
    }
  }
}
```

## OpenAI Integration

### Setup

1. Get API key from https://platform.openai.com/api-keys
2. Set `MODEL_API_URL=https://api.openai.com/v1/chat/completions`
3. Set `MODEL_API_KEY=sk-...`

### Request Format

```typescript
// Example request body sent to OpenAI
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are Ally, a supportive AI companion..."
    },
    {
      "role": "user",
      "content": "How are you today?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

### Response Format

```typescript
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'm doing well, thank you for asking!"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 20,
    "total_tokens": 70
  }
}
```

### Implementation

Update `/api/chat.ts`:

```typescript
export async function sendChatRequest(
  systemPrompt: string,
  conversation: ChatMessage[],
  memory?: string,
  therapistMode?: boolean
): Promise<ChatResponseWithMemory> {
  const apiUrl = Constants.expoConfig?.extra?.MODEL_API_URL || process.env.MODEL_API_URL;
  const apiKey = Constants.expoConfig?.extra?.MODEL_API_KEY || process.env.MODEL_API_KEY;

  if (!apiKey) {
    console.warn('MODEL_API_KEY not found. Running in dev mode.');
    return { message: getDevModeResponse(conversation), shouldSaveMemory: false };
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversation,
  ];

  const requestBody = {
    model: 'gpt-4',
    messages,
    temperature: therapistMode ? 0.6 : 0.7,
    max_tokens: 500,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content || 'No response';

    return {
      message,
      shouldSaveMemory: message.length > 100,
      memoryBlob: message.length > 100 ? message.substring(0, 200) : undefined,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('API error');
  }
}
```

## HuggingFace Integration

### Setup

1. Get API key from https://huggingface.co/settings/tokens
2. Set `MODEL_API_URL=https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf`
3. Set `MODEL_API_KEY=hf_...`

### Request Format

```typescript
{
  "inputs": "You are Ally, a supportive AI companion...\n\nUser: How are you today?\n\nAssistant:",
  "parameters": {
    "max_new_tokens": 500,
    "temperature": 0.7
  }
}
```

### Response Format

```typescript
[
  {
    "generated_text": "You are Ally...\n\nUser: How are you today?\n\nAssistant: I'm doing well, thank you for asking!"
  }
]
```

### Implementation

```typescript
export async function sendChatRequest(
  systemPrompt: string,
  conversation: ChatMessage[],
  memory?: string,
  therapistMode?: boolean
): Promise<ChatResponseWithMemory> {
  const apiUrl = Constants.expoConfig?.extra?.MODEL_API_URL;
  const apiKey = Constants.expoConfig?.extra?.MODEL_API_KEY;

  if (!apiKey) {
    return { message: getDevModeResponse(conversation), shouldSaveMemory: false };
  }

  // Format conversation as prompt
  let prompt = systemPrompt + '\n\n';
  for (const msg of conversation) {
    const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1);
    prompt += `${role}: ${msg.content}\n\n`;
  }
  prompt += 'Assistant:';

  const requestBody = {
    inputs: prompt,
    parameters: {
      max_new_tokens: 500,
      temperature: therapistMode ? 0.6 : 0.7,
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const fullText = data[0]?.generated_text || '';
    const message = fullText.split('Assistant:').pop()?.trim() || 'No response';

    return {
      message,
      shouldSaveMemory: message.length > 100,
      memoryBlob: message.length > 100 ? message.substring(0, 200) : undefined,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('API error');
  }
}
```

## Streaming Responses (Optional)

For real-time streaming, use fetch with ReadableStream:

```typescript
export async function sendChatRequestStreaming(
  systemPrompt: string,
  conversation: ChatMessage[],
  onChunk: (chunk: string) => void,
  therapistMode?: boolean
): Promise<string> {
  const apiUrl = Constants.expoConfig?.extra?.MODEL_API_URL;
  const apiKey = Constants.expoConfig?.extra?.MODEL_API_KEY;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversation,
  ];

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      stream: true,
      temperature: therapistMode ? 0.6 : 0.7,
    }),
  });

  if (!response.ok) throw new Error('API request failed');

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  let fullMessage = '';
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          const content = json.choices[0]?.delta?.content || '';
          if (content) {
            fullMessage += content;
            onChunk(content);
          }
        } catch (e) {
          // Skip parsing errors
        }
      }
    }
  }

  return fullMessage;
}
```

## Testing

### Dev Mode

The app runs in dev mode when `MODEL_API_KEY` is not set. Responses are canned based on keywords.

### Manual Testing

```bash
# Test OpenAI
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-..." \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Test HuggingFace
curl https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hf_..." \
  -d '{"inputs": "Hello"}'
```

## Cost Estimation

### OpenAI (GPT-4)
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- Average message: ~50 tokens input, ~100 tokens output = ~$0.009 per message

### HuggingFace (Free tier)
- Limited requests per month
- Paid tier: $9/month for unlimited

## Error Handling

The current implementation includes:
- Automatic retry on network errors
- Fallback to dev mode if API fails
- User-friendly error messages
- Logging for debugging

## Next Steps

1. Choose your provider (OpenAI recommended for quality)
2. Get API credentials
3. Update `.env` or `app.json`
4. Update `/api/chat.ts` with your provider's implementation
5. Test thoroughly before deploying
