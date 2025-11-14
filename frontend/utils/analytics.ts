/**
 * Simple analytics event logger
 * Logs events to console and can be extended to send to backend
 */

export type AnalyticsEvent =
  | 'onboardingCompleted'
  | 'messageSent'
  | 'checkInResponded'
  | 'memorySaved'
  | 'memoryDeleted'
  | 'memoryExported'
  | 'therapistModeToggled'
  | 'personaUpdated'
  | 'ttsToggled';

interface EventPayload {
  event: AnalyticsEvent;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an analytics event
 */
export function logEvent(
  event: AnalyticsEvent,
  userId?: string,
  metadata?: Record<string, unknown>
): void {
  const payload: EventPayload = {
    event,
    timestamp: new Date().toISOString(),
    userId,
    metadata,
  };

  console.log('[Analytics]', JSON.stringify(payload, null, 2));

  // TODO: Send to backend analytics service
  // Example: fetch('https://api.example.com/analytics', { method: 'POST', body: JSON.stringify(payload) })
}

/**
 * Log onboarding completion
 */
export function logOnboardingCompleted(userId: string, tone: string, frequency: string): void {
  logEvent('onboardingCompleted', userId, {
    preferredTone: tone,
    checkInFrequency: frequency,
  });
}

/**
 * Log message sent
 */
export function logMessageSent(userId: string, messageLength: number): void {
  logEvent('messageSent', userId, {
    messageLength,
  });
}

/**
 * Log check-in response
 */
export function logCheckInResponded(userId: string, responseLength: number): void {
  logEvent('checkInResponded', userId, {
    responseLength,
  });
}

/**
 * Log memory saved
 */
export function logMemorySaved(userId: string, memoryLength: number): void {
  logEvent('memorySaved', userId, {
    memoryLength,
  });
}

/**
 * Log memory deleted
 */
export function logMemoryDeleted(userId: string, count: number): void {
  logEvent('memoryDeleted', userId, {
    count,
  });
}

/**
 * Log memory exported
 */
export function logMemoryExported(userId: string, count: number): void {
  logEvent('memoryExported', userId, {
    count,
  });
}

/**
 * Log therapist mode toggle
 */
export function logTherapistModeToggled(userId: string, enabled: boolean): void {
  logEvent('therapistModeToggled', userId, {
    enabled,
  });
}

/**
 * Log persona updated
 */
export function logPersonaUpdated(userId: string): void {
  logEvent('personaUpdated', userId);
}

/**
 * Log TTS toggle
 */
export function logTtsToggled(userId: string, enabled: boolean): void {
  logEvent('ttsToggled', userId, {
    enabled,
  });
}
