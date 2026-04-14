const asyncHandler = require("express-async-handler");
const { uploadBuffer } = require("../utils/cloudinary");

/**
 * POST /api/upload/images
 * Body: multipart/form-data with field "images" (up to 10 files)
 * Returns: { urls: ["https://res.cloudinary.com/..."] }
 */
exports.uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No images provided");
  }

  const uploadPromises = req.files.map((file) =>
    uploadBuffer(file.buffer, {
      folder: "goovoiture/listings",
    })
  );

  const results = await Promise.all(uploadPromises);
  const urls = results.map((r) => r.secure_url);

  res.status(201).json({ urls });
});

/**
 * POST /api/upload/avatar
 * Body: multipart/form-data with field "avatar" (1 file)
 * Returns: { url: "https://res.cloudinary.com/..." }
 */
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No avatar file provided");
  }

  const result = await uploadBuffer(req.file.buffer, {
    folder:         "goovoiture/avatars",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });

  res.status(201).json({ url: result.secure_url });
});
