import OpenAI from "openai";

import logger from "../utils/logger";
import type { ChatMessage } from "../types/chat";

const MODEL_NAME = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS ?? 15000);
const EMOTION_TAGS = ["calm", "grounded", "encouraging", "warm", "hopeful", "caring", "supportive"] as const;
type EmotionTag = (typeof EMOTION_TAGS)[number];
const ALLY_PERSONA_PROMPT = `
You are Ally, a compassionate AI companion designed to help young adults feel seen, supported, and grounded.
- Speak in a warm, calm, human tone.
- Reflect back what you heard before offering gentle guidance or questions.
- Emphasize emotional understanding over problem-solving.
- Keep responses concise (2-3 short paragraphs max).
- Encourage users to share more at the end of each response.
- Respond with JSON using this format:
  {
    "reply": "<your empathetic response>",
    "emotion": "<one of ${EMOTION_TAGS.join(", ")}>"
  }
`.trim();

const openAiClient =
  process.env.OPENAI_API_KEY?.trim().length
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export interface GenerateAllyReplyOptions {
  message: string;
  conversation?: ChatMessage[];
  memory?: string;
  therapistMode?: boolean;
  userId?: string;
}

export interface AllyReply {
  message: string;
  emotion?: EmotionTag;
  shouldSaveMemory: boolean;
  memoryBlob?: string | null;
}

export const generateAllyReply = async (options: GenerateAllyReplyOptions): Promise<AllyReply> => {
  if (!openAiClient) {
    logger.warn("OPENAI_API_KEY not set. Falling back to canned Ally response.");
    return getFallbackReply(options.message);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    const messages = buildMessages(options);

    const response = await openAiClient.chat.completions.create(
      {
        model: MODEL_NAME,
        temperature: options.therapistMode ? 0.6 : 0.8,
        max_tokens: 350,
        messages
      },
      { signal: controller.signal }
    );

    const rawReply = response.choices[0]?.message?.content?.trim();

    if (!rawReply) {
      throw new Error("LLM did not return content");
    }

    return parseModelReply(rawReply);
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    logger.error("Failed to generate Ally reply", {
      reason: isAbort ? "timeout" : "api_error",
      error: error instanceof Error ? error.message : "unknown"
    });
    return getFallbackReply(options.message);
  } finally {
    clearTimeout(timeout);
  }
};

const buildMessages = (options: GenerateAllyReplyOptions): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  const systemDirectives = [
    ALLY_PERSONA_PROMPT,
    options.therapistMode
      ? "Lean into gentle CBT-style reframes while staying conversational."
      : "",
    options.memory ? `Relevant memories: ${options.memory}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");

  const builtMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemDirectives }
  ];

  if (Array.isArray(options.conversation) && options.conversation.length > 0) {
    builtMessages.push(
      ...options.conversation.map<OpenAI.Chat.Completions.ChatCompletionMessageParam>((message) => ({
        role: message.role,
        content: message.content
      }))
    );
  }

  const lastMessage = builtMessages[builtMessages.length - 1];

  if (!lastMessage || lastMessage.role !== "user") {
    builtMessages.push({
      role: "user",
      content: options.message
    });
  }

  return builtMessages;
};

const getFallbackReply = (message: string): AllyReply => {
  const softResponses = [
    "Thanks for trusting me with that. I'm here with you - what feels most present right now?",
    "I hear how much this is weighing on you. Let's pause and take a breath together before we keep going.",
    "You don't have to carry this alone. I'm here, and I'm listening whenever you need to talk.",
    "It sounds like a lot. I'm right beside you - what would feel most supportive in this moment?"
  ];

  const hint = message?.trim()
    ? `You mentioned "${message.slice(0, 60)}..."`
    : "Thank you for checking in.";

  const reply = `${hint} ${softResponses[Math.floor(Math.random() * softResponses.length)]}`;

  return {
    message: reply,
    shouldSaveMemory: false,
    memoryBlob: null,
    emotion: "supportive"
  };
};

type ParsedModelResponse = {
  reply?: string;
  emotion?: string;
  shouldSaveMemory?: boolean;
  memoryBlob?: string | null;
};

const parseModelReply = (raw: string): AllyReply => {
  try {
    const parsed = JSON.parse(raw) as ParsedModelResponse;
    return {
      message: parsed.reply ?? raw,
      emotion: normaliseEmotion(parsed.emotion) ?? "supportive",
      shouldSaveMemory: parsed.shouldSaveMemory ?? false,
      memoryBlob: parsed.memoryBlob ?? null
    };
  } catch {
    return {
      message: raw,
      emotion: "supportive",
      shouldSaveMemory: false,
      memoryBlob: null
    };
  }
};

const normaliseEmotion = (emotion?: string): EmotionTag | undefined => {
  if (!emotion) {
    return undefined;
  }
  const normalized = emotion.toLowerCase().trim();
  return EMOTION_TAGS.includes(normalized as EmotionTag) ? (normalized as EmotionTag) : undefined;
};
