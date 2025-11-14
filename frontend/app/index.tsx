import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useUserProfileStore } from '@/store/userProfileStore';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function IndexScreen() {
  const { userProfile, isLoading, loadProfile } = useUserProfileStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    // Load profile on mount
    loadProfile();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (userProfile) {
        // User has completed onboarding, go to chat
        router.replace('/(tabs)/chat');
      } else {
        // No profile found, go to login
        router.replace('/login');
      }
    }
  }, [userProfile, isLoading]);

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

