import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { router, Link } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, PrimaryColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleEmailSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to onboarding after signup
      router.replace('/OnboardingScreen');
    }, 1000);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    Alert.alert('Google Sign Up', 'Google authentication will be implemented here.');
    setIsLoading(false);
    // In production, implement Google OAuth here
    // router.replace('/OnboardingScreen');
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    Alert.alert('Apple Sign Up', 'Apple authentication will be implemented here.');
    setIsLoading(false);
    // In production, implement Apple Sign In here
    // router.replace('/OnboardingScreen');
  };

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
            <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>
          </ThemedView>

          <ThemedView style={styles.form}>
            {/* Name Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>Full Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                    color: colors.text,
                  },
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={PrimaryColors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Email Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                    color: colors.text,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={PrimaryColors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Password Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                    color: colors.text,
                  },
                ]}
                placeholder="Create a password (min. 6 characters)"
                placeholderTextColor={PrimaryColors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>Confirm Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                    color: colors.text,
                  },
                ]}
                placeholder="Confirm your password"
                placeholderTextColor={PrimaryColors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
              />
            </View>

            {/* Email Signup Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.tint },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleEmailSignup}
              disabled={isLoading}
            >
              <ThemedText style={styles.primaryButtonText}>
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </ThemedText>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e5e5' }]} />
              <ThemedText style={styles.dividerText}>OR</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e5e5' }]} />
            </View>

            {/* Google Sign Up */}
            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colorScheme === 'dark' ? '#3a3a3a' : '#E5E7EB',
                },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
                <IconSymbol name="globe" size={20} color={colors.text} />
              <ThemedText style={styles.socialButtonText}>Continue with Google</ThemedText>
            </TouchableOpacity>

            {/* Apple Sign Up */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
                    borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
                  },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleAppleSignIn}
                disabled={isLoading}
              >
                <IconSymbol name="applelogo" size={20} color={colors.text} />
                <ThemedText style={styles.socialButtonText}>Continue with Apple</ThemedText>
              </TouchableOpacity>
            )}

            {/* Sign In Link */}
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Already have an account? </ThemedText>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <ThemedText style={[styles.footerLink, { color: colors.tint }]}>
                    Sign In
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
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
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    padding: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.5,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

