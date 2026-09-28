import axios from "axios";

const HOSTINGER_BASE_URL = (
  import.meta.env.VITE_MEDIA_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://zindastore.com/"
).trim().replace(/\/+$/, "");


function getBaseUrl() {
  let raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || HOSTINGER_BASE_URL;
  raw = raw.trim().replace(/\/+$/, "");

  if (!raw.endsWith("/api")) {
    raw = `${raw}/api`;
  }
  
  return raw;
}

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getImageUrl(img) {
  if (!img) return "https://via.placeholder.com/400?text=No+Image";

  let url = typeof img === "object" ? (img.image || img.image_url || img.thumbnail || img.url || "") : img;

  if (!url) return "https://via.placeholder.com/400?text=No+Image";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const cleanBase = HOSTINGER_BASE_URL.replace(/\/api\/?$/, "");

  const formattedPath = url.startsWith("/") ? url : `/${url}`;

  return `${cleanBase}${formattedPath}`;
}

export default api;