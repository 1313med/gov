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

const ALLOWED_SIGNATURE_TYPES = new Set(["jpeg", "png", "webp", "gif", "avif"]);

function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "png";
  }

  // GIF: "GIF87a" or "GIF89a"
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return "gif";
  }

  // WEBP: "RIFF....WEBP"
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "webp";
  }

  // AVIF (ISO BMFF): bytes 4-7 = "ftyp", brand includes "avif" or "avis"
  if (
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    const brand = buffer.subarray(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") return "avif";
  }

  return null;
}

function validateUploadedImages(req, res, next) {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files.length) return next();

  for (const file of files) {
    const detectedType = detectImageType(file.buffer);
    if (!detectedType || !ALLOWED_SIGNATURE_TYPES.has(detectedType)) {
      return res.status(400).json({
        message: "Invalid file content. Only real image files are allowed.",
      });
    }
  }

  return next();
}

// POST /api/upload/images — upload up to 10 listing images (requires auth)
router.post(
  "/images",
  protect,
  upload.array("images", 10),
  validateUploadedImages,
  uploadImages
);

// POST /api/upload/avatar — upload profile avatar (requires auth)
router.post(
  "/avatar",
  protect,
  upload.single("avatar"),
  validateUploadedImages,
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
