import { NextFunction, Request, Response, Router } from "express";

import { generateAllyReply } from "../services/llm";
import { getRelevantMemories, saveMemory } from "../services/memory";
import type { ChatMessage } from "../types/chat";
import logger from "../utils/logger";

interface ChatRequestBody {
  message?: string;
  userId?: string;
  system_prompt?: string;
  conversation?: ChatMessage[];
  memory?: string;
  therapist_mode?: boolean;
}

const chatRouter = Router();

chatRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, conversation, userId, memory, therapist_mode } = (req.body ?? {}) as ChatRequestBody;
    const normalizedUserId =
      typeof userId === "string" && userId.trim().length > 0 ? userId.trim() : "anonymous";
    logger.info("Received chat request", {
      userId: normalizedUserId,
      hasConversation: Array.isArray(conversation),
      messagePreview:
        typeof message === "string" ? message.slice(0, 80) : undefined
    });

    const trimmedMessage =
      typeof message === "string" && message.trim().length > 0
        ? message.trim()
        : undefined;

    const fallbackMessage =
      Array.isArray(conversation) && conversation.length > 0
        ? [...conversation]
            .reverse()
            .find(
              (entry) =>
                entry.role === "user" &&
                typeof entry.content === "string" &&
                entry.content.trim().length > 0
            )
            ?.content.trim()
        : undefined;

    const finalMessage = trimmedMessage ?? fallbackMessage;

    if (!finalMessage) {
      logger.warn("Chat request missing message content", { userId: normalizedUserId });
      return res.status(400).json({
        error: "A non-empty message is required to continue the chat."
      });
    }

    const relevantMemories = await getRelevantMemories(normalizedUserId, finalMessage);
    const memoryContext =
      memory ||
      (relevantMemories.length > 0
        ? relevantMemories.map((entry) => entry.content).join("\n")
        : undefined);

    const reply = await generateAllyReply({
      message: finalMessage,
      conversation,
      memory: memoryContext,
      therapistMode: therapist_mode,
      userId: normalizedUserId
    });

    const nextMemory = reply.memoryBlob ?? finalMessage;
    if (nextMemory && nextMemory.trim().length > 10) {
      await saveMemory(normalizedUserId, {
        content: nextMemory.trim(),
        timestamp: Date.now(),
        source: reply.memoryBlob ? "model" : "user"
      });
    }

    logger.info("Responding to chat request", {
      userId: normalizedUserId,
      responsePreview: reply.message.slice(0, 80)
    });

    return res.json({
      ...reply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

export default chatRouter;
