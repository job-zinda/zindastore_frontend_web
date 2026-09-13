import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [cartToken, setCartToken] = useState(() => localStorage.getItem("cart_token") || "");
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async (tokenToUse) => {
    const token = tokenToUse || cartToken || localStorage.getItem("cart_token");
    if (!token) {
      setCart({ items: [] });
      return;
    }

    try {
      const res = await api.get(`/cart/${token}/`);
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error("Cart fetch error:", err);
      if (err.response?.status === 404) {
        localStorage.removeItem("cart_token");
        setCartToken("");
      }
      setCart({ items: [] });
    }
  }, [cartToken]);

  useEffect(() => {
    if (cartToken) {
      fetchCart(cartToken);
    }
  }, [cartToken, fetchCart]);

  const createNewToken = async () => {
    const res = await api.post("/cart/");
    const newToken = res.data.token;
    localStorage.setItem("cart_token", newToken);
    setCartToken(newToken);
    return newToken;
  };

  const addToCart = async (product, variant = null, quantity = 1) => {
    try {
      setLoading(true);

      const variantSku =
        variant?.sku ||
        variant?.variant_sku ||
        product?.variants?.[0]?.sku ||
        product?.variants?.[0]?.variant_sku ||
        product?.sku;

      if (!variantSku) {
        alert("Please select a valid product variant!");
        return false;
      }

      let currentToken = cartToken || localStorage.getItem("cart_token");

      if (!currentToken) {
        currentToken = await createNewToken();
      }

      try {
       
        await api.post(`/cart/${currentToken}/add/`, {
          variant_sku: variantSku,
          quantity: quantity,
        });

        await fetchCart(currentToken);
        alert(`${product.title || "Product"} added to cart!`);
        return true;
      } catch (err) {
        if (err.response && err.response.status === 404) {
  
          localStorage.removeItem("cart_token");
          const freshToken = await createNewToken();

          await api.post(`/cart/${freshToken}/add/`, {
            variant_sku: variantSku,
            quantity: quantity,
          });

          await fetchCart(freshToken);
          alert(`${product.title || "Product"} added to cart!`);
          return true;
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Cart error:", err);
      alert("Failed to add product to cart.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (variantSku, quantity) => {
    if (!cartToken) return;
    try {
      await api.patch(`/cart/${cartToken}/item/${variantSku}/`, { quantity });
      fetchCart(cartToken);
    } catch (err) {
      console.error("Update item error:", err);
    }
  };

  const removeFromCart = async (variantSku) => {
    if (!cartToken) return;
    try {
      await api.delete(`/cart/${cartToken}/item/${variantSku}/`);
      fetchCart(cartToken);
    } catch (err) {
      console.error("Remove item error:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        cartToken,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);