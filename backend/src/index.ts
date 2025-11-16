import "./config/env";

import cors from "cors";
import express from "express";

import chatRouter from "./routes/chat";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  logger.info(`Incoming ${req.method} ${req.originalUrl}`, {
    hasBody: ["POST", "PUT", "PATCH"].includes(req.method),
    userAgent: req.headers["user-agent"] ?? "unknown"
  });
  next();
});

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ally-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/chat", chatRouter);

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : "Unexpected error";
  logger.error("Unhandled error during request", {
    path: req.originalUrl,
    method: req.method,
    error: message
  });
  res.status(500).json({
    error: "Something went wrong while processing your request. Please try again."
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Ally backend running at http://localhost:${PORT}`);
  });
}

export default app;
export { app };
