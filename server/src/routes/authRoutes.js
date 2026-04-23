const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendVerification,
  verifyEmail,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register",           register);
router.post("/login",              login);
router.post("/logout",             protect, logout);

// Password reset (public — no auth needed)
router.post("/forgot-password",            forgotPassword);
router.post("/reset-password/:token",      resetPassword);

// Email verification
router.get("/verify-email/:token",         verifyEmail);
router.post("/send-verification", protect, sendVerification);

module.exports = router;
