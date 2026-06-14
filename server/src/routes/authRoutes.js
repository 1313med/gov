const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendVerification,
  resendVerificationPublic,
  verifyEmail,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} = require("../middlewares/rateLimiter");

router.post("/register",           registerLimiter, register);
router.post("/login",              loginLimiter, login);
router.post("/logout",             protect, logout);

// Password reset (public — no auth needed)
router.post("/forgot-password",            passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token",      passwordResetLimiter, resetPassword);

// Email verification
router.get("/verify-email/:token",         verifyEmail);
router.post("/send-verification", protect, sendVerification);
router.post("/resend-verification", registerLimiter, resendVerificationPublic);

module.exports = router;
