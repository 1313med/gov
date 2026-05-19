const express = require("express");
const router = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const {
  getUsers,
  getUserById,
  banUser,
  unbanUser,
  deleteUser,
  getStats,
  verifyUserNationalId,
} = require("../controllers/adminController");

const admin = [protect, role("admin")];

router.get("/stats", ...admin, getStats);
router.get("/users", ...admin, getUsers);
router.get("/users/:id", ...admin, getUserById);
router.put("/users/:id/national-id/verify", ...admin, verifyUserNationalId);
router.put("/users/:id/ban", ...admin, banUser);
router.put("/users/:id/unban", ...admin, unbanUser);
router.delete("/users/:id", ...admin, deleteUser);

module.exports = router;
