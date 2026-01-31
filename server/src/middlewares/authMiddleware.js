const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

exports.role = (...roles) => (req, res, next) => {
  const userRole = (req.user?.role || req.user?.type || "").toLowerCase();
  const allowed = roles.map((r) => r.toLowerCase());

  if (!userRole || !allowed.includes(userRole)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};
