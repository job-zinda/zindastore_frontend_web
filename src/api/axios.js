

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL,
});

export function getImageUrl(img) {

  if (!img) return "https://via.placeholder.com/400x400?text=No+Image";

  let url = "";
  if (typeof img === 'object') {
    url = img.image || img.file || img.url || img.src || "";
  } else {
    url = img;
  }

  if (!url || typeof url!== 'string') {
    return "https://via.placeholder.com/400x400?text=No+Image";
  }

  if (url.startsWith('http')) return url;

  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || "https://zindastorebackendweb-production.up.railway.app";
  if (url.startsWith('/')) return `${mediaBase}${url}`;
  return `${mediaBase}/${url}`;
}

export default api;