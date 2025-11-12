# Memory System Testing Guide

## Overview
The memory system stores important conversation moments with salience scores for intelligent retrieval.

## Unit Test Steps

### Test 1: Memory Storage (`getMemories`, `addMemory`)

1. **Setup**: Clear existing memories
   ```typescript
   await clearMemories();
   ```

2. **Add Memory**:
   ```typescript
   const memory = await addMemory("User mentioned feeling anxious about work presentation");
   ```
   - Verify memory has: id, content, salience (0-1), timestamp
   - Verify salience is computed automatically

3. **Get Memories**:
   ```typescript
   const memories = await getMemories();
   ```
   - Verify memories array is returned
   - Verify memories are sorted by salience (highest first)
   - Verify timestamps are Date objects

### Test 2: Salience Computation

1. **Test High Salience**:
   ```typescript
   const highSalience = computeSalience(
     "I'm feeling really anxious about my upcoming job interview. This is important to me."
   );
   ```
   - Expected: ~0.6-0.7 (emotional words + good length)

2. **Test Low Salience**:
   ```typescript
   const lowSalience = computeSalience("ok");
   ```
   - Expected: ~0.05-0.1 (very short)

3. **Test Medium Salience**:
   ```typescript
   const mediumSalience = computeSalience(
     "Had a good day today. Feeling better."
   );
   ```
   - Expected: ~0.3-0.4

### Test 3: Pruning Logic (`pruneMemories`)

1. **Add 250 Memories**:
   ```typescript
   for (let i = 0; i < 250; i++) {
     await addMemory(`Test memory ${i}`, 200);
   }
   ```

2. **Verify Pruning**:
   ```typescript
   const memories = await getMemories();
   ```
   - Verify exactly 200 memories remain
   - Verify lowest salience memories were removed
   - Verify highest salience memories were kept

3. **Verify Order**:
   - Memories should be sorted by salience (descending)
   - If salience equal, newer memories first

### Test 4: Update Memory

1. **Update Existing**:
   ```typescript
   const original = await addMemory("Original text");
   const updated = await updateMemory(original.id, "Updated important text");
   ```
   - Verify content changed
   - Verify salience recomputed
   - Verify timestamp updated

### Test 5: Delete Memory

1. **Delete**:
   ```typescript
   const memory = await addMemory("Test memory");
   await deleteMemory(memory.id);
   const memories = await getMemories();
   ```
   - Verify memory no longer in list
   - Verify other memories unchanged

## Integration Test Steps

### Test 6: ChatScreen Memory Integration

1. **Send Message with Memory Save**:
   - Mock API response with `should_save_memory: true` and `memory_blob`
   - Verify memory is saved after API call
   - Check console for "Memory saved" log

2. **Verify Memory Context**:
   - Send multiple messages
   - Verify top 3 memories are sent to API
   - Check API request includes memory parameter

### Test 7: ProfileScreen Memory Display

1. **Load Memories**:
   - Navigate to Profile tab
   - Verify memories load and display
   - Verify salience scores shown

2. **Edit Memory**:
   - Tap edit button on a memory
   - Modify text
   - Save
   - Verify memory updated in list
   - Verify salience recomputed

3. **Delete Memory**:
   - Tap delete button
   - Confirm deletion
   - Verify memory removed from list

## API Response Format Test

### Test 8: API Memory Save Fields

1. **Response with Memory Save**:
   ```json
   {
     "message": "I understand your concern about work stress.",
     "should_save_memory": true,
     "memory_blob": "User expressed concern about work stress and anxiety"
   }
   ```
   - Verify ChatScreen saves memory
   - Verify memory appears in ProfileScreen

2. **Response without Memory Save**:
   ```json
   {
     "message": "Hello!",
     "should_save_memory": false
   }
   ```
   - Verify no memory saved
   - Verify normal chat flow continues

## Edge Cases

### Test 9: Edge Cases

1. **Empty Memory Content**:
   ```typescript
   await addMemory("");
   ```
   - Should handle gracefully (salience = 0)

2. **Very Long Memory**:
   ```typescript
   await addMemory("A".repeat(1000));
   ```
   - Should compute salience correctly
   - Should store successfully

3. **Concurrent Adds**:
   - Add multiple memories rapidly
   - Verify all saved correctly
   - Verify pruning works correctly

4. **Memory Limit**:
   - Add exactly 200 memories
   - Add one more
   - Verify lowest salience removed

## Performance Test

### Test 10: Performance

1. **Load Time**:
   - Measure time to load 200 memories
   - Should be < 100ms

2. **Save Time**:
   - Measure time to add memory
   - Should be < 50ms

3. **Pruning Time**:
   - Measure time to prune 250 → 200
   - Should be < 100ms

## Checklist

- [ ] Memory storage works (add/get)
- [ ] Salience computation accurate
- [ ] Pruning keeps top 200 by salience
- [ ] Update memory works
- [ ] Delete memory works
- [ ] ChatScreen saves memories from API
- [ ] ProfileScreen displays memories
- [ ] Edit memory works
- [ ] Delete from ProfileScreen works
- [ ] Edge cases handled
- [ ] Performance acceptable

## Expected Behavior

- Memories sorted by salience (highest first)
- Automatic pruning at 200 memories
- Salience computed on add/update
- Memories persist across app restarts
- API can trigger memory saves
- User can manage memories in ProfileScreen

