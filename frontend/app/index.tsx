import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const INTRO_SCREEN_KEY = '@ally_has_seen_intro';

export default function IndexScreen() {
  const { userProfile, isLoading, loadProfile } = useUserProfileStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [hasCheckedIntro, setHasCheckedIntro] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  useEffect(() => {
    // Load profile on mount
    loadProfile();
  }, []);

  useEffect(() => {
    const checkIntro = async () => {
      try {
        const value = await AsyncStorage.getItem(INTRO_SCREEN_KEY);
        setHasSeenIntro(value === 'true');
      } catch (error) {
        console.error('Error checking intro flag:', error);
      } finally {
        setHasCheckedIntro(true);
      }
    };

    checkIntro();
  }, []);

  useEffect(() => {
    if (!isLoading && hasCheckedIntro) {
      if (userProfile) {
        // User has completed onboarding, go to chat
        router.replace('/(tabs)/chat');
      } else if (!hasSeenIntro) {
        // First-time user, show the get started experience
        router.replace('/GetStartedScreen');
      } else {
        // No profile found, go to login
        router.replace('/login');
      }
    }
  }, [userProfile, isLoading, hasCheckedIntro, hasSeenIntro]);

  // Show loading screen while checking profile
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

