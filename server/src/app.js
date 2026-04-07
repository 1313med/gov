const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const { authLimiter, apiLimiter } = require("./middlewares/rateLimiter");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Global rate limit
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

// ROUTES
app.use("/api/auth",          authLimiter, require("./routes/authRoutes"));
app.use("/api/sale",          require("./routes/saleRoutes"));
app.use("/api/rental",        require("./routes/rentalRoutes"));
app.use("/api/user",          require("./routes/userRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/bookings",      require("./routes/bookingRoutes"));
app.use("/api/analytics",     require("./routes/analyticsRoutes"));
app.use("/api/reviews",       require("./routes/reviewRoutes"));
app.use("/api/messages",      require("./routes/messageRoutes"));
app.use("/api/admin",         require("./routes/adminRoutes"));

// ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

module.exports = app;
