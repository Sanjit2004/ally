import { Router } from "express";

import { synthesizeSpeech } from "../services/tts";
import logger from "../utils/logger";

const ttsRouter = Router();

interface SynthesizeBody {
  text?: string;
  voice?: string;
  speed?: number;
}

ttsRouter.post("/synthesize", async (req, res) => {
  const body = req.body as SynthesizeBody | undefined;
  const text = body?.text?.trim();

  if (!text) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  try {
    const result = await synthesizeSpeech({
      text,
      voice: body?.voice,
      speed: typeof body?.speed === "number" ? body.speed : undefined,
    });

    res.json(result);
  } catch (error) {
    logger.error("Failed to synthesize speech", {
      error,
    });
    res.status(500).json({ error: "Failed to synthesize speech" });
  }
});

export default ttsRouter;
