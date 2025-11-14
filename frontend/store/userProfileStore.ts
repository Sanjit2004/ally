import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  displayName: string;
  preferredTone: 'friendly' | 'calm' | 'playful';
  checkInFrequency: 'daily' | 'every-other-day' | 'weekly';
  mainGoal: string;
  sensitiveTopics: string;
}

interface UserProfileState {
  userProfile: UserProfile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const STORAGE_KEY = '@ally_user_profile';

export const useUserProfileStore = create<UserProfileState>((set) => ({
  userProfile: null,
  isLoading: true,

  loadProfile: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const profile = JSON.parse(stored) as UserProfile;
        set({ userProfile: profile, isLoading: false });
      } else {
        set({ userProfile: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ userProfile: null, isLoading: false });
    }
  },

  saveProfile: async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      set({ userProfile: profile });
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
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

