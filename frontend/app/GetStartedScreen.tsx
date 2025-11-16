import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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
];

const BENEFITS: Feature[] = [
  {
    icon: 'lock.fill',
    title: 'Privacy First',
    description: 'Your conversations stay encrypted and secure.',
  },
  {
    icon: 'sparkle.magnifyingglass',
    title: 'Learns With You',
    description: 'Ally remembers context so every chat picks up naturally.',
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.content}>
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
          <View
            style={[
              styles.gradientBg,
              {
                backgroundColor: isDark ? '#7C3AED15' : '#7C3AED08',
              },
            ]}
          />

          <Animated.View
            style={[
              styles.orb,
              styles.orbPrimary,
              {
                transform: [
                  {
                    translateY: orbOneAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-30, 30],
                    }),
                  },
                  {
                    translateX: orbOneAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-20, 20],
                    }),
                  },
                ],
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.4],
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
                      outputRange: [30, -30],
                    }),
                  },
                  {
                    translateX: orbTwoAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [24, -24],
                    }),
                  },
                  { scale: 1.05 },
                ],
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.35],
                }),
              },
            ]}
          />

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
              <IconSymbol name="sparkles" size={56} color={colors.tint} />
            </View>
          </Animated.View>

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
            Your AI companion for meaningful conversations and everyday encouragement.
          </Text>
        </Animated.View>

        <View style={styles.featureStrip}>
          {FEATURES.map((feature) => (
            <View
              key={feature.title}
              style={[styles.featurePill, { backgroundColor: colors.tint + '10' }]}
            >
              <IconSymbol name={feature.icon} size={18} color={colors.tint} />
              <Text style={[styles.featurePillText, { color: colors.text }]}>{feature.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.benefitsSection}>
          {BENEFITS.map((benefit) => (
            <View
              key={benefit.title}
              style={[styles.benefitCard, { backgroundColor: isDark ? colors.surface : '#ffffff', shadowColor: colors.tint + '40' }]}
            >
              <View style={[styles.benefitIcon, { backgroundColor: colors.tint + '15' }]}> 
                <IconSymbol name={benefit.icon} size={20} color={colors.tint} />
              </View>
              <Text style={[styles.benefitTitle, { color: colors.text }]}>{benefit.title}</Text>
              <Text style={[styles.benefitDescription, { color: colors.text + '95' }]}>
                {benefit.description}
              </Text>
            </View>
          ))}
        </View>

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
            Join thousands of users building healthier habits with Ally.
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: colors.tint },
            ]}
            onPress={() => markIntroSeenAndNavigate('/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <IconSymbol name="arrow.right" size={18} color="#ffffff" />
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: colors.text + '66' }]}>By continuing, you agree to our Terms of Service.</Text>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'flex-start',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 24,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 32,
    marginBottom: 32,
    backgroundColor: '#7C3AED08',
    paddingBottom: 32,
    minHeight: 260,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  orbSecondary: {
    backgroundColor: '#F472B63b',
    width: 200,
    height: 200,
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
    fontSize: 34,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  featureStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featurePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  benefitsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  benefitCard: {
    flexBasis: '48%',
    padding: 18,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
  },
  ctaSection: {
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  ctaTitle: {
    fontSize: 24,
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
    alignSelf: 'stretch',
    width: '100%',
    gap: 14,
    flexDirection: 'column',
    marginTop: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 28,
    justifyContent: 'center',
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
