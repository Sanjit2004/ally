import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generatePersonaPrompt,
  generatePersonaPromptFromLegacy,
  PersonaProfileInput,
} from '@/utils/persona';

export interface UserProfile {
  displayName: string;
  preferredTone: 'friendly' | 'calm' | 'playful';
  checkInFrequency: 'daily' | 'every-other-day' | 'weekly' | 'minute-by-minute';
  mainGoal: string;
  sensitiveTopics?: string;
  supportFocus?: string[];
  formality?: number;
  dailyChallenge?: string;
  interests?: string[];
  encouragementStyle?: 'motivational' | 'practical' | 'humorous';
  energyLevel?: number;
  personaPrompt: string;
}

type UserProfileInput = Omit<UserProfile, 'personaPrompt'> & { personaPrompt?: string };

interface UserProfileState {
  userProfile: UserProfile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  saveProfile: (profile: UserProfileInput) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  regeneratePersonaPrompt: () => Promise<void>;
  clearProfile: () => Promise<void>;
}

const STORAGE_KEY = '@ally_user_profile';

const buildPersonaPrompt = (profile: Partial<UserProfile>): string => {
  const hasExtendedData =
    profile.supportFocus?.length ||
    profile.formality !== undefined ||
    profile.dailyChallenge ||
    profile.interests?.length ||
    profile.encouragementStyle ||
    profile.energyLevel !== undefined;

  if (!hasExtendedData && !profile.personaPrompt) {
    return generatePersonaPromptFromLegacy({
      displayName: profile.displayName,
      preferredTone: profile.preferredTone,
      mainGoal: profile.mainGoal,
      sensitiveTopics: profile.sensitiveTopics,
    });
  }

  return generatePersonaPrompt({
    displayName: profile.displayName,
    preferredTone: profile.preferredTone,
    mainGoal: profile.mainGoal,
    sensitiveTopics: profile.sensitiveTopics,
    supportFocus: profile.supportFocus,
    formality: profile.formality,
    dailyChallenge: profile.dailyChallenge,
    interests: profile.interests,
    encouragementStyle: profile.encouragementStyle,
    energyLevel: profile.energyLevel,
  });
};

const persistProfile = async (profile: UserProfile) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  return profile;
};

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  userProfile: null,
  isLoading: true,

  loadProfile: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserProfile>;
        const personaPrompt = parsed.personaPrompt || buildPersonaPrompt(parsed);
        const profile: UserProfile = {
          displayName: parsed.displayName || 'User',
          preferredTone: parsed.preferredTone || 'friendly',
          checkInFrequency: parsed.checkInFrequency || 'daily',
          mainGoal: parsed.mainGoal || 'overall wellbeing',
          sensitiveTopics: parsed.sensitiveTopics,
          supportFocus: parsed.supportFocus,
          formality: parsed.formality,
          dailyChallenge: parsed.dailyChallenge,
          interests: parsed.interests,
          encouragementStyle: parsed.encouragementStyle,
          energyLevel: parsed.energyLevel,
          personaPrompt,
        };

        await persistProfile(profile);
        set({ userProfile: profile, isLoading: false });
      } else {
        set({ userProfile: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ userProfile: null, isLoading: false });
    }
  },

  saveProfile: async (profileInput: UserProfileInput) => {
    try {
      const personaPrompt =
        profileInput.personaPrompt || buildPersonaPrompt(profileInput as Partial<UserProfile>);

      const profile: UserProfile = {
        ...profileInput,
        personaPrompt,
      } as UserProfile;

      await persistProfile(profile);
      set({ userProfile: profile });
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    try {
      const current = get().userProfile;
      if (!current) {
        console.warn('Cannot update profile because no profile is loaded.');
        return;
      }

      const merged: UserProfile = {
        ...current,
        ...updates,
      };

      const personaPrompt = buildPersonaPrompt(merged);
      const nextProfile: UserProfile = {
        ...merged,
        personaPrompt,
      };

      await persistProfile(nextProfile);
      set({ userProfile: nextProfile });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  },

  regeneratePersonaPrompt: async () => {
    try {
      const current = get().userProfile;
      if (!current) return;

      const personaPrompt = buildPersonaPrompt(current);
      const nextProfile: UserProfile = {
        ...current,
        personaPrompt,
      };

      await persistProfile(nextProfile);
      set({ userProfile: nextProfile });
    } catch (error) {
      console.error('Error regenerating persona prompt:', error);
    }
  },

  clearProfile: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ userProfile: null });
    } catch (error) {
      console.error('Error clearing profile:', error);
    }
  },
}));

