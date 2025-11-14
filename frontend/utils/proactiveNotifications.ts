/**
 * Proactive Notification System for Ally
 * Sends contextual messages based on time of day and user history
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMemories } from '@/store/memory';

export type NotificationFrequency = 'none' | 'daily' | 'twice_daily';

interface NotificationSchedule {
  frequency: NotificationFrequency;
  times: number[]; // hours (0-23)
  enabled: boolean;
}

interface ProactiveMessage {
  id: string;
  title: string;
  body: string;
  emoji: string;
  context: string; // 'morning' | 'afternoon' | 'evening' | 'night'
  contextual: boolean; // references previous interactions
}

const NOTIFICATION_SCHEDULE_KEY = '@ally_notification_schedule';
const LAST_NOTIFICATION_KEY = '@ally_last_notification_time';

/**
 * Get default notification schedule
 */
function getDefaultSchedule(frequency: NotificationFrequency): NotificationSchedule {
  switch (frequency) {
    case 'daily':
      return {
        frequency: 'daily',
        times: [9], // 9 AM
        enabled: true,
      };
    case 'twice_daily':
      return {
        frequency: 'twice_daily',
        times: [9, 18], // 9 AM and 6 PM
        enabled: true,
      };
    case 'none':
    default:
      return {
        frequency: 'none',
        times: [],
        enabled: false,
      };
  }
}

/**
 * Save notification schedule
 */
export async function saveNotificationSchedule(frequency: NotificationFrequency): Promise<void> {
  const schedule = getDefaultSchedule(frequency);
  await AsyncStorage.setItem(NOTIFICATION_SCHEDULE_KEY, JSON.stringify(schedule));
}

/**
 * Load notification schedule
 */
export async function loadNotificationSchedule(): Promise<NotificationSchedule> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SCHEDULE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading notification schedule:', error);
  }
  
  return getDefaultSchedule('daily');
}

/**
 * Get contextual greeting based on time of day
 */
function getTimeContext(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Generate proactive messages based on time and context
 */
async function generateProactiveMessages(hour: number): Promise<ProactiveMessage[]> {
  const context = getTimeContext(hour);
  const memories = await getMemories();
  
  const messages: ProactiveMessage[] = [];
  
  // Morning messages
  if (context === 'morning') {
    messages.push(
      {
        id: 'morning_1',
        title: 'Good Morning! ☀️',
        body: 'How are you feeling today? Let\'s chat!',
        emoji: '☀️',
        context: 'morning',
        contextual: false,
      },
      {
        id: 'morning_2',
        title: 'Rise and Shine! 🌅',
        body: 'Ready to start your day? I\'m here to listen.',
        emoji: '🌅',
        context: 'morning',
        contextual: false,
      }
    );
    
    // Add contextual message if we have recent memories
    if (memories.length > 0) {
      const recentMemory = memories[0];
      messages.push({
        id: 'morning_contextual',
        title: 'Good Morning! ☀️',
        body: `I remember you mentioned "${recentMemory.content.substring(0, 40)}..." — how's that going?`,
        emoji: '☀️',
        context: 'morning',
        contextual: true,
      });
    }
  }
  
  // Afternoon messages
  if (context === 'afternoon') {
    messages.push(
      {
        id: 'afternoon_1',
        title: 'Afternoon Check-in 🌤️',
        body: 'How\'s your day going so far?',
        emoji: '🌤️',
        context: 'afternoon',
        contextual: false,
      },
      {
        id: 'afternoon_2',
        title: 'Taking a Break? ☕',
        body: 'Let\'s chat for a moment!',
        emoji: '☕',
        context: 'afternoon',
        contextual: false,
      }
    );
  }
  
  // Evening messages
  if (context === 'evening') {
    messages.push(
      {
        id: 'evening_1',
        title: 'How was your day? 🌆',
        body: 'I\'d love to hear about it!',
        emoji: '🌆',
        context: 'evening',
        contextual: false,
      },
      {
        id: 'evening_2',
        title: 'Evening Reflection 🌙',
        body: 'What was the highlight of your day?',
        emoji: '🌙',
        context: 'evening',
        contextual: false,
      }
    );
    
    // Add contextual message
    if (memories.length > 0) {
      const recentMemory = memories[0];
      messages.push({
        id: 'evening_contextual',
        title: 'How was your day? 🌆',
        body: `You mentioned work was stressful yesterday — doing better today?`,
        emoji: '🌆',
        context: 'evening',
        contextual: true,
      });
    }
  }
  
  // Night messages
  if (context === 'night') {
    messages.push(
      {
        id: 'night_1',
        title: 'Good Night 🌙',
        body: 'Sleep well! See you tomorrow.',
        emoji: '🌙',
        context: 'night',
        contextual: false,
      },
      {
        id: 'night_2',
        title: 'Sweet Dreams ✨',
        body: 'Rest well, you deserve it.',
        emoji: '✨',
        context: 'night',
        contextual: false,
      }
    );
  }
  
  return messages;
}

/**
 * Schedule proactive notifications
 */
export async function scheduleProactiveNotifications(userName: string): Promise<void> {
  try {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
      return;
    }

    // Load schedule
    const schedule = await loadNotificationSchedule();
    
    if (!schedule.enabled || schedule.times.length === 0) {
      return;
    }

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule for each time
    for (const hour of schedule.times) {
      // Generate messages for this hour
      const messages = await generateProactiveMessages(hour);
      
      // Pick a random message
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      // Schedule for today and next 7 days
      for (let day = 0; day < 7; day++) {
        const trigger = new Date();
        trigger.setDate(trigger.getDate() + day);
        trigger.setHours(hour, Math.floor(Math.random() * 60), 0);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: message.title,
            body: message.body,
            data: {
              type: 'proactive',
              context: message.context,
              contextual: message.contextual,
              messageId: message.id,
            },
          },
          trigger,
        });
      }
    }

    console.log('Proactive notifications scheduled');
  } catch (error) {
    console.error('Error scheduling proactive notifications:', error);
  }
}

/**
 * Update notification frequency
 */
export async function updateNotificationFrequency(frequency: NotificationFrequency): Promise<void> {
  await saveNotificationSchedule(frequency);
  
  if (frequency !== 'none') {
    // Re-schedule with new frequency
    const userName = await AsyncStorage.getItem('@user_display_name') || 'User';
    await scheduleProactiveNotifications(userName);
  } else {
    // Cancel all notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

/**
 * Get next scheduled notification time
 */
export async function getNextNotificationTime(): Promise<Date | null> {
  try {
    const schedule = await loadNotificationSchedule();
    
    if (!schedule.enabled || schedule.times.length === 0) {
      return null;
    }

    const now = new Date();
    const nextHour = schedule.times.find(h => h > now.getHours());
    
    if (nextHour !== undefined) {
      const next = new Date();
      next.setHours(nextHour, 0, 0);
      return next;
    }
    
    // Next day's first notification
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(schedule.times[0], 0, 0);
    return next;
  } catch (error) {
    console.error('Error getting next notification time:', error);
    return null;
  }
}

/**
 * Get notification frequency label
 */
export function getFrequencyLabel(frequency: NotificationFrequency): string {
  switch (frequency) {
    case 'daily':
      return 'Once daily';
    case 'twice_daily':
      return 'Twice daily';
    case 'none':
    default:
      return 'Disabled';
  }
}

/**
 * Handle notification response (when user taps notification)
 */
export async function handleNotificationResponse(
  response: Notifications.NotificationResponse
): Promise<{ shouldOpenChat: boolean; context?: string }> {
  const data = response.notification.request.content.data;
  
  if (data.type === 'proactive') {
    return {
      shouldOpenChat: true,
      context: data.context,
    };
  }
  
  return { shouldOpenChat: false };
}
