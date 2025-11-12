import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, PrimaryColors } from '@/constants/theme';
import { useUserProfileStore, UserProfile } from '@/store/userProfileStore';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { scheduleCheckInNotification, requestNotificationPermissions } from '@/utils/notifications';
import { logOnboardingCompleted } from '@/utils/analytics';

export default function OnboardingScreen() {
  const [displayName, setDisplayName] = useState('');
  const [preferredTone, setPreferredTone] = useState<'friendly' | 'calm' | 'playful'>('friendly');
  const [checkInFrequency, setCheckInFrequency] = useState<'daily' | 'every-other-day' | 'weekly'>('daily');
  const [mainGoal, setMainGoal] = useState('');
  const [sensitiveTopics, setSensitiveTopics] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { saveProfile } = useUserProfileStore();

  const handleSubmit = async () => {
    // Validation
    if (!displayName.trim()) {
      Alert.alert('Validation Error', 'Please enter your display name.');
      return;
    }

    if (!mainGoal.trim()) {
      Alert.alert('Validation Error', 'Please enter your main goal.');
      return;
    }

    setIsSubmitting(true);

    try {
      const profile: UserProfile = {
        displayName: displayName.trim(),
        preferredTone,
        checkInFrequency,
        mainGoal: mainGoal.trim(),
        sensitiveTopics: sensitiveTopics.trim(),
      };

      // Save to store (which saves to AsyncStorage)
      await saveProfile(profile);

      // Request notification permissions
      const hasPermission = await requestNotificationPermissions();
      
      // Schedule check-in notifications if permission granted
      if (hasPermission) {
        const userId = displayName.trim(); // Use display name as user ID for now
        await scheduleCheckInNotification(checkInFrequency, userId);
      }

      // Log analytics
      logOnboardingCompleted(displayName.trim(), preferredTone, checkInFrequency);

      // Navigate to ChatScreen
      router.replace('/(tabs)/chat');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  const RadioButton = ({
    label,
    value,
    selected,
    onSelect,
  }: {
    label: string;
    value: 'friendly' | 'calm' | 'playful';
    selected: boolean;
    onSelect: (value: 'friendly' | 'calm' | 'playful') => void;
  }) => (
    <TouchableOpacity
      style={styles.radioOption}
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <View style={styles.radioCircle}>
        {selected && <View style={[styles.radioInner, { backgroundColor: colors.tint }]} />}
      </View>
      <ThemedText style={styles.radioLabel}>{label}</ThemedText>
    </TouchableOpacity>
  );

  const SelectOption = ({
    label,
    value,
    selected,
    onSelect,
  }: {
    label: string;
    value: 'daily' | 'every-other-day' | 'weekly';
    selected: boolean;
    onSelect: (value: 'daily' | 'every-other-day' | 'weekly') => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.selectOption,
        selected && { backgroundColor: colors.tint, borderColor: colors.tint },
      ]}
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <ThemedText
        style={[
          styles.selectLabel,
          selected && { color: '#ffffff' },
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: colors.tint + '15' }]}>
              <IconSymbol name="sparkles" size={32} color={colors.tint} />
            </View>
            <ThemedText type="title" style={styles.title}>Welcome to Ally</ThemedText>
            <ThemedText style={styles.subtitle}>
              Let's personalize your experience
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.form}>
            {/* Display Name */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Display Name *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                    color: colors.text,
                  },
                ]}
                placeholder="Enter your name"
                placeholderTextColor={PrimaryColors.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>

            {/* Preferred Tone */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Preferred Tone
              </ThemedText>
              <View style={styles.radioGroup}>
                <RadioButton
                  label="Friendly"
                  value="friendly"
                  selected={preferredTone === 'friendly'}
                  onSelect={setPreferredTone}
                />
                <RadioButton
                  label="Calm"
                  value="calm"
                  selected={preferredTone === 'calm'}
                  onSelect={setPreferredTone}
                />
                <RadioButton
                  label="Playful"
                  value="playful"
                  selected={preferredTone === 'playful'}
                  onSelect={setPreferredTone}
                />
              </View>
            </View>

            {/* Check-in Frequency */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Check-in Frequency
              </ThemedText>
              <View style={styles.selectGroup}>
                <SelectOption
                  label="Daily"
                  value="daily"
                  selected={checkInFrequency === 'daily'}
                  onSelect={setCheckInFrequency}
                />
                <SelectOption
                  label="Every Other Day"
                  value="every-other-day"
                  selected={checkInFrequency === 'every-other-day'}
                  onSelect={setCheckInFrequency}
                />
                <SelectOption
                  label="Weekly"
                  value="weekly"
                  selected={checkInFrequency === 'weekly'}
                  onSelect={setCheckInFrequency}
                />
              </View>
            </View>

            {/* Main Goal */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Main Goal *
              </ThemedText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                    color: colors.text,
                  },
                ]}
                placeholder="What do you hope to achieve with Ally?"
                placeholderTextColor={PrimaryColors.textSecondary}
                value={mainGoal}
                onChangeText={setMainGoal}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Sensitive Topics */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Sensitive Topics
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                    color: colors.text,
                  },
                ]}
                placeholder="e.g., anxiety, work stress, relationships (comma-separated)"
                placeholderTextColor={PrimaryColors.textSecondary}
                value={sensitiveTopics}
                onChangeText={setSensitiveTopics}
                autoCapitalize="none"
              />
              <ThemedText style={styles.hint}>
                Topics you'd like Ally to be mindful of (optional)
              </ThemedText>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.tint },
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <ThemedText style={styles.submitButtonText}>
                {isSubmitting ? 'Saving...' : 'Get Started'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    padding: 24,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  hint: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 6,
  },
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioLabel: {
    fontSize: 16,
  },
  selectGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  selectOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    minWidth: 100,
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

