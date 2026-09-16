import axios from "axios";

const RAILWAY_BASE = "https://zindastorebackendweb-production.up.railway.app";

function getBaseUrl() {
  
  let raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || `${RAILWAY_BASE}/api`;
  
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
  let url = typeof img === 'object' ? (img.image || img.thumbnail || img.url || "") : img;
  if (!url) return "https://via.placeholder.com/400?text=No+Image";
  if (url.startsWith('http')) return url;
  return `${RAILWAY_BASE}${url.startsWith('/') ? url : `/${url}`}`;
}

export default api;