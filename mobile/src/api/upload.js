import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";

async function authHeaders() {
  const raw = await SecureStore.getItemAsync("goovoiture_auth");
  const token = raw ? JSON.parse(raw)?.token : null;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function normalizeImageMime(mime) {
  const m = mime && String(mime).toLowerCase();
  if (m && m.startsWith("image/")) {
    return m === "image/jpg" ? "image/jpeg" : m;
  }
  return "image/jpeg";
}

async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const err = new Error(`Unexpected response (${res.status})`);
    err.response = { status: res.status, data: { raw: text.slice(0, 300) } };
    throw err;
  }
}

/**
 * Upload one or more images; returns Cloudinary HTTPS URLs.
 * Uses fetch (not axios) so React Native sets multipart boundary correctly.
 * @param {Array<{ uri: string, name?: string, type?: string }>} files
 */
export async function uploadListingImages(files) {
  const formData = new FormData();
  for (const f of files) {
    formData.append("images", {
      uri: f.uri,
      name: f.name || "photo.jpg",
      type: normalizeImageMime(f.type),
    });
  }
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/upload/images`, {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    const err = new Error(data.message || `Upload failed (${res.status})`);
    err.response = { status: res.status, data };
    throw err;
  }
  return data.urls || [];
}

/**
 * @param {{ uri: string, name?: string, type?: string }} file
 * @returns {Promise<string>} secure_url
 */
export async function uploadAvatarFile(file) {
  const formData = new FormData();
  formData.append("avatar", {
    uri: file.uri,
    name: file.name || "avatar.jpg",
    type: normalizeImageMime(file.type),
  });
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}/upload/avatar`, {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    const err = new Error(data.message || `Upload failed (${res.status})`);
    err.response = { status: res.status, data };
    throw err;
  }
  if (!data.url) {
    const err = new Error("No image URL returned");
    err.response = { status: res.status, data };
    throw err;
  }
  return data.url;
}
