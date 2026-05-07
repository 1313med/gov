import { api } from "./client";

/**
 * Upload one or more images; returns Cloudinary HTTPS URLs.
 * @param {Array<{ uri: string, name?: string, type?: string }>} files
 */
export async function uploadListingImages(files) {
  const formData = new FormData();
  for (const f of files) {
    formData.append("images", {
      uri: f.uri,
      name: f.name || "photo.jpg",
      type: f.type || "image/jpeg",
    });
  }
  const { data } = await api.post("/upload/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.urls || [];
}
