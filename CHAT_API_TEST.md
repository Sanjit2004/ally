# Chat API Integration Test

## Overview
The ChatScreen now integrates with the `/api/chat.ts` wrapper to send real API requests.

## Implementation Details

### API Call Flow
1. User sends a message
2. System builds prompt using `buildSystemPrompt(userProfile)`
3. Gets last 6 conversation messages
4. Gets top 3 memory items (if any)
5. Calls `sendChatRequest(systemPrompt, conversation, memory)`
6. Displays response in UI

### Request Payload
```typescript
{
  system_prompt: string,  // From buildSystemPrompt(userProfile)
  conversation: [
    { role: 'user' | 'assistant', content: string },
    // Last 6 messages
  ],
  memory?: string  // Top 3 memory items joined with '; '
}
```

## Testing

### Test 1: Dev Mode (No API Key)
1. **Setup**: Don't set `MODEL_API_KEY`
2. **Expected**: 
   - Console warning: "MODEL_API_KEY not found. Running in dev mode..."
   - Returns canned responses based on message content
   - UI shows loading indicator, then response

### Test 2: With API Key
1. **Setup**: Set both `MODEL_API_URL` and `MODEL_API_KEY`
2. **Expected**:
   - Makes real API call
   - Sends system prompt, conversation, and memory
   - Displays API response in chat

### Test 3: Error Handling
1. **Setup**: Set invalid API URL or key
2. **Expected**:
   - Shows error alert
   - Doesn't crash the app
   - User can try again

### Test 4: Memory Storage
1. **Action**: Send multiple messages
2. **Expected**:
   - Memory stores last 10 interactions
   - Top 3 are sent with each request
   - Format: "user message → response (first 100 chars)"

## Quick Test Checklist

- [ ] Send message without API key → See dev mode response
- [ ] Send message with API key → See real API response
- [ ] Check system prompt includes user profile data
- [ ] Verify last 6 messages are sent
- [ ] Verify memory (top 3) is included after multiple messages
- [ ] Test error handling with invalid API
- [ ] Check loading indicator appears during request
- [ ] Verify input is disabled during loading
- [ ] Test multiple rapid messages (should queue properly)

## Example Test Messages

1. "Hello" → Should get greeting response
2. "How are you?" → Should get appropriate response
3. "Tell me about yourself" → Should get info about Ally
4. Multiple messages → Should see context maintained

## Notes

- Memory is stored in-memory (not persisted)
- In production, implement proper memory management
- System prompt is rebuilt on each message (includes latest user profile)
- Conversation history is limited to last 6 messages for API efficiency

