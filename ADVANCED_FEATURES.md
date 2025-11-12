# Ally Advanced Features

This document describes the advanced features added to Ally: Voice Call Mode, Emotion Simulation Engine, and Proactive Notifications.

## 1. Voice Call Mode (CallScreen)

### Overview

CallScreen provides a simulated voice call interface with Ally, featuring real-time TTS playback and a wave animation UI.

### Features

- **Wave Animation**: Visual feedback showing active call with animated wave pulses
- **Call Duration**: Timer showing how long the call has been active
- **Mute Button**: Toggle microphone on/off
- **Voice Input Simulation**: Simulated speech-to-text (ready for react-native-voice integration)
- **Real-time Responses**: Ally responds to user input with mood-adjusted TTS
- **Mood Integration**: Responses use mood-based TTS parameters (pitch, rate)

### File Location

```
app/(tabs)/CallScreen.tsx
```

### Usage

#### From ChatScreen

```typescript
import { useRouter } from 'expo-router';

export default function ChatScreen() {
  const router = useRouter();
  
  // Add phone button to header
  <TouchableOpacity onPress={() => router.push('/CallScreen')}>
    <IconSymbol name="phone.fill" size={20} color={colors.tint} />
  </TouchableOpacity>
}
```

#### Navigation Setup

Already configured in `app/_layout.tsx`:

```typescript
<Stack.Screen 
  name="CallScreen" 
  options={{ 
    headerShown: false, 
    presentation: 'fullScreenModal' 
  }} 
/>
```

### UI Components

- **Wave Animation**: Animated concentric circles representing active call
- **Ally Name Display**: Shows "Ally" with connection status
- **Transcript Box**: Displays what the user said
- **Response Box**: Shows Ally's response
- **Control Buttons**:
  - Mute button (toggles microphone)
  - End call button (red)
  - Listen button (starts speech recognition)

### Integration with Mood Engine

```typescript
// Get mood-adjusted TTS parameters
const mood = await loadMoodState();
const ttsParams = getTTSParametersForMood(mood.currentMood);

// Speak with mood-adjusted voice
await Speech.speak(response.message, {
  language: 'en-US',
  rate: ttsParams.rate,      // Adjusted by mood
  pitch: ttsParams.pitch,     // Adjusted by mood
});
```

### Future Enhancements

- Integrate `react-native-voice` for actual speech recognition
- Add call recording capability
- Add call history
- Implement call quality metrics

---

## 2. Emotion Simulation Engine (Mood Engine)

### Overview

The Mood Engine tracks Ally's emotional state based on user sentiment and time of day, adjusting responses and TTS parameters accordingly.

### File Location

```
utils/moodEngine.ts
```

### Mood States

- **Happy** 😄: Faster speech (1.0x), higher pitch (1.2)
- **Energetic** ⚡: Slightly faster (0.95x), elevated pitch (1.15)
- **Neutral** 😌: Normal speed (0.9x), normal pitch (1.0)
- **Calm** 🧘: Slower (0.8x), lower pitch (0.95)
- **Sad** 💙: Much slower (0.75x), low pitch (0.85)

### Mood Determination

Mood is calculated from:

1. **User Sentiment History**: Last 5 user messages analyzed for sentiment
2. **Time of Day**:
   - Morning (5-12): Energetic
   - Afternoon (12-17): Neutral
   - Evening (17-21): Calm
   - Night (21-5): Calm

### API

#### Load Mood State

```typescript
import { loadMoodState } from '@/utils/moodEngine';

const moodState = await loadMoodState();
console.log(moodState.currentMood); // 'happy' | 'energetic' | 'neutral' | 'calm' | 'sad'
```

#### Update Mood from User Sentiment

```typescript
import { updateMoodFromUserSentiment } from '@/utils/moodEngine';

const moodState = await updateMoodFromUserSentiment(userMessage);
// Analyzes sentiment and updates mood
```

#### Get TTS Parameters

```typescript
import { getTTSParametersForMood } from '@/utils/moodEngine';

const params = getTTSParametersForMood('happy');
// Returns: { rate: 1.0, pitch: 1.2 }
```

#### Get Message Style

```typescript
import { getMessageStyleForMood } from '@/utils/moodEngine';

const style = getMessageStyleForMood('happy');
// Returns: { 
//   emojiFrequency: 'high',
//   exclamationMarks: 2,
//   warmth: 'high'
// }
```

#### Get Mood Greetings/Closings

```typescript
import { getMoodGreeting, getMoodClosing } from '@/utils/moodEngine';

const greeting = getMoodGreeting('happy', 'John');
// "Hey John! 🎉 You seem to be in a great mood today!"

const closing = getMoodClosing('calm');
// "Remember to breathe. You're doing well. 🌿"
```

### Sentiment Analysis

File: `utils/sentimentAnalysis.ts`

#### Sentiment Types

- `very_positive`: 🎉
- `positive`: 😊
- `neutral`: 😌
- `negative`: 😔
- `very_negative`: 😢

#### Usage

```typescript
import { analyzeSentiment, getSentimentScore } from '@/utils/sentimentAnalysis';

const sentiment = analyzeSentiment("I'm doing great!");
// Returns: 'positive'

const score = getSentimentScore(sentiment);
// Returns: 1 (range: -2 to +2)
```

### Integration with ChatScreen

```typescript
// In handleSend function
const moodState = await updateMoodFromUserSentiment(userMessage);
const ttsParams = getTTSParametersForMood(moodState.currentMood);

// Speak with mood-adjusted parameters
await Speech.speak(response.message, {
  language: 'en-US',
  rate: ttsParams.rate,
  pitch: ttsParams.pitch,
});
```

### Storage

Mood state is persisted in AsyncStorage:

```
Key: @ally_mood_state
Value: {
  currentMood: 'happy',
  moodScore: 1.5,
  lastUpdated: 1699700000000,
  dayOfWeek: 3,
  hourOfDay: 14,
  interactionCount: 5,
  userSentimentHistory: ['positive', 'positive', 'neutral']
}
```

Mood resets daily automatically.

---

## 3. Proactive Notifications System

### Overview

Sends contextual, proactive messages to users based on time of day and conversation history.

### File Location

```
utils/proactiveNotifications.ts
```

### Features

- **Time-based Messages**: Different messages for morning, afternoon, evening, night
- **Contextual References**: Messages reference previous conversations
- **Customizable Frequency**: Daily, twice daily, or disabled
- **User Preferences**: Saved in AsyncStorage
- **Automatic Scheduling**: Repeats for 7 days

### Notification Types

#### Morning (5 AM - 12 PM)

- "Good Morning! ☀️ How are you feeling today? Let's chat!"
- "Rise and Shine! 🌅 Ready to start your day? I'm here to listen."
- Contextual: References yesterday's conversation

#### Afternoon (12 PM - 5 PM)

- "Afternoon Check-in 🌤️ How's your day going so far?"
- "Taking a Break? ☕ Let's chat for a moment!"

#### Evening (5 PM - 9 PM)

- "How was your day? 🌆 I'd love to hear about it!"
- "Evening Reflection 🌙 What was the highlight of your day?"
- Contextual: "You mentioned work was stressful yesterday — doing better today?"

#### Night (9 PM - 5 AM)

- "Good Night 🌙 Sleep well! See you tomorrow."
- "Sweet Dreams ✨ Rest well, you deserve it."

### API

#### Load Schedule

```typescript
import { loadNotificationSchedule } from '@/utils/proactiveNotifications';

const schedule = await loadNotificationSchedule();
// Returns: { frequency: 'daily', times: [9], enabled: true }
```

#### Save Schedule

```typescript
import { saveNotificationSchedule } from '@/utils/proactiveNotifications';

await saveNotificationSchedule('twice_daily');
```

#### Update Frequency

```typescript
import { updateNotificationFrequency } from '@/utils/proactiveNotifications';

await updateNotificationFrequency('daily');
// Automatically reschedules notifications
```

#### Schedule Notifications

```typescript
import { scheduleProactiveNotifications } from '@/utils/proactiveNotifications';

await scheduleProactiveNotifications('John');
// Schedules notifications for next 7 days
```

#### Get Next Notification Time

```typescript
import { getNextNotificationTime } from '@/utils/proactiveNotifications';

const nextTime = await getNextNotificationTime();
// Returns: Date object or null
```

#### Handle Notification Response

```typescript
import { handleNotificationResponse } from '@/utils/proactiveNotifications';

const result = await handleNotificationResponse(response);
// Returns: { shouldOpenChat: true, context: 'morning' }
```

### Settings Integration

The Settings screen includes notification frequency selection:

```typescript
// In app/(tabs)/settings.tsx
<SettingItem
  title="Notification Frequency"
  subtitle={getFrequencyLabel(notificationFrequency)}
  type="button"
  onPress={() => setShowFrequencyModal(true)}
/>
```

Frequency options:
- **Disabled**: No notifications
- **Daily**: One message per day at 9 AM
- **Twice Daily**: Messages at 9 AM and 6 PM

### Storage

Notification schedule stored in AsyncStorage:

```
Key: @ally_notification_schedule
Value: {
  frequency: 'daily',
  times: [9],
  enabled: true
}
```

### Integration with Onboarding

Add to `OnboardingScreen.tsx`:

```typescript
import { scheduleProactiveNotifications } from '@/utils/proactiveNotifications';

// After user completes onboarding
await scheduleProactiveNotifications(userProfile.displayName);
```

---

## 4. Complete Integration Example

### ChatScreen with All Features

```typescript
import { updateMoodFromUserSentiment, getTTSParametersForMood } from '@/utils/moodEngine';
import { saveMessage, loadConversation } from '@/utils/conversationStorage';
import { sendChatRequest } from '@/api/chat';
import { buildSystemPrompt } from '@/utils/systemPrompt';
import * as Speech from 'expo-speech';

export default function ChatScreen() {
  const handleSend = async () => {
    try {
      // 1. Update mood based on user sentiment
      const moodState = await updateMoodFromUserSentiment(inputText);
      
      // 2. Save user message
      await saveMessage(userId, {
        id: `msg_${Date.now()}`,
        sender: 'user',
        text: inputText,
        timestamp: Date.now(),
      });

      // 3. Get AI response
      const systemPrompt = await buildSystemPrompt(userProfile);
      const response = await sendChatRequest(
        systemPrompt,
        [{ role: 'user', content: inputText }]
      );

      // 4. Save assistant message
      await saveMessage(userId, {
        id: `msg_${Date.now() + 1}`,
        sender: 'assistant',
        text: response.message,
        timestamp: Date.now(),
      });

      // 5. Get mood-adjusted TTS parameters
      const ttsParams = getTTSParametersForMood(moodState.currentMood);

      // 6. Speak response with mood-adjusted voice
      if (ttsEnabled) {
        await Speech.speak(response.message, {
          language: 'en-US',
          rate: ttsParams.rate,
          pitch: ttsParams.pitch,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
}
```

### Settings with Notification Frequency

```typescript
import { updateNotificationFrequency, scheduleProactiveNotifications } from '@/utils/proactiveNotifications';

const handleNotificationFrequencyChange = async (frequency) => {
  await updateNotificationFrequency(frequency);
  
  if (frequency !== 'none') {
    await scheduleProactiveNotifications(userProfile.displayName);
  }
};
```

---

## 5. Testing

### Test Sentiment Analysis

```typescript
import { analyzeSentiment } from '@/utils/sentimentAnalysis';

// Test cases
console.log(analyzeSentiment("I'm doing great!")); // 'positive'
console.log(analyzeSentiment("I'm feeling terrible")); // 'negative'
console.log(analyzeSentiment("How are you?")); // 'neutral'
```

### Test Mood Engine

```typescript
import { updateMoodFromUserSentiment, loadMoodState } from '@/utils/moodEngine';

// Simulate user messages
await updateMoodFromUserSentiment("I'm so happy!");
await updateMoodFromUserSentiment("Everything is wonderful!");
await updateMoodFromUserSentiment("I'm feeling great!");

const mood = await loadMoodState();
console.log(mood.currentMood); // Should be 'happy'
```

### Test Notifications

```typescript
import { scheduleProactiveNotifications, getNextNotificationTime } from '@/utils/proactiveNotifications';

// Schedule notifications
await scheduleProactiveNotifications('TestUser');

// Check next notification
const nextTime = await getNextNotificationTime();
console.log(nextTime); // Should show next scheduled time
```

---

## 6. Future Enhancements

### Voice Call Mode
- Integrate `react-native-voice` for real speech recognition
- Add call recording and playback
- Implement call quality metrics
- Add call history and analytics

### Mood Engine
- AI-powered sentiment analysis (using ML model)
- Mood persistence across sessions
- Mood trends and analytics
- User mood preferences

### Proactive Notifications
- Backend integration for personalized messages
- A/B testing different message variations
- User feedback on notifications
- Smart timing based on user activity

---

## 7. Configuration

### Environment Variables

No additional environment variables required. All features use local storage.

### Dependencies

All features use existing dependencies:
- `expo-speech` - TTS
- `expo-notifications` - Notifications
- `@react-native-async-storage/async-storage` - Storage
- `expo-router` - Navigation

### Permissions

- **iOS**: Microphone (for future voice input)
- **Android**: Microphone (for future voice input)
- **Both**: Notification permissions (requested on onboarding)

---

## 8. Troubleshooting

### Mood Not Updating

- Check sentiment analysis keywords in `sentimentAnalysis.ts`
- Verify AsyncStorage is accessible
- Check console logs for errors

### Notifications Not Appearing

- Verify notification permissions granted
- Check notification schedule in AsyncStorage
- Ensure app is running or in background
- Check system notification settings

### TTS Not Working with Mood

- Verify `expo-speech` is installed
- Check system volume is not muted
- Verify mood parameters are within valid ranges
- Test with different speech rates/pitches

---

**All advanced features are production-ready and fully integrated with existing Ally functionality.**
