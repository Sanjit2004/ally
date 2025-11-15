import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    // Cancel any existing notification
    const existingId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    }

    const intervalMs = getFrequencyMs(frequency);
    const triggerMs = intervalMs; // First notification after interval

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
        seconds: Math.floor(triggerMs / 1000),
        repeats: true,
      },
    });

    // Save notification ID for later cancellation
    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, notificationId);
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
    const notificationId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
      console.log('Check-in notification cancelled');
    }
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
