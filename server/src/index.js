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
const app = require("./app");
const connectDB = require("./config/db");
const { setIo } = require("./utils/socketManager");
const maintenanceCron = require("./utils/maintenanceCron");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Socket CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach io to socketManager so controllers can emit events
setIo(io);

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) socket.join(userId.toString());
  });
  socket.on("disconnect", () => {});
});

connectDB()
  .then(() => {
    maintenanceCron.start();
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  })
  .catch((err) => {
    logger.error(`DB connection failed: ${err.message}`);
    process.exit(1);
  });
