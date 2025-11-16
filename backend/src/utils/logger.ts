type LogLevel = "info" | "warn" | "error";

const formatLog = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
};

const log =
  (level: LogLevel) =>
  (message: string, meta?: Record<string, unknown>) => {
    const formattedMessage = formatLog(level, message, meta);
    switch (level) {
      case "warn":
        console.warn(formattedMessage);
        break;
      case "error":
        console.error(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  };

const logger = {
  info: log("info"),
  warn: log("warn"),
  error: log("error")
};

export default logger;
