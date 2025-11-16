import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export type CheckInFrequency = 'daily' | 'every-other-day' | 'weekly' | 'minute-by-minute';

const NOTIFICATION_ID_KEY = '@ally_notification_id';
const NOTIFICATION_CONFIG_KEY = '@ally_notification_config';

interface StoredNotificationConfig {
  id: string;
  frequency: CheckInFrequency;
  userId: string;
}

async function readStoredNotificationConfig(): Promise<StoredNotificationConfig | null> {
  const rawConfig = await AsyncStorage.getItem(NOTIFICATION_CONFIG_KEY);
  if (rawConfig) {
    try {
      const parsed = JSON.parse(rawConfig) as StoredNotificationConfig;
      if (parsed?.id && parsed?.frequency) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse stored notification config, falling back to legacy value.', error);
    }
  }

  const legacyId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
  if (legacyId) {
    return {
      id: legacyId,
      frequency: 'daily',
      userId: 'unknown',
    };
  }

  return null;
}

async function persistNotificationConfig(config: StoredNotificationConfig): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_CONFIG_KEY, JSON.stringify(config));
  await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
}

/**
 * Get milliseconds for check-in frequency
 */
function getFrequencyMs(frequency: CheckInFrequency): number {
  switch (frequency) {
    case 'daily':
      return 24 * 60 * 60 * 1000; // 24 hours
    case 'every-other-day':
      return 48 * 60 * 60 * 1000; // 48 hours
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000; // 7 days
    case 'minute-by-minute':
      return 60 * 1000; // 1 minute
  }
}

/**
 * Schedule a check-in notification
 * @param frequency - How often to check in
 * @param userId - User ID for tracking
 */
export async function scheduleCheckInNotification(
  frequency: CheckInFrequency,
  userId: string
): Promise<void> {
  try {
    await cancelCheckInNotification();

    const intervalMs = getFrequencyMs(frequency);
    const triggerSeconds = Math.max(60, Math.round(intervalMs / 1000));

    // Schedule repeating notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Ally Check-in",
        body: "How are you doing today? Let's chat!",
        data: {
          type: 'check-in',
          userId,
        },
      },
      trigger: {
        seconds: triggerSeconds,
        repeats: true,
      },
    });

    await persistNotificationConfig({
      id: notificationId,
      frequency,
      userId,
    });
    console.log('Check-in notification scheduled:', notificationId);
  } catch (error) {
    console.error('Error scheduling check-in notification:', error);
  }
}

/**
 * Cancel all check-in notifications
 */
export async function cancelCheckInNotification(): Promise<void> {
  try {
    const storedConfig = await readStoredNotificationConfig();
    if (storedConfig?.id) {
      await Notifications.cancelScheduledNotificationAsync(storedConfig.id);
      console.log('Check-in notification cancelled');
    }
    await AsyncStorage.removeItem(NOTIFICATION_CONFIG_KEY);
    await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
  } catch (error) {
    console.error('Error cancelling check-in notification:', error);
  }
}

/**
 * Set up notification response listener
 * Handles when user taps a notification
 */
export function setupNotificationResponseListener(): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      
      if (data.type === 'check-in') {
        // Navigate to chat screen
        router.push('/(tabs)/chat');
        
        // Signal to ChatScreen to append check-in message
        // This will be handled via a global event or state
        console.log('Check-in notification tapped');
      }
    }
  );

  return () => subscription.remove();
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Ensure notifications match the stored user preference. Schedules a new notification when needed.
 */
export async function ensureCheckInNotification(
  frequency: CheckInFrequency,
  userId: string
): Promise<void> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.status !== 'granted') {
      return;
    }

    const storedConfig = await readStoredNotificationConfig();
    if (!storedConfig || storedConfig.frequency !== frequency || storedConfig.userId !== userId) {
      await scheduleCheckInNotification(frequency, userId);
    }
  } catch (error) {
    console.error('Error ensuring check-in notification:', error);
  }
}
