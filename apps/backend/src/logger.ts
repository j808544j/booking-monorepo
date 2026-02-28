type LogLevel = "debug" | "info" | "warn" | "error";

const levelWeights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
const currentLevel: LogLevel =
  envLevel in levelWeights ? envLevel : "info";

function shouldLog(level: LogLevel): boolean {
  return levelWeights[level] >= levelWeights[currentLevel];
}

function log(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): void {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ?? {})
  };

  const line = JSON.stringify(payload);

  switch (level) {
    case "debug":
    case "info":
      // eslint-disable-next-line no-console
      console.log(line);
      break;
    case "warn":
      // eslint-disable-next-line no-console
      console.warn(line);
      break;
    case "error":
      // eslint-disable-next-line no-console
      console.error(line);
      break;
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    log("debug", message, meta);
  },
  info(message: string, meta?: Record<string, unknown>): void {
    log("info", message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    log("warn", message, meta);
  },
  error(message: string, meta?: Record<string, unknown>): void {
    log("error", message, meta);
  }
};

