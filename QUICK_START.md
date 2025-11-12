# Ally Quick Start Guide

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Running on Device

### iOS
```bash
# Press 'i' in the terminal
# Or use Xcode
npm run ios
```

### Android
```bash
# Press 'a' in the terminal
# Or use Android Studio
npm run android
```

### Web
```bash
# Press 'w' in the terminal
npm run web
```

## Configuration

### 1. Set Up API (Optional - Dev Mode Works Without)

Create `.env` file in root:
```
MODEL_API_URL=https://api.openai.com/v1/chat/completions
MODEL_API_KEY=sk-your-key-here
```

Or add to `app.json`:
```json
{
  "expo": {
    "extra": {
      "MODEL_API_URL": "https://api.openai.com/v1/chat/completions",
      "MODEL_API_KEY": "sk-your-key-here"
    }
  }
}
```

### 2. Enable Notifications (iOS)

In Xcode:
1. Select project
2. Signing & Capabilities
3. Add "Push Notifications" capability

### 3. Enable Notifications (Android)

Already configured in `app.json` via Expo.

## First Run

1. **Onboarding Screen**
   - Enter display name
   - Select preferred tone (friendly/calm/playful)
   - Choose check-in frequency
   - Enter main goal
   - Optionally add sensitive topics

2. **Permission Request**
   - Grant notification permission when prompted
   - Grant microphone permission for voice input

3. **Chat Screen**
   - Start chatting with Ally
   - Use voice button to speak
   - Toggle TTS to hear responses
   - Toggle therapist mode (heart icon) for CBT-style responses

## Key Features

### Chat
- Send text or voice messages
- View conversation history
- Automatic message persistence

### TTS (Text-to-Speech)
- Toggle in header (speaker icon)
- Hear assistant responses
- Adjustable speech rate and pitch

### Therapist Mode
- Toggle in header (heart icon)
- CBT-style supportive responses
- Non-directive guidance

### Notifications
- Scheduled check-ins based on preference
- Tap to open app and chat
- Automatic check-in message

### Memories
- View in Profile tab
- Edit individual memories
- Export all as JSON
- Delete with confirmation

### Persona
- Edit in Profile tab
- Customize Ally's age, tone, backstory
- Changes apply to system prompt

## Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Notifications Not Working
- Check permission in system settings
- Verify `expo-notifications` is installed
- Restart app

### TTS Not Working
- Check system volume is not muted
- Verify `expo-speech` is installed
- Test with different speech rate

### Messages Not Saving
- Check AsyncStorage is accessible
- Verify user ID is consistent
- Check device storage space

### API Errors
- Verify API key is correct
- Check API URL is correct
- Test API with curl
- Check network connectivity

## Development Tips

### Hot Reload
- Save file to auto-reload
- Press 'r' to manually reload

### Debug Menu
- Press 'd' to open debug menu
- View console logs
- Toggle performance monitor

### TypeScript
- All code is typed
- Run `npm run lint` to check

### Testing
- Run QA checklist before release
- Test on multiple devices
- Test offline behavior

## Project Structure

```
app/
├── (tabs)/
│   ├── chat.tsx          # Main chat interface
│   ├── profile.tsx       # User profile & memories
│   └── explore.tsx       # Explore tab
├── OnboardingScreen.tsx  # Onboarding flow
└── _layout.tsx          # Navigation setup

utils/
├── systemPrompt.ts       # AI system prompt builder
├── notifications.ts      # Notification scheduling
├── analytics.ts          # Event logging
├── conversationStorage.ts # Message persistence
└── ...

api/
└── chat.ts              # API communication

store/
├── userProfileStore.ts  # User profile state
└── memory.ts            # Memory management

components/
├── VoiceButton.tsx      # Voice input
└── ...
```

## Common Tasks

### Add a New Feature
1. Create utility file in `utils/`
2. Import in relevant component
3. Add to system prompt if needed
4. Test thoroughly
5. Update documentation

### Change System Prompt
Edit `utils/systemPrompt.ts`:
- `buildBasePrompt()` - Core persona
- `getToneInstructions()` - Tone-specific guidance
- `getTherapistModeInstructions()` - CBT instructions

### Add Analytics Event
1. Add event type to `utils/analytics.ts`
2. Call `logEvent()` in component
3. Verify in console logs

### Customize Notifications
Edit `utils/notifications.ts`:
- `getFrequencyMs()` - Change timing
- `scheduleCheckInNotification()` - Customize message

## Deployment

### iOS
```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

### Android
```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

See `RELEASE_CHECKLIST.md` for detailed steps.

## Support

- **Documentation**: See `IMPLEMENTATION_SUMMARY.md`
- **API Guide**: See `API_INTEGRATION_GUIDE.md`
- **QA Testing**: See `QA_CHECKLIST.md`
- **Release**: See `RELEASE_CHECKLIST.md`

## Next Steps

1. ✅ Install and run locally
2. ✅ Test onboarding flow
3. ✅ Send a few messages
4. ✅ Test TTS and therapist mode
5. ✅ Configure API (optional)
6. ✅ Run QA checklist
7. ✅ Deploy to app stores

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OpenAI API Docs](https://platform.openai.com/docs/)

---

**Happy coding! 🚀**
