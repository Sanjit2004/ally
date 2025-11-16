import { getApiBaseUrl } from '@/api/chat';

export interface TTSOptions {
  text: string;
  voice?: string;
  speed?: number;
}

export interface TTSResponse {
  audioBase64: string;
  mimeType: string;
  durationSeconds: number | null;
}

export async function synthesizeSpeech({ text, voice, speed }: TTSOptions): Promise<TTSResponse> {
  const trimmed = text?.trim();
  if (!trimmed) {
    throw new Error('Text is required for speech synthesis.');
  }

  const response = await fetch(`${getApiBaseUrl()}/tts/synthesize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: trimmed, voice, speed }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload?.error || `TTS request failed with status ${response.status}`;
    throw new Error(message);
  }

  const data = (await response.json()) as TTSResponse;
  if (!data?.audioBase64 || !data?.mimeType) {
    throw new Error('Invalid response from TTS service.');
  }

  return data;
}
