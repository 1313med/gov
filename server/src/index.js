require("dotenv").config();

// ─────────────────────────────────────────────────────────────────────────────
// Environment validation — crash immediately with a clear message if a
// required variable is missing rather than failing silently at runtime.
// ─────────────────────────────────────────────────────────────────────────────
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`\n❌  Missing required environment variables: ${missing.join(", ")}`);
  console.error("    Check your .env file and compare with .env.example\n");
  process.exit(1);
}

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const app = require("./app");
const connectDB = require("./config/db");
const { setIo } = require("./utils/socketManager");
const maintenanceCron = require("./utils/maintenanceCron");
const returnCron      = require("./utils/returnCron");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const { loadAllowedOrigins, isOriginAllowed } = require("./utils/corsAllow");
const allowedOrigins = loadAllowedOrigins();

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (isOriginAllowed(origin, allowedOrigins)) return cb(null, true);
      cb(new Error(`Socket CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const authHeader = socket.handshake.headers?.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    const token = socket.handshake.auth?.token || bearerToken;

    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return next(new Error("Unauthorized"));

    socket.userId = decoded.id.toString();
    return next();
  } catch {
    return next(new Error("Unauthorized"));
  }
});

// Attach io to socketManager so controllers can emit events
setIo(io);

io.on("connection", (socket) => {
  socket.join(socket.userId);
  socket.on("disconnect", () => {});
});

connectDB()
  .then(() => {
    maintenanceCron.start();
    returnCron.start();
    server.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  })
  .catch((err) => {
    logger.error(`DB connection failed: ${err.message}`);
    process.exit(1);
  });
