import { Router } from "express";

import { kokoroTTSService } from "../services/kokoroTTS";
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
    const result = await kokoroTTSService.synthesize({
      text,
      voice: body?.voice,
      speed: typeof body?.speed === "number" ? body.speed : undefined,
    });

    const base64 = await kokoroTTSService.readAudioBase64(result.audioPath);

    res.json({
      audioBase64: base64,
      mimeType: result.mimeType,
      durationSeconds: result.durationSeconds,
    });

    // Fire and forget cleanup
    void kokoroTTSService.deleteFile(result.audioPath);
  } catch (error) {
    logger.error("Failed to synthesize speech", {
      error,
    });
    res.status(500).json({ error: "Failed to synthesize speech" });
  }
});

export default ttsRouter;
