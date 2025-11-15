import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, PrimaryColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserProfileStore } from '@/store/userProfileStore';
import { logOnboardingCompleted } from '@/utils/analytics';
import { requestNotificationPermissions, scheduleCheckInNotification, type CheckInFrequency } from '@/utils/notifications';
import { generatePersonaPrompt, parseCommaSeparatedList } from '@/utils/persona';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SUPPORT_FOCUS_OPTIONS = ['Mental wellness', 'Productivity', 'Motivation', 'Relationships'];
const ENCOURAGEMENT_OPTIONS: Array<'motivational' | 'practical' | 'humorous'> = ['motivational', 'practical', 'humorous'];
const STEP_CONFIG = [
  {
    title: 'Your basics',
    description: 'Share your name and main goal so Ally can stay focused on what matters most.',
  },
  {
    title: 'How Ally should show up',
    description: 'Adjust Ally’s tone and check-in rhythm to match your style.',
  },
  {
    title: 'Support preferences',
    description: 'Highlight sensitive areas and where you’d like extra support.',
  },
  {
    title: 'Personal touches',
    description: 'Tell Ally about your interests and how you like to be encouraged.',
  },
] as const;
const TOTAL_STEPS = STEP_CONFIG.length;

export default function OnboardingScreen() {
  const [displayName, setDisplayName] = useState('');
  const [preferredTone, setPreferredTone] = useState<'friendly' | 'calm' | 'playful'>('friendly');
  const [checkInFrequency, setCheckInFrequency] = useState<CheckInFrequency>('daily');
  const [mainGoal, setMainGoal] = useState('');
  const [sensitiveTopics, setSensitiveTopics] = useState('');
  const [supportFocus, setSupportFocus] = useState<string[]>([]);
  const [formality, setFormality] = useState<number>(3);
  const [dailyChallenge, setDailyChallenge] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [encouragementStyle, setEncouragementStyle] = useState<'motivational' | 'practical' | 'humorous'>('motivational');
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [energyTouched, setEnergyTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { saveProfile } = useUserProfileStore();
  const { bottom: safeBottomInset } = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const currentStepInfo = STEP_CONFIG[currentStep];
  const isFirstStep = currentStep === 0;
  const isFinalStep = currentStep === TOTAL_STEPS - 1;
  const progress = (currentStep + 1) / TOTAL_STEPS;
  const progressPercentage = Math.max(0, Math.min(progress, 1));
  const canProceed = useMemo(() => {
    if (currentStep === 0) {
      return displayName.trim().length > 0 && mainGoal.trim().length > 0;
    }
    return true;
  }, [currentStep, displayName, mainGoal]);
  const primaryLabel = isFinalStep ? (isSubmitting ? 'Saving...' : 'Finish') : 'Next';
  const isPrimaryDisabled = isFinalStep ? isSubmitting || !canProceed : !canProceed;
  const primaryIconName = isFinalStep ? 'checkmark.circle.fill' : 'arrow.right';
  const bottomInset = Math.max(safeBottomInset, 12);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentStep]);

  const handlePrimaryAction = async () => {
    if (isFinalStep) {
      await handleSubmit();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const formalityLabel = useMemo(() => {
    switch (formality) {
      case 1:
        return 'Very casual';
      case 2:
        return 'Casual';
      case 3:
        return 'Balanced';
      case 4:
        return 'Polished';
      case 5:
        return 'Very formal';
      default:
        return 'Balanced';
    }
  }, [formality]);

  const energyLabel = useMemo(() => {
    if (!energyTouched) return 'Skip';
    if (energyLevel <= 3) return 'Low';
    if (energyLevel <= 7) return 'Steady';
    return 'High';
  }, [energyLevel, energyTouched]);

  const toggleSupportFocus = (option: string) => {
    setSupportFocus((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

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
      const trimmedName = displayName.trim();
      const trimmedGoal = mainGoal.trim();
      const trimmedSensitive = sensitiveTopics.trim();
      const trimmedDaily = dailyChallenge.trim();
      const parsedInterests = parseCommaSeparatedList(interestsInput);
      const selectedSupportFocus = supportFocus.length > 0 ? supportFocus : undefined;
      const personaPrompt = generatePersonaPrompt({
        displayName: trimmedName,
        preferredTone,
        mainGoal: trimmedGoal,
        sensitiveTopics: trimmedSensitive,
        supportFocus: selectedSupportFocus,
        formality,
        dailyChallenge: trimmedDaily,
        interests: parsedInterests,
        encouragementStyle,
        energyLevel: energyTouched ? energyLevel : undefined,
      });

      const profile = {
        displayName: trimmedName,
        preferredTone,
        checkInFrequency,
        mainGoal: trimmedGoal,
        sensitiveTopics: trimmedSensitive || undefined,
        supportFocus: selectedSupportFocus,
        formality,
        dailyChallenge: trimmedDaily || undefined,
        interests: parsedInterests,
        encouragementStyle,
        energyLevel: energyTouched ? energyLevel : undefined,
        personaPrompt,
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
    value: CheckInFrequency;
    selected: boolean;
    onSelect: (value: CheckInFrequency) => void;
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
          ref={scrollRef}
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
              Let&apos;s personalize your experience
            </ThemedText>
          </ThemedView>

          <View style={styles.progressSection}>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: colorScheme === 'dark' ? '#2F3036' : '#E5E7EB' },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(progressPercentage * 100)}%`,
                    backgroundColor: colors.tint,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.stepCounter}>
              Step {currentStep + 1} of {TOTAL_STEPS}
            </ThemedText>
          </View>

          <ThemedView style={styles.stepCard}>
            <ThemedText type="defaultSemiBold" style={styles.stepTitle}>
              {currentStepInfo.title}
            </ThemedText>
            <ThemedText style={styles.stepDescription}>
              {currentStepInfo.description}
            </ThemedText>

            <View style={styles.stepContent}>
              {currentStep === 0 && (
                <>
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
                </>
              )}

              {currentStep === 1 && (
                <>
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

                  <View style={styles.field}>
                    <ThemedText type="defaultSemiBold" style={styles.label}>
                      Check-in Frequency
                    </ThemedText>
                    <View style={styles.selectGroup}>
                      {[
                        { label: 'Daily', value: 'daily' as CheckInFrequency },
                        { label: 'Every Other Day', value: 'every-other-day' as CheckInFrequency },
                        { label: 'Weekly', value: 'weekly' as CheckInFrequency },
                        { label: 'Minute by Minute', value: 'minute-by-minute' as CheckInFrequency },
                      ].map((option) => (
                        <SelectOption
                          key={option.value}
                          label={option.label}
                          value={option.value}
                          selected={checkInFrequency === option.value}
                          onSelect={setCheckInFrequency}
                        />
                      ))}
                    </View>
                  </View>
                </>
              )}

              {currentStep === 2 && (
                <>
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
                      Topics you&apos;d like Ally to be mindful of (optional)
                    </ThemedText>
                  </View>

                  <View style={styles.field}>
                    <ThemedText type="defaultSemiBold" style={styles.label}>
                      Support Focus Areas
                    </ThemedText>
                    <View style={styles.chipGroup}>
                      {SUPPORT_FOCUS_OPTIONS.map((option) => {
                        const selected = supportFocus.includes(option);
                        return (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.chip,
                              {
                                borderColor: selected ? colors.tint : colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                                backgroundColor: selected ? colors.tint + '15' : 'transparent',
                              },
                            ]}
                            onPress={() => toggleSupportFocus(option)}
                            activeOpacity={0.7}
                          >
                            <ThemedText
                              style={[
                                styles.chipLabel,
                                { color: selected ? colors.tint : colors.text },
                              ]}
                            >
                              {option}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.field}>
                    <ThemedText type="defaultSemiBold" style={styles.label}>
                      Communication Style
                    </ThemedText>
                    <ThemedText style={styles.sliderCaption}>
                      {formalityLabel} ({formality}/5)
                    </ThemedText>
                    <Slider
                      value={formality}
                      minimumValue={1}
                      maximumValue={5}
                      step={1}
                      minimumTrackTintColor={colors.tint}
                      maximumTrackTintColor={colorScheme === 'dark' ? '#3a3a3a' : '#D1D5DB'}
                      thumbTintColor={colors.tint}
                      onValueChange={setFormality}
                    />
                  </View>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <View style={styles.field}>
                    <ThemedText type="defaultSemiBold" style={styles.label}>
                      Daily Challenge
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
                      placeholder="What feels most challenging today?"
                      placeholderTextColor={PrimaryColors.textSecondary}
                      value={dailyChallenge}
                      onChangeText={setDailyChallenge}
                    />
                  </View>

                  <View style={styles.field}>
                    <ThemedText type="defaultSemiBold" style={styles.label}>
                      Hobbies & Interests
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
                      placeholder="e.g., hiking, painting, podcasts"
                      placeholderTextColor={PrimaryColors.textSecondary}
                      value={interestsInput}
                      onChangeText={setInterestsInput}
                      autoCapitalize="words"
                    />
                    <ThemedText style={styles.hint}>
                      Comma-separated list (optional)
                    </ThemedText>
                  </View>

                  <View style={styles.field}>
                    <ThemedText type="defaultSemiBold" style={styles.label}>
                      Preferred Encouragement Style
                    </ThemedText>
                    <View style={styles.selectGroup}>
                      {ENCOURAGEMENT_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.selectOption,
                            encouragementStyle === option && {
                              backgroundColor: colors.tint,
                              borderColor: colors.tint,
                            },
                          ]}
                          onPress={() => setEncouragementStyle(option)}
                          activeOpacity={0.7}
                        >
                          <ThemedText
                            style={[
                              styles.selectLabel,
                              encouragementStyle === option && { color: '#ffffff' },
                            ]}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.field}>
                    <ThemedText type="defaultSemiBold" style={styles.label}>
                      Energy Level Today (optional)
                    </ThemedText>
                    <View style={styles.energyHeader}>
                      <ThemedText style={styles.energyLabel}>{energyLabel}</ThemedText>
                      {energyTouched && (
                        <TouchableOpacity
                          onPress={() => {
                            setEnergyTouched(false);
                            setEnergyLevel(5);
                          }}
                        >
                          <ThemedText style={[styles.resetLink, { color: colors.tint }]}>Reset</ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Slider
                      value={energyTouched ? energyLevel : 5}
                      minimumValue={1}
                      maximumValue={10}
                      step={1}
                      minimumTrackTintColor={colors.tint}
                      maximumTrackTintColor={colorScheme === 'dark' ? '#3a3a3a' : '#D1D5DB'}
                      thumbTintColor={colors.tint}
                      onValueChange={(value: number) => {
                        setEnergyTouched(true);
                        setEnergyLevel(value);
                      }}
                    />
                    {energyTouched && (
                      <ThemedText style={styles.energyValue}>{energyLevel} / 10</ThemedText>
                    )}
                  </View>
                </>
              )}
            </View>
          </ThemedView>
        </ScrollView>

        <View
          style={[
            styles.stepActions,
            {
              paddingTop: 20,
              paddingBottom: Math.max(bottomInset, 24),
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colorScheme === 'dark' ? '#2F3036' : '#E5E7EB',
              shadowColor: colorScheme === 'dark' ? '#000' : '#101828',
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: -6 },
              elevation: 3,
            },
          ]}
        >
          {!isFirstStep && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  borderColor: colorScheme === 'dark' ? '#2F3036' : '#D6DEEA',
                  backgroundColor: colorScheme === 'dark' ? '#1A1B1F' : '#F3F6FB',
                },
              ]}
              onPress={handleBack}
              activeOpacity={0.85}
            >
              <View style={styles.buttonContent}>
                <IconSymbol name="chevron.left" size={18} color={colors.text} />
                <ThemedText style={[styles.secondaryButtonText, { color: colors.text, marginLeft: 8 }]}>Back</ThemedText>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.tint,
                opacity: isPrimaryDisabled ? 0.6 : 1,
                shadowColor: colors.tint,
              },
              isFirstStep && { flex: 1 },
            ]}
            onPress={handlePrimaryAction}
            disabled={isPrimaryDisabled}
            activeOpacity={0.9}
          >
            <View style={styles.buttonContent}>
              <ThemedText style={styles.primaryButtonText}>{primaryLabel}</ThemedText>
              {!isSubmitting && (
                <IconSymbol name={primaryIconName} size={18} color="#ffffff" />
              )}
            </View>
          </TouchableOpacity>
        </View>
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
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepCounter: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.7,
  },
  stepCard: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.75,
    marginBottom: 24,
  },
  stepContent: {
    gap: 24,
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
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  sliderCaption: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
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
  stepActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 24,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  energyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  energyLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  resetLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  energyValue: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.7,
  },
});

