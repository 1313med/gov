const express = require("express");
const multer = require("multer");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { uploadImages, uploadAvatar } = require("../controllers/uploadController");

// ---------------------------------------------------------------------------
// Multer configuration
// - Memory storage (files buffered, then streamed to Cloudinary)
// - Max file size: 5 MB
// - Allowed MIME types: images only
// ---------------------------------------------------------------------------
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, png, webp, avif)"), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: imageFilter,
});

// POST /api/upload/images — upload up to 10 listing images (requires auth)
router.post(
  "/images",
  protect,
  upload.array("images", 10),
  uploadImages
);

// POST /api/upload/avatar — upload profile avatar (requires auth)
router.post(
  "/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);

// Multer error handler (file too large, wrong type, etc.)
router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Maximum size is 5 MB." });
  }
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = router;
