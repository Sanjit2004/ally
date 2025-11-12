# User Profile Store - Usage Guide

## Overview
The app uses Zustand for global state management of the user profile. The profile is automatically loaded from AsyncStorage on app start and can be accessed from any component.

## Store Location
`/store/userProfileStore.ts`

## Store API

### State
- `userProfile: UserProfile | null` - The current user profile
- `isLoading: boolean` - Loading state when reading from AsyncStorage

### Methods
- `loadProfile()` - Loads profile from AsyncStorage
- `saveProfile(profile: UserProfile)` - Saves profile to AsyncStorage and updates state
- `clearProfile()` - Removes profile from AsyncStorage and state

## User Profile Interface

```typescript
interface UserProfile {
  displayName: string;
  preferredTone: 'friendly' | 'calm' | 'playful';
  checkInFrequency: 'daily' | 'every-other-day' | 'weekly';
  mainGoal: string;
  sensitiveTopics: string;
}
```

## How to Use in Components

### Basic Usage

```typescript
import { useUserProfileStore } from '@/store/userProfileStore';

export default function MyComponent() {
  const { userProfile, isLoading } = useUserProfileStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!userProfile) {
    return <NoProfileScreen />;
  }

  return (
    <View>
      <Text>Hello, {userProfile.displayName}!</Text>
      <Text>Preferred Tone: {userProfile.preferredTone}</Text>
    </View>
  );
}
```

### Updating Profile

```typescript
import { useUserProfileStore, UserProfile } from '@/store/userProfileStore';

export default function UpdateProfileScreen() {
  const { saveProfile } = useUserProfileStore();

  const handleSave = async () => {
    const newProfile: UserProfile = {
      displayName: 'John Doe',
      preferredTone: 'friendly',
      checkInFrequency: 'daily',
      mainGoal: 'Improve mental health',
      sensitiveTopics: 'anxiety, stress',
    };

    try {
      await saveProfile(newProfile);
      // Profile saved successfully
    } catch (error) {
      // Handle error
    }
  };

  return <Button onPress={handleSave} title="Save" />;
}
```

### Clearing Profile

```typescript
import { useUserProfileStore } from '@/store/userProfileStore';

export default function LogoutScreen() {
  const { clearProfile } = useUserProfileStore();

  const handleLogout = async () => {
    await clearProfile();
    // Navigate to login
  };

  return <Button onPress={handleLogout} title="Logout" />;
}
```

## Example: ChatScreen Usage

The ChatScreen demonstrates how to use the store:

```typescript
import { useUserProfileStore } from '@/store/userProfileStore';

export default function ChatScreen() {
  const { userProfile } = useUserProfileStore();

  // Use userProfile.displayName in greeting
  // Use userProfile.preferredTone to adjust bot responses
  // Access any other profile fields as needed
}
```

## App Flow

1. **App Start** (`app/index.tsx`)
   - Loads profile from AsyncStorage
   - If profile exists → Navigate to `/(tabs)/chat`
   - If no profile → Navigate to `/login`

2. **Login/Signup** (`app/login.tsx`, `app/signup.tsx`)
   - After successful auth → Navigate to `/OnboardingScreen`

3. **Onboarding** (`app/OnboardingScreen.tsx`)
   - User fills out form
   - Calls `saveProfile()` to save to store and AsyncStorage
   - Navigate to `/(tabs)/chat`

4. **Chat Screen** (`app/(tabs)/chat.tsx`)
   - Reads `userProfile` from store
   - Uses profile data to personalize experience

## Storage Key
The profile is stored in AsyncStorage with the key: `@ally_user_profile`

## Notes
- The store automatically persists to AsyncStorage
- Profile is loaded once on app start in `index.tsx`
- All components can access the profile via the hook
- The store is reactive - components will re-render when profile changes

