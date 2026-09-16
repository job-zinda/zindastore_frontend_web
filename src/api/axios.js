import axios from "axios";

const rawBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "https://zindastorebackendweb-production.up.railway.app/api";
const baseURL = rawBase.replace(/\/+$/, "");

const rawMedia = import.meta.env.VITE_MEDIA_BASE_URL || "https://zindastorebackendweb-production.up.railway.app";
const mediaBase = rawMedia.replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  timeout: 15000,
});

export function getImageUrl(img) {
  if (!img) return "https://via.placeholder.com/400x400?text=No+Image";
  let url = typeof img === 'object'? (img.image || img.file || img.url || img.src || img.thumbnail || "") : img;
  if (!url || typeof url!== 'string') return "https://via.placeholder.com/400x400?text=No+Image";
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${mediaBase}${url}`;
  return `${mediaBase}/${url}`;
}

export default api;