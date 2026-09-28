import axios from "axios";

const BASE = (import.meta.env.VITE_API_BASE_URL || "https://zindastore.com").trim().replace(/\/+$/, "");
export const api = axios.create({
  baseURL: BASE.endsWith("/api")? BASE : `${BASE}/api`,
});

export const getCartToken = () => localStorage.getItem("cart_token");
export const setCartToken = (token) => localStorage.setItem("cart_token", token);