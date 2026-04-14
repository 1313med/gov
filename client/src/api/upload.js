import { api } from "./axios";

/**
 * Upload listing images to Cloudinary via the backend.
 * @param {File[]} files - Array of File objects (from <input type="file">)
 * @returns {Promise<string[]>} Array of secure Cloudinary URLs
 */
export async function uploadListingImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const res = await api.post("/upload/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.urls;
}

/**
 * Upload a profile avatar.
 * @param {File} file - Single File object
 * @returns {Promise<string>} Secure Cloudinary URL
 */
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.post("/upload/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.url;
}
