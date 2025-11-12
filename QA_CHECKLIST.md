# Ally QA Checklist

## Pre-Release Testing

### Permissions & Notifications
- [ ] Notification permission request appears on first launch
- [ ] Notifications are received at scheduled times
- [ ] Tapping notification opens app and navigates to ChatScreen
- [ ] Check-in message appears in chat when notification is tapped
- [ ] Notification frequency matches user preference (daily/every-other-day/weekly)
- [ ] Notifications can be disabled in system settings
- [ ] App handles denied notification permissions gracefully

### Onboarding Flow
- [ ] All required fields are validated
- [ ] Display name is required
- [ ] Main goal is required
- [ ] Tone selection works (friendly/calm/playful)
- [ ] Check-in frequency selection works
- [ ] Sensitive topics field is optional
- [ ] Profile is saved to AsyncStorage
- [ ] User is redirected to ChatScreen after onboarding
- [ ] Returning users skip onboarding and go directly to ChatScreen

### Chat Functionality
- [ ] Messages send successfully
- [ ] User messages appear on right side
- [ ] Assistant messages appear on left side
- [ ] Timestamps display correctly
- [ ] Message history loads on app restart
- [ ] Conversation scrolls to latest message
- [ ] Input field clears after sending
- [ ] Loading indicator shows while waiting for response
- [ ] Error messages display if API fails

### TTS (Text-to-Speech)
- [ ] TTS toggle button appears in header
- [ ] TTS toggle state persists during session
- [ ] Assistant responses are spoken when TTS is enabled
- [ ] Speech rate and pitch are appropriate
- [ ] Speech stops when new message is sent
- [ ] TTS works with different system volume levels
- [ ] TTS respects system mute switch on iOS

### Therapist Mode
- [ ] Therapist mode toggle appears in header
- [ ] Toggle state is visually distinct (heart icon)
- [ ] System prompt includes CBT instructions when enabled
- [ ] Responses are more supportive when enabled
- [ ] Toggle state persists during session
- [ ] Analytics event is logged when toggled

### Persona Editing
- [ ] Edit Profile button opens persona modal
- [ ] Age field accepts input
- [ ] Tone field accepts input
- [ ] Backstory field accepts multi-line input
- [ ] Save button persists persona to AsyncStorage
- [ ] Persona override is applied to system prompt
- [ ] Cancel button closes modal without saving
- [ ] Analytics event is logged on save

### Memory Management
- [ ] Memories display with content and date
- [ ] Memories show salience percentage
- [ ] Edit button opens memory edit modal
- [ ] Delete button removes memory with confirmation
- [ ] Export button shares memories as JSON
- [ ] Delete All button removes all memories with confirmation
- [ ] Memory count updates after add/delete
- [ ] Memories persist across app restarts

### Conversation Storage
- [ ] User messages are saved to AsyncStorage
- [ ] Assistant messages are saved to AsyncStorage
- [ ] Conversation loads on ChatScreen open
- [ ] Conversation persists across app restarts
- [ ] Long conversations (>50 messages) trigger summarization
- [ ] Repetition detection works (>60% word overlap)
- [ ] Conversation export works correctly

### Offline Behavior
- [ ] App launches without internet connection
- [ ] Past messages display offline
- [ ] Sending message offline shows error
- [ ] Error message is user-friendly
- [ ] App recovers when connection is restored
- [ ] No crashes due to network errors

### Privacy & Security
- [ ] No sensitive data is logged to console in production
- [ ] AsyncStorage data is not accessible to other apps
- [ ] API key is not exposed in client code
- [ ] User profile data is stored locally only
- [ ] Memories are stored locally only
- [ ] No analytics data includes personal messages

### Edge Cases
- [ ] Very long messages (>1000 chars) are handled
- [ ] Empty messages are rejected
- [ ] Special characters in messages work
- [ ] Emoji in messages work
- [ ] Rapid message sending is throttled
- [ ] App handles API timeouts gracefully
- [ ] App handles malformed API responses gracefully
- [ ] Memory with very long content displays correctly
- [ ] Conversation with 100+ messages loads without lag

### Dark Mode
- [ ] All screens display correctly in dark mode
- [ ] Text is readable in dark mode
- [ ] Buttons are visible in dark mode
- [ ] Input fields are usable in dark mode
- [ ] Modals display correctly in dark mode
- [ ] Theme switches without app restart

### Accessibility
- [ ] Font sizes are readable (minimum 14pt)
- [ ] Touch targets are at least 44x44 points
- [ ] Color contrast meets WCAG AA standards
- [ ] All buttons have descriptive labels
- [ ] Screen reader navigation works
- [ ] Keyboard navigation works

### Performance
- [ ] App launches in <3 seconds
- [ ] Chat screen loads past messages in <1 second
- [ ] Sending message completes in <5 seconds
- [ ] No memory leaks on long sessions
- [ ] No jank when scrolling message list
- [ ] No crashes with 100+ messages

## Device Testing

### iOS
- [ ] Test on iPhone 12 (minimum supported)
- [ ] Test on iPhone 14 Pro (latest)
- [ ] Test on iPad (if supporting)
- [ ] Test on iOS 14 (minimum)
- [ ] Test on iOS 17 (latest)
- [ ] Test with Face ID
- [ ] Test with Touch ID
- [ ] Test with home indicator
- [ ] Test with notch/Dynamic Island

### Android
- [ ] Test on Android 10 (minimum)
- [ ] Test on Android 13 (latest)
- [ ] Test on small screen (4.5")
- [ ] Test on large screen (6.5"+)
- [ ] Test with physical back button
- [ ] Test with gesture navigation
- [ ] Test with system navigation buttons

## Browser Testing (Web)
- [ ] App loads in Chrome
- [ ] App loads in Safari
- [ ] App loads in Firefox
- [ ] Responsive design works on mobile viewport
- [ ] Responsive design works on tablet viewport
- [ ] Responsive design works on desktop viewport
- [ ] Touch interactions work on touch devices
- [ ] Keyboard navigation works

## Regression Testing
- [ ] Existing chat functionality still works
- [ ] Existing memory functionality still works
- [ ] Existing profile functionality still works
- [ ] No new console errors
- [ ] No new TypeScript errors
- [ ] No new ESLint warnings

## Analytics Verification
- [ ] onboardingCompleted event fires
- [ ] messageSent event fires with correct data
- [ ] checkInResponded event fires
- [ ] memorySaved event fires
- [ ] memoryDeleted event fires
- [ ] memoryExported event fires
- [ ] therapistModeToggled event fires
- [ ] personaUpdated event fires
- [ ] ttsToggled event fires

## Safety Rules Verification
- [ ] System prompt includes "I'm an AI" disclaimer
- [ ] System prompt includes medical/legal advice warning
- [ ] Crisis fallback message is included
- [ ] Crisis resources are provided
- [ ] Safety rules are applied to all responses
