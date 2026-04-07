require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const { setIo } = require("./utils/socketManager");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Attach io to socketManager so controllers can emit events
setIo(io);

io.on("connection", (socket) => {
  // Client sends its userId after connecting so we can address it directly
  socket.on("join", (userId) => {
    if (userId) socket.join(userId.toString());
  });

  socket.on("disconnect", () => {});
});

connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
