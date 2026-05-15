const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const EXAMPLE_PLACEHOLDERS = new Set([
  "your_cloud_name",
  "your_api_key",
  "your_api_secret",
]);

/**
 * @returns {string|null} Human-readable error, or null if env looks valid.
 */
function getCloudinaryConfigError() {
  const name = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const key = (process.env.CLOUDINARY_API_KEY || "").trim();
  const secret = (process.env.CLOUDINARY_API_SECRET || "").trim();
  if (!name || !key || !secret) {
    return "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to server/.env (see .env.example).";
  }
  if (EXAMPLE_PLACEHOLDERS.has(name) || EXAMPLE_PLACEHOLDERS.has(key) || EXAMPLE_PLACEHOLDERS.has(secret)) {
    return "Cloudinary credentials are still set to placeholders in server/.env. Replace them with real keys from https://console.cloudinary.com (Account → API Keys).";
  }
  return null;
}

/**
 * Upload a file buffer to Cloudinary.
 * Returns the upload result (secure_url, public_id, etc.)
 */
function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:          options.folder || "goovoiture",
        resource_type:   "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "avif", "heic", "heif"],
        transformation:  [{ quality: "auto:good", fetch_format: "auto" }],
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by its public_id.
 */
function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

module.exports = { uploadBuffer, deleteImage, getCloudinaryConfigError };
