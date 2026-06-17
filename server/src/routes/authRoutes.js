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
const {
  exchangeGoogle,
  exchangeFacebook,
  exchangeApple,
  startGoogle,
  callbackGoogle,
  startFacebook,
  callbackFacebook,
  getOAuthConfig,
} = require("../controllers/oauthController");
const { protect } = require("../middlewares/authMiddleware");
const {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} = require("../middlewares/rateLimiter");

router.post("/register",           registerLimiter, register);
router.post("/login",              loginLimiter, login);
router.post("/logout",             protect, logout);

// OAuth — token exchange (mobile + web popup flows)
router.get("/oauth/config",        getOAuthConfig);
router.post("/oauth/google",       loginLimiter, exchangeGoogle);
router.post("/oauth/facebook",     loginLimiter, exchangeFacebook);
router.post("/oauth/apple",        loginLimiter, exchangeApple);

// OAuth — browser redirect flows (web)
router.get("/oauth/google/start",     startGoogle);
router.get("/oauth/google/callback",  callbackGoogle);
router.get("/oauth/facebook/start",     startFacebook);
router.get("/oauth/facebook/callback",  callbackFacebook);

// Password reset (public — no auth needed)
router.post("/forgot-password",            passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token",      passwordResetLimiter, resetPassword);

// Email verification
router.get("/verify-email/:token",         verifyEmail);
router.post("/send-verification", protect, sendVerification);
router.post("/resend-verification", registerLimiter, resendVerificationPublic);

module.exports = router;
