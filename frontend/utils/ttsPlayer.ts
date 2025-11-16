import { Audio, AVPlaybackStatusSuccess, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

import { synthesizeSpeech, type TTSOptions } from '@/api/tts';
import { guessVisemeFromText, REST_VISEME, type VisemeCommand } from '@/utils/lipsync';

export interface PlaySpeechOptions extends TTSOptions {
  onViseme?: (command: VisemeCommand) => void;
  onStart?: () => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
}

export interface SpeechPlaybackHandle {
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  isPaused: () => boolean;
}

const FALLBACK_SECONDS_PER_CHAR = 0.065; // Roughly 65ms per character
const MIN_FALLBACK_DURATION_SECONDS = 1.5;

function buildCharIndices(text: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i]?.trim()) {
      indices.push(i);
    }
  }
  return indices;
}

export async function playKokoroSpeech(options: PlaySpeechOptions): Promise<SpeechPlaybackHandle> {
  const { text, voice, speed, onViseme, onStart, onFinish, onError } = options;
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error('Text is required for speech synthesis.');
  }

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    });
  } catch (error) {
    console.warn('Failed to set audio mode for Kokoro playback:', error);
  }

  const response = await synthesizeSpeech({ text: trimmedText, voice, speed });
  const dataUri = `data:${response.mimeType};base64,${response.audioBase64}`;
  const { sound } = await Audio.Sound.createAsync(
    { uri: dataUri },
    { shouldPlay: false, progressUpdateIntervalMillis: 60 }
  );

  const charIndices = buildCharIndices(trimmedText);
  let lastVisemeIndex = -1;
  let lastVisemeShape: VisemeCommand['shape'] | null = null;
  let lastVisemeAmount = 0;
  let hasStarted = false;
  let hasFinished = false;
  let paused = false;

  const fallbackDurationMs = Math.max(
    (response.durationSeconds ?? 0) * 1000,
    Math.max(trimmedText.length * FALLBACK_SECONDS_PER_CHAR * 1000, MIN_FALLBACK_DURATION_SECONDS * 1000)
  );

  const cleanup = async () => {
    if (hasFinished) return;
    hasFinished = true;
    try {
      sound.setOnPlaybackStatusUpdate(null);
      await sound.stopAsync().catch(() => undefined);
      await sound.unloadAsync().catch(() => undefined);
    } finally {
      lastVisemeShape = null;
      lastVisemeAmount = 0;
      onViseme?.(REST_VISEME);
      onFinish?.();
    }
  };

  // Prime the viewer with a neutral pose before playback begins
  onViseme?.(REST_VISEME);

  sound.setOnPlaybackStatusUpdate((status) => {
    if (hasFinished) {
      return;
    }

    if (!status.isLoaded) {
      if (status.error) {
        const error = new Error(status.error);
        onError?.(error);
        void cleanup();
      }
      return;
    }

    const playbackStatus = status as AVPlaybackStatusSuccess;

    if (playbackStatus.didJustFinish) {
      void cleanup();
      return;
    }

    if (playbackStatus.isPlaying && !hasStarted) {
      hasStarted = true;
      paused = false;
      onStart?.();
    }

    if (!playbackStatus.isPlaying && !playbackStatus.isBuffering && playbackStatus.positionMillis === 0 && hasStarted && !paused) {
      // Playback was manually stopped
      void cleanup();
      return;
    }

    const durationMs = playbackStatus.durationMillis ?? fallbackDurationMs;
    if (!playbackStatus.isPlaying || durationMs <= 0 || charIndices.length === 0) {
      return;
    }

    const position = playbackStatus.positionMillis ?? 0;
    const progress = Math.min(position / durationMs, 0.9999);
    const targetIndex = Math.min(charIndices.length - 1, Math.max(0, Math.floor(progress * charIndices.length)));
    const estimatedVisemeDuration = Math.max(80, Math.round(durationMs / Math.max(charIndices.length, 1)));

    if (targetIndex > lastVisemeIndex) {
      for (let index = lastVisemeIndex + 1; index <= targetIndex; index += 1) {
        const charIndex = charIndices[index];
        const viseme = guessVisemeFromText(trimmedText, charIndex);
        if (viseme) {
          const shouldEmit = viseme.shape !== lastVisemeShape || Math.abs(viseme.amount - lastVisemeAmount) > 0.05;
          if (shouldEmit) {
            onViseme?.({ ...viseme, duration: estimatedVisemeDuration });
            lastVisemeShape = viseme.shape;
            lastVisemeAmount = viseme.amount;
          }
        }
      }
      lastVisemeIndex = targetIndex;
    }
  });

  await sound.playAsync();

  return {
    stop: async () => {
      if (hasFinished) return;
      await cleanup();
    },
    pause: async () => {
      if (hasFinished || paused) return;
      paused = true;
      await sound.pauseAsync().catch(() => undefined);
    },
    resume: async () => {
      if (hasFinished || !paused) return;
      paused = false;
      await sound.playAsync().catch((error) => {
        onError?.(error);
      });
    },
    isPaused: () => paused,
  };
}
