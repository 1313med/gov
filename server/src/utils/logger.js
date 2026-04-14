const { createLogger, format, transports } = require("winston");
const { combine, timestamp, colorize, printf, errors, json } = format;

const isDev = process.env.NODE_ENV !== "production";

// Console format: readable in development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack
      ? `${timestamp} ${level}: ${message}\n${stack}`
      : `${timestamp} ${level}: ${message}`
  )
);

// JSON format for production (works with log aggregators like Datadog / Papertrail)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: isDev ? "debug" : "info",
  format: isDev ? devFormat : prodFormat,
  transports: [
    new transports.Console(),
    // In production, also write errors to a file
    ...(!isDev
      ? [new transports.File({ filename: "logs/error.log", level: "error" }),
         new transports.File({ filename: "logs/combined.log" })]
      : []),
  ],
});

// Convenience stream for morgan
logger.http = (msg) => logger.log("http", msg);

module.exports = logger;
