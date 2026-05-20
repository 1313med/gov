const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const { authLimiter, apiLimiter } = require("./middlewares/rateLimiter");
const logger = require("./utils/logger");
const { loadAllowedOrigins, isOriginAllowed } = require("./utils/corsAllow");

const app = express();

const allowedOrigins = loadAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
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
app.use("/api/admin",            require("./routes/adminRoutes"));
app.use("/api/customer-feedback", require("./routes/customerFeedbackRoutes"));
app.use("/api/user-car",          require("./routes/userCarRoutes"));
app.use("/api/price",             require("./routes/priceRoutes"));

// ── NEW FEATURE ROUTES ────────────────────────────────────────────────────────
app.use("/api/kyc",           require("./routes/kycRoutes"));
app.use("/api/blacklist",     require("./routes/blacklistRoutes"));
app.use("/api/staff",         require("./routes/staffRoutes"));
app.use("/api/contracts",     require("./routes/contractRoutes"));
app.use("/api/extensions",    require("./routes/extensionRoutes"));
app.use("/api/referral",      require("./routes/referralRoutes"));
app.use("/api/fair-price",    require("./routes/fairPriceRoutes"));
app.use("/api/credit-check",  require("./routes/creditCheckRoutes"));
app.use("/api/reports",       require("./routes/listingReportRoutes"));
app.use("/api/fuel-logs",     require("./routes/fuelLogRoutes"));

// ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

module.exports = app;
