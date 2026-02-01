const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./middlewares/errorMiddleware");


const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/sale", require("./routes/saleRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));


// routes later...

app.use(notFound);
app.use(errorHandler);

module.exports = app;
