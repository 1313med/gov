const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const { authLimiter, apiLimiter } = require("./middlewares/rateLimiter");
const logger = require("./utils/logger");

const app = express();

// CORS — must specify exact origin for credentials (cookies) to work
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging (uses Winston in production, Morgan in dev)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// Global rate limit
app.use("/api", apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
  });
});

// ROUTES
app.use("/api/auth",          authLimiter, require("./routes/authRoutes"));
app.use("/api/upload",        require("./routes/uploadRoutes"));
app.use("/api/sale",          require("./routes/saleRoutes"));
app.use("/api/rental",        require("./routes/rentalRoutes"));
app.use("/api/user",          require("./routes/userRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/bookings",      require("./routes/bookingRoutes"));
app.use("/api/analytics",     require("./routes/analyticsRoutes"));
app.use("/api/reviews",       require("./routes/reviewRoutes"));
app.use("/api/messages",      require("./routes/messageRoutes"));
app.use("/api/maintenance",   require("./routes/maintenanceRoutes"));
app.use("/api/admin",         require("./routes/adminRoutes"));

// ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

module.exports = app;
