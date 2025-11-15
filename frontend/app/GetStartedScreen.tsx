import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const INTRO_SCREEN_KEY = '@ally_has_seen_intro';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: 'bubble.left.fill',
    title: 'Smart Chat',
    description: 'Intelligent conversations powered by AI',
  },
  {
    icon: 'brain.head.profile',
    title: 'Memory System',
    description: 'Remembers your important moments',
  },
  {
    icon: 'waveform.circle.fill',
    title: 'Voice Calls',
    description: 'Talk to your AI companion naturally',
  },
  {
    icon: 'heart.fill',
    title: 'Emotional Support',
    description: 'Mood-aware responses tailored to you',
  },
];

export default function GetStartedScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const orbOneAnim = useRef(new Animated.Value(0)).current;
  const orbTwoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 10,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Background orb animations (subtle counter-rotating motion)
    const createOrbLoop = (anim: Animated.Value, direction: 1 | -1) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: direction * 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: direction * -1,
            duration: 6000,
            useNativeDriver: true,
          }),
        ])
      );

    const orbOneLoop = createOrbLoop(orbOneAnim, 1);
    const orbTwoLoop = createOrbLoop(orbTwoAnim, -1);

    orbOneLoop.start();
    orbTwoLoop.start();

    return () => {
      orbOneLoop.stop();
      orbTwoLoop.stop();
    };
  }, [fadeAnim, slideAnim, scaleAnim, floatAnim, orbOneAnim, orbTwoAnim]);

  const markIntroSeenAndNavigate = async (path: '/signup' | '/login') => {
    try {
      await AsyncStorage.setItem(INTRO_SCREEN_KEY, 'true');
    } catch (error) {
      console.error('Error setting intro flag:', error);
    }

    router.push(path);
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Animated Background Gradient */}
          <View
            style={[
              styles.gradientBg,
              {
                backgroundColor: isDark ? '#7C3AED15' : '#7C3AED08',
              },
            ]}
          />

          {/* Animated Background Orbs */}
          <Animated.View
            style={[
              styles.orb,
              styles.orbPrimary,
              {
                transform: [
                  {
                    translateY: orbOneAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-40, 40],
                    }),
                  },
                  {
                    translateX: orbOneAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-30, 30],
                    }),
                  },
                ],
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                }),
              },
            ]}
          />

          <Animated.View
            style={[
              styles.orb,
              styles.orbSecondary,
              {
                transform: [
                  {
                    translateY: orbTwoAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [50, -50],
                    }),
                  },
                  {
                    translateX: orbTwoAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [40, -40],
                    }),
                  },
                  { scale: 1.1 },
                ],
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />

          {/* Floating Animated Icon */}
          <Animated.View
            style={[
              styles.heroIcon,
              {
                transform: [{ translateY: floatAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.tint + '20' },
              ]}
            >
              <IconSymbol name="sparkles" size={60} color={colors.tint} />
            </View>
          </Animated.View>

          {/* Hero Text */}
          <Text
            style={[
              styles.heroTitle,
              { color: colors.text },
            ]}
          >
            Meet Ally
          </Text>
          <Text
            style={[
              styles.heroSubtitle,
              { color: colors.text + '99' },
            ]}
          >
            Your personal AI companion for meaningful conversations and emotional support
          </Text>
        </Animated.View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            Powerful Features
          </Text>

          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: isDark ? colors.surface : colors.background,
                    borderColor: isDark ? '#2a2a2a' : '#E5E7EB',
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 50 - index * 10],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.featureIconBg,
                    { backgroundColor: colors.tint + '15' },
                  ]}
                >
                  <IconSymbol
                    name={feature.icon}
                    size={28}
                    color={colors.tint}
                  />
                </View>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: colors.text },
                  ]}
                >
                  {feature.title}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    { color: colors.text + '80' },
                  ]}
                >
                  {feature.description}
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Highlights Section */}
        <View style={styles.highlightsSection}>
          <View style={styles.highlightItem}>
            <View
              style={[
                styles.highlightNumber,
                { backgroundColor: colors.tint + '20' },
              ]}
            >
              <Text style={[styles.highlightNumberText, { color: colors.tint }]}>
                ✓
              </Text>
            </View>
            <View style={styles.highlightContent}>
              <Text style={[styles.highlightTitle, { color: colors.text }]}>
                Privacy First
              </Text>
              <Text style={[styles.highlightDesc, { color: colors.text + '80' }]}>
                Your conversations are encrypted and secure
              </Text>
            </View>
          </View>

          <View style={styles.highlightItem}>
            <View
              style={[
                styles.highlightNumber,
                { backgroundColor: colors.tint + '20' },
              ]}
            >
              <Text style={[styles.highlightNumberText, { color: colors.tint }]}>
                ✓
              </Text>
            </View>
            <View style={styles.highlightContent}>
              <Text style={[styles.highlightTitle, { color: colors.text }]}>
                Always Learning
              </Text>
              <Text style={[styles.highlightDesc, { color: colors.text + '80' }]}>
                Improves over time to understand you better
              </Text>
            </View>
          </View>

          <View style={styles.highlightItem}>
            <View
              style={[
                styles.highlightNumber,
                { backgroundColor: colors.tint + '20' },
              ]}
            >
              <Text style={[styles.highlightNumberText, { color: colors.tint }]}>
                ✓
              </Text>
            </View>
            <View style={styles.highlightContent}>
              <Text style={[styles.highlightTitle, { color: colors.text }]}>
                24/7 Available
              </Text>
              <Text style={[styles.highlightDesc, { color: colors.text + '80' }]}>
                Always here when you need someone to talk to
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text
            style={[
              styles.ctaTitle,
              { color: colors.text },
            ]}
          >
            Ready to get started?
          </Text>
          <Text
            style={[
              styles.ctaSubtitle,
              { color: colors.text + '99' },
            ]}
          >
            Join thousands of users experiencing meaningful AI conversations
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.tint },
              ]}
              onPress={() => markIntroSeenAndNavigate('/signup')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
              <IconSymbol name="arrow.right" size={18} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.tint,
                  backgroundColor: colors.tint + '10',
                },
              ]}
              onPress={() => markIntroSeenAndNavigate('/login')}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.tint }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text + '66' }]}>
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
  },
  orb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#7C3AED20',
  },
  orbPrimary: {
    top: -40,
    left: -20,
    backgroundColor: '#7C3AED22',
  },
  orbSecondary: {
    bottom: -60,
    right: -10,
    backgroundColor: '#6366F122',
  },
  heroIcon: {
    marginBottom: 24,
    zIndex: 1,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 60,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},
featureCard: {
  width: '48%',
  marginBottom: 16,
  paddingVertical: 20,
  paddingHorizontal: 16,
  borderRadius: 20,
  borderWidth: 1,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
},
  featureIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  highlightsSection: {
    paddingHorizontal: 24,
    marginBottom: 60,
    gap: 20,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  highlightNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  highlightNumberText: {
    fontSize: 20,
    fontWeight: '700',
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
