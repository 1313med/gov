const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { hasUserRole, getUserRoles, getPrimaryRole } = require("../utils/userRoles");

/**
 * Token resolution order:
 *   1. httpOnly cookie "token"  (web app)
 *   2. Authorization: Bearer … (mobile app / API clients)
 */
exports.protect = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token) {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findOne({ _id: decoded.id, deletedAt: null }).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    req.user.roles = getUserRoles(req.user);
    req.user.role = getPrimaryRole(req.user);
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid" });
  }
};

exports.role = (...roles) => (req, res, next) => {
  if (!req.user || !hasUserRole(req.user, ...roles)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
