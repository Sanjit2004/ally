# API Memory Integration Testing Checklist

## Overview
The ChatScreen now saves memories when the API response includes `should_save_memory: true` and `memory_blob`.

## API Response Format

### Expected Response Structure
```json
{
  "message": "The AI's response text",
  "should_save_memory": true,
  "memory_blob": "User mentioned feeling anxious about work presentation"
}
```

## Testing Checklist

### Test 1: Memory Save from API Response
- [ ] **Setup**: Send a message that triggers memory save
- [ ] **API Response**: Mock or use real API with `should_save_memory: true`
- [ ] **Expected**: 
  - Memory is saved to AsyncStorage
  - Console log shows "Memory saved: [first 50 chars]"
  - Memory appears in ProfileScreen
  - Salience is computed automatically

### Test 2: No Memory Save
- [ ] **Setup**: Send a message with `should_save_memory: false` or missing
- [ ] **Expected**:
  - No memory saved
  - Normal chat flow continues
  - No errors in console

### Test 3: Memory Blob Missing
- [ ] **Setup**: API returns `should_save_memory: true` but no `memory_blob`
- [ ] **Expected**:
  - No memory saved (graceful handling)
  - No errors thrown
  - Chat continues normally

### Test 4: Memory Context in API Request
- [ ] **Setup**: Have 3+ memories saved
- [ ] **Send Message**: Check API request payload
- [ ] **Expected**:
  - `memory` parameter includes top 3 memories
  - Memories are joined with '; '
  - Highest salience memories sent first

### Test 5: Error Handling
- [ ] **Setup**: Simulate memory save failure
- [ ] **Expected**:
  - Error logged to console
  - Chat continues (doesn't crash)
  - User can still send messages

### Test 6: Dev Mode
- [ ] **Setup**: No API key (dev mode)
- [ ] **Expected**:
  - Dev responses don't trigger memory saves
  - `shouldSaveMemory: false` in response
  - No memory saved

## Integration Flow

1. User sends message → ChatScreen
2. ChatScreen calls `sendChatRequest()` with:
   - System prompt (from user profile)
   - Last 6 conversation messages
   - Top 3 memories (if any)
3. API responds with:
   - `message`: Response text
   - `should_save_memory`: Boolean
   - `memory_blob`: String (if should_save_memory is true)
4. ChatScreen checks `shouldSaveMemory`
5. If true and `memoryBlob` exists:
   - Calls `addMemory(memoryBlob)`
   - Memory saved with computed salience
   - Pruning happens if over 200 memories
6. Memory appears in ProfileScreen

## Code Changes Summary

### `/api/chat.ts`
- Added `should_save_memory` and `memory_blob` to `ChatResponse` interface
- Created `ChatResponseWithMemory` interface
- Updated `sendChatRequest()` to return memory save instructions
- Dev mode returns `shouldSaveMemory: false`

### `/app/(tabs)/chat.tsx`
- Imports `addMemory` and `getMemories` from memory store
- Replaced in-memory storage with AsyncStorage-based memory
- Gets top 3 memories for API context
- Saves memory when API indicates `shouldSaveMemory: true`
- Error handling for memory save failures

## Quick Test Commands

```typescript
// Test memory save
const response = await sendChatRequest(
  systemPrompt,
  conversation,
  memory
);
// Check response.shouldSaveMemory and response.memoryBlob

// Verify memory saved
const memories = await getMemories();
// Check memory appears in list
```

## Expected Behavior

- ✅ Memories saved automatically when API indicates
- ✅ Top 3 memories sent with each API request
- ✅ Memories sorted by salience (highest first)
- ✅ Pruning keeps max 200 memories
- ✅ ProfileScreen shows all memories
- ✅ User can edit/delete memories
- ✅ Graceful error handling

