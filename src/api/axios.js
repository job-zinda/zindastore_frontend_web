import axios from "axios";

const HOSTINGER_BASE_URL = (
  import.meta.env.VITE_MEDIA_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://zindastore.com"
).trim().replace(/\/+$/, "").replace(/\/api\/?$/, "");

function getBaseUrl() {
  let raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || HOSTINGER_BASE_URL;
  raw = raw.trim().replace(/\/+$/, "");
  if (!raw.endsWith("/api")) raw = `${raw}/api`;
  return raw;
}

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

export function getImageUrl(img) {
  if (!img) return "https://via.placeholder.com/400?text=No+Image";

  let url = typeof img === "object"? (img.image || img.image_url || img.thumbnail || img.url || "") : img;
  if (!url) return "https://via.placeholder.com/400?text=No+Image";
  url = String(url).trim();

  if (url.includes("localhost") || url.includes("127.0.0.1") || url.includes("7070") || url.includes("37857") || url.includes(":8000")) {
    try {
      const u = new URL(url);
      return `${HOSTINGER_BASE}${u.pathname}`;
    } catch {
      const fileName = url.split("/").pop().split("?")[0];
      return `${HOSTINGER_BASE}/media/${fileName}`;
    }
  }

  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;

  const cleanPath = url.startsWith("/")? url : `/${url}`;
  return `${HOSTINGER_BASE}${cleanPath}`;
}

export default api;