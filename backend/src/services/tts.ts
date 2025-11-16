import OpenAI from "openai";

import logger from "../utils/logger";

const DEFAULT_TTS_VOICE = process.env.OPENAI_TTS_VOICE ?? "alloy";
const DEFAULT_TTS_MODEL = process.env.OPENAI_TTS_MODEL ?? "tts-1";
const DEFAULT_TTS_SPEED = Number(process.env.OPENAI_TTS_SPEED ?? 1.0);

const openAiClient =
  process.env.OPENAI_API_KEY?.trim().length
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

interface SynthesizeOptions {
  text: string;
  voice?: string;
  speed?: number;
}

interface SynthesizeResult {
  audioBase64: string;
  mimeType: string;
  durationSeconds: number | null;
}

export const synthesizeSpeech = async (options: SynthesizeOptions): Promise<SynthesizeResult> => {
  if (!openAiClient) {
    throw new Error("OPENAI_API_KEY must be set to use TTS");
  }

  const voice = options.voice?.trim() || DEFAULT_TTS_VOICE;
  const speed = typeof options.speed === "number" ? options.speed : DEFAULT_TTS_SPEED;

  if (!options.text?.trim()) {
    throw new Error("text is required");
  }

  const response = await openAiClient.audio.speech.create({
    model: DEFAULT_TTS_MODEL,
    voice,
    input: options.text,
    speed,
  });

  const audioBytes = response.arrayBuffer ? await response.arrayBuffer() : null;

  if (!audioBytes) {
    logger.error("OpenAI TTS response did not include audio data");
    throw new Error("Failed to generate speech");
  }

  const base64 = Buffer.from(audioBytes).toString("base64");

  const mimeType = "audio/mpeg";

  return {
    audioBase64: base64,
    mimeType,
    durationSeconds: null,
  };
};
