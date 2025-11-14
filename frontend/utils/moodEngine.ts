/**
 * Emotion Simulation Engine for Ally
 * Tracks and adjusts Ally's mood based on user sentiment and time of day
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeSentiment, getSentimentScore, Sentiment } from './sentimentAnalysis';

export type Mood = 'happy' | 'energetic' | 'neutral' | 'calm' | 'sad';

export interface MoodState {
  currentMood: Mood;
  moodScore: number; // -2 to +2
  lastUpdated: number; // timestamp
  dayOfWeek: number; // 0-6
  hourOfDay: number; // 0-23
  interactionCount: number; // interactions today
  userSentimentHistory: Sentiment[]; // last 5 sentiments
}

const MOOD_STORAGE_KEY = '@ally_mood_state';

/**
 * Get current time-of-day mood influence
 * Morning: energetic, Afternoon: neutral, Evening: calm, Night: calm
 */
function getTimeOfDayMood(): Mood {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'energetic'; // Morning
  if (hour >= 12 && hour < 17) return 'neutral'; // Afternoon
  if (hour >= 17 && hour < 21) return 'calm'; // Evening
  return 'calm'; // Night
}

/**
 * Calculate mood based on sentiment history and time
 */
function calculateMood(sentimentHistory: Sentiment[], timeOfDay: Mood): Mood {
  if (sentimentHistory.length === 0) return timeOfDay;
  
  // Average sentiment score
  const avgScore = sentimentHistory.reduce((sum, s) => sum + getSentimentScore(s), 0) / sentimentHistory.length;
  
  // Combine with time of day
  if (avgScore >= 1.5) return 'happy';
  if (avgScore >= 0.5) return 'energetic';
  if (avgScore >= -0.5) return timeOfDay;
  if (avgScore >= -1.5) return 'calm';
  return 'sad';
}

/**
 * Load mood state from storage
 */
export async function loadMoodState(): Promise<MoodState> {
  try {
    const stored = await AsyncStorage.getItem(MOOD_STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored);
      
      // Reset if it's a new day
      const now = new Date();
      const storedDate = new Date(state.lastUpdated);
      
      if (now.getDate() !== storedDate.getDate()) {
        return getInitialMoodState();
      }
      
      return state;
    }
  } catch (error) {
    console.error('Error loading mood state:', error);
  }
  
  return getInitialMoodState();
}

/**
 * Get initial mood state
 */
function getInitialMoodState(): MoodState {
  const now = new Date();
  const timeOfDay = getTimeOfDayMood();
  
  return {
    currentMood: timeOfDay,
    moodScore: 0,
    lastUpdated: now.getTime(),
    dayOfWeek: now.getDay(),
    hourOfDay: now.getHours(),
    interactionCount: 0,
    userSentimentHistory: [],
  };
}

/**
 * Update mood based on user message sentiment
 */
export async function updateMoodFromUserSentiment(userMessage: string): Promise<MoodState> {
  const state = await loadMoodState();
  const sentiment = analyzeSentiment(userMessage);
  
  // Add to history (keep last 5)
  state.userSentimentHistory.push(sentiment);
  if (state.userSentimentHistory.length > 5) {
    state.userSentimentHistory.shift();
  }
  
  // Update mood
  const timeOfDay = getTimeOfDayMood();
  state.currentMood = calculateMood(state.userSentimentHistory, timeOfDay);
  state.moodScore = state.userSentimentHistory.reduce(
    (sum, s) => sum + getSentimentScore(s), 0
  ) / state.userSentimentHistory.length;
  
  state.interactionCount++;
  state.lastUpdated = Date.now();
  
  // Save to storage
  await AsyncStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(state));
  
  return state;
}

/**
 * Get TTS parameters based on current mood
 */
export function getTTSParametersForMood(mood: Mood): { rate: number; pitch: number } {
  switch (mood) {
    case 'happy':
      return { rate: 1.0, pitch: 1.2 }; // Faster, higher pitch
    case 'energetic':
      return { rate: 0.95, pitch: 1.15 };
    case 'neutral':
      return { rate: 0.9, pitch: 1.0 };
    case 'calm':
      return { rate: 0.8, pitch: 0.95 }; // Slower, slightly lower
    case 'sad':
      return { rate: 0.75, pitch: 0.85 }; // Much slower, lower pitch
  }
}

/**
 * Get message style adjustments based on mood
 */
export function getMessageStyleForMood(mood: Mood): {
  emojiFrequency: 'high' | 'medium' | 'low';
  exclamationMarks: number;
  warmth: 'high' | 'medium' | 'low';
} {
  switch (mood) {
    case 'happy':
      return { emojiFrequency: 'high', exclamationMarks: 2, warmth: 'high' };
    case 'energetic':
      return { emojiFrequency: 'medium', exclamationMarks: 1, warmth: 'high' };
    case 'neutral':
      return { emojiFrequency: 'low', exclamationMarks: 0, warmth: 'medium' };
    case 'calm':
      return { emojiFrequency: 'low', exclamationMarks: 0, warmth: 'medium' };
    case 'sad':
      return { emojiFrequency: 'low', exclamationMarks: 0, warmth: 'high' };
  }
}

/**
 * Get mood-specific greeting
 */
export function getMoodGreeting(mood: Mood, userName: string): string {
  const greetings: Record<Mood, string[]> = {
    happy: [
      `Hey ${userName}! 🎉 You seem to be in a great mood today!`,
      `${userName}! 😊 Your energy is amazing today!`,
      `Wonderful to see you, ${userName}! ✨`,
    ],
    energetic: [
      `${userName}! Ready to tackle the day? 💪`,
      `Great to see you, ${userName}!`,
      `${userName}, let's make today count!`,
    ],
    neutral: [
      `Hi ${userName}. How's your day going?`,
      `Hey ${userName}, what's on your mind?`,
      `${userName}, how can I help today?`,
    ],
    calm: [
      `${userName}, take a moment. I'm here for you. 🌿`,
      `Let's take things slow today, ${userName}.`,
      `${userName}, no rush. I'm listening.`,
    ],
    sad: [
      `${userName}, I'm here for you. 💙`,
      `${userName}, it's okay to feel this way. Want to talk?`,
      `I see you're having a tough time. I'm here to listen.`,
    ],
  };
  
  const moodGreetings = greetings[mood];
  return moodGreetings[Math.floor(Math.random() * moodGreetings.length)];
}

/**
 * Get mood-specific closing
 */
export function getMoodClosing(mood: Mood): string {
  const closings: Record<Mood, string[]> = {
    happy: [
      'Keep that energy going! 🌟',
      'You\'ve got this!',
      'Enjoy your day!',
    ],
    energetic: [
      'Go make things happen! 💪',
      'You\'re doing great!',
      'Keep moving forward!',
    ],
    neutral: [
      'Feel free to reach out anytime.',
      'I\'m here whenever you need me.',
      'Take care!',
    ],
    calm: [
      'Remember to breathe. You\'re doing well. 🌿',
      'Be gentle with yourself.',
      'I\'m always here if you need me.',
    ],
    sad: [
      'You\'re not alone. I\'m here for you. 💙',
      'It\'s okay to feel this way. Take care of yourself.',
      'Remember, this feeling will pass.',
    ],
  };
  
  const moodClosings = closings[mood];
  return moodClosings[Math.floor(Math.random() * moodClosings.length)];
}

/**
 * Reset mood for new day
 */
export async function resetMoodForNewDay(): Promise<MoodState> {
  const state = getInitialMoodState();
  await AsyncStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(state));
  return state;
}

/**
 * Get mood emoji
 */
export function getMoodEmoji(mood: Mood): string {
  switch (mood) {
    case 'happy':
      return '😄';
    case 'energetic':
      return '⚡';
    case 'neutral':
      return '😌';
    case 'calm':
      return '🧘';
    case 'sad':
      return '💙';
  }
}
