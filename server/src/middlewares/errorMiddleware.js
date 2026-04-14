const logger = require("../utils/logger");

function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not Found — ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log server errors (5xx) with full stack; client errors (4xx) at warn level
  if (statusCode >= 500) {
    logger.error(`${statusCode} ${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`${statusCode} ${req.method} ${req.originalUrl} — ${err.message}`);
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
