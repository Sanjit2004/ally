# OnboardingScreen Test Checklist

## Component Overview
The OnboardingScreen collects user profile information and saves it to AsyncStorage before navigating to the ChatScreen.

## Test Checklist

### ✅ Form Fields Validation

- [ ] **Display Name Field**
  - [ ] Text input accepts and displays user input
  - [ ] Field is required (shows error if empty on submit)
  - [ ] Auto-capitalization works correctly
  - [ ] Trims whitespace on submit

- [ ] **Preferred Tone (Radio Buttons)**
  - [ ] Three options display: Friendly, Calm, Playful
  - [ ] Only one option can be selected at a time
  - [ ] Default selection is "friendly"
  - [ ] Visual feedback when option is selected
  - [ ] Can change selection after initial choice

- [ ] **Check-in Frequency (Select Options)**
  - [ ] Three options display: Daily, Every Other Day, Weekly
  - [ ] Only one option can be selected at a time
  - [ ] Default selection is "daily"
  - [ ] Visual feedback when option is selected (highlighted)
  - [ ] Can change selection after initial choice

- [ ] **Main Goal Field**
  - [ ] Text area accepts multi-line input
  - [ ] Field is required (shows error if empty on submit)
  - [ ] Text area expands appropriately
  - [ ] Trims whitespace on submit

- [ ] **Sensitive Topics Field**
  - [ ] Text input accepts comma-separated values
  - [ ] Field is optional (can be left empty)
  - [ ] Accepts multiple topics separated by commas
  - [ ] Auto-capitalization is disabled

### ✅ Form Submission

- [ ] **Validation**
  - [ ] Shows error alert if displayName is empty
  - [ ] Shows error alert if mainGoal is empty
  - [ ] Form does not submit if validation fails
  - [ ] Submit button shows "Saving..." during submission

- [ ] **AsyncStorage Save**
  - [ ] Profile data is saved to AsyncStorage with key `@ally_user_profile`
  - [ ] Saved data includes all fields:
    - displayName (trimmed)
    - preferredTone
    - checkInFrequency
    - mainGoal (trimmed)
    - sensitiveTopics (trimmed)
  - [ ] Data is saved as JSON string
  - [ ] Verify saved data structure matches UserProfile interface

- [ ] **Navigation**
  - [ ] After successful save, navigates to `/(tabs)/chat`
  - [ ] Navigation uses `router.replace()` (not push)
  - [ ] No back navigation to onboarding after submission

### ✅ UI/UX

- [ ] **Layout**
  - [ ] Screen is scrollable on smaller devices
  - [ ] Keyboard doesn't cover input fields (KeyboardAvoidingView works)
  - [ ] Safe area is respected (notches, status bar)
  - [ ] Dark mode support works correctly

- [ ] **Styling**
  - [ ] All form fields have consistent styling
  - [ ] Radio buttons have clear visual selection state
  - [ ] Select options have clear visual selection state
  - [ ] Submit button is disabled during submission
  - [ ] Colors adapt to theme (light/dark mode)

- [ ] **Accessibility**
  - [ ] All inputs have proper labels
  - [ ] Placeholder text is visible and helpful
  - [ ] Touch targets are appropriately sized
  - [ ] Error messages are clear and actionable

### ✅ Error Handling

- [ ] **AsyncStorage Errors**
  - [ ] Error alert shown if AsyncStorage save fails
  - [ ] Form remains on screen if save fails
  - [ ] Submit button re-enables if save fails
  - [ ] Error message is user-friendly

### ✅ Data Persistence

- [ ] **Profile Retrieval**
  - [ ] Saved profile can be retrieved from AsyncStorage
  - [ ] Retrieved data matches what was saved
  - [ ] JSON parsing works correctly

### ✅ Edge Cases

- [ ] **Empty Fields**
  - [ ] Handles empty strings correctly
  - [ ] Handles whitespace-only strings correctly

- [ ] **Long Inputs**
  - [ ] Handles very long display names
  - [ ] Handles very long main goals
  - [ ] Handles many sensitive topics

- [ ] **Special Characters**
  - [ ] Handles special characters in text fields
  - [ ] Handles emojis in text fields
  - [ ] JSON encoding/decoding handles all characters

## Quick Test Steps

1. **Basic Flow Test**
   - Fill all required fields
   - Select preferred tone and check-in frequency
   - Add optional sensitive topics
   - Submit form
   - Verify navigation to chat screen
   - Check AsyncStorage for saved data

2. **Validation Test**
   - Try submitting with empty displayName
   - Try submitting with empty mainGoal
   - Verify error alerts appear

3. **Data Persistence Test**
   - Complete onboarding
   - Close and reopen app
   - Verify profile data is still in AsyncStorage

4. **Theme Test**
   - Test in light mode
   - Test in dark mode
   - Verify all UI elements are visible

## Expected AsyncStorage Data Structure

```json
{
  "displayName": "John Doe",
  "preferredTone": "friendly",
  "checkInFrequency": "daily",
  "mainGoal": "Improve mental health",
  "sensitiveTopics": "anxiety, work stress"
}
```

## Notes

- The component uses `router.replace()` to prevent users from going back to onboarding
- All text inputs are trimmed before saving
- The form validates required fields before submission
- AsyncStorage key is `@ally_user_profile`

