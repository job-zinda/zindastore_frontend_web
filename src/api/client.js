import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", 
});

export const getCartToken = () => localStorage.getItem("cart_token");
export const setCartToken = (token) => localStorage.setItem("cart_token", token);