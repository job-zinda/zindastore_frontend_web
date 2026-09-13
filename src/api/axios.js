import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/`, 
  headers: { "Content-Type": "application/json" },
});

export const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/300";
  return path.startsWith("http") ? path : `${API_URL}${path}`;
};

export default api;