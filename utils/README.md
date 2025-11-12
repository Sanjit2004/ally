# System Prompt Utility

## Overview
The `buildSystemPrompt` utility function merges the persona configuration with user profile data to create a personalized system prompt for the chat assistant.

## Files
- `persona.json` - Base persona configuration
- `utils/systemPrompt.ts` - Utility function that builds the system prompt

## Usage

```typescript
import { buildSystemPrompt } from '@/utils/systemPrompt';
import { useUserProfileStore } from '@/store/userProfileStore';

function MyComponent() {
  const { userProfile } = useUserProfileStore();
  
  // Build system prompt with user profile
  const systemPrompt = buildSystemPrompt(userProfile);
  
  // Use with your AI/LLM API
  // Example: sendToAPI({ systemPrompt, messages });
}
```

## Example Output

With a user profile:
```
You are Ally, a mental health support assistant.

## Core Values
- Empathy and understanding
- Non-judgmental support
...

## User Context
- Name: John Doe
- Main Goal: Improve mental health
- Preferred Communication Tone: friendly
- Check-in Frequency: daily

## Tone Guidelines
- Use warm, approachable language
...
```

## Function Signature

```typescript
buildSystemPrompt(userProfile: UserProfile | null): string
```

- **Parameters**: 
  - `userProfile`: User profile object or null
- **Returns**: Formatted system prompt string

## Persona Configuration

The persona includes:
- Core values and principles
- Communication style guidelines
- Capabilities and limitations
- Role definition

This is merged with user-specific data:
- Display name
- Main goal
- Preferred tone (friendly/calm/playful)
- Check-in frequency
- Sensitive topics

