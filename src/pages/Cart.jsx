import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import api, { getImageUrl } from "../api/axios";

export default function Cart() {
  const { cart, cartToken, fetchCart } = useCart();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  const [selectedSkus, setSelectedSkus] = useState([]);
  const [updatingSku, setUpdatingSku] = useState(null);

  useEffect(() => {
    if (cart && cart.items) {
      setItems(cart.items);
      const allSkus = cart.items.map((item) => item.variant_sku || item.sku);
      setSelectedSkus(allSkus);
    }
  }, [cart]);

  // Checkbox Selection Logic
  const toggleSelect = (sku) => {
    if (selectedSkus.includes(sku)) {
      setSelectedSkus(selectedSkus.filter((id) => id !== sku));
    } else {
      setSelectedSkus([...selectedSkus, sku]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedSkus.length === items.length) {
      setSelectedSkus([]);
    } else {
      setSelectedSkus(items.map((item) => item.variant_sku || item.sku));
    }
  };

  // 1. Instant Quantity (+ / -) Update Logic (Optimistic Update)
  const handleUpdateQuantity = async (sku, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    setItems((prevItems) =>
      prevItems.map((item) =>
        (item.variant_sku || item.sku) === sku
          ? { ...item, quantity: newQty }
          : item
      )
    );

    setUpdatingSku(sku);
    try {
      await api.patch(`/cart/${cartToken}/item/${sku}/`, {
        quantity: newQty,
      });
      
      if (fetchCart) await fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
      setItems((prevItems) =>
        prevItems.map((item) =>
          (item.variant_sku || item.sku) === sku
            ? { ...item, quantity: currentQty }
            : item
        )
      );
      alert("Failed to update item quantity.");
    } finally {
      setUpdatingSku(null);
    }
  };

  // 2. Instant Delete Item Logic (Optimistic Update)
  const handleRemoveItem = async (sku) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    const previousItems = [...items];

    setItems((prevItems) =>
      prevItems.filter((item) => (item.variant_sku || item.sku) !== sku)
    );
    setSelectedSkus((prev) => prev.filter((id) => id !== sku));

    setUpdatingSku(sku);
    try {
   
      await api.delete(`/cart/${cartToken}/item/${sku}/`);
      
      if (fetchCart) await fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
     
      setItems(previousItems);
      alert("Failed to remove item from cart.");
    } finally {
      setUpdatingSku(null);
    }
  };

  
  const selectedItems = items.filter((item) =>
    selectedSkus.includes(item.variant_sku || item.sku)
  );

  const totalAmount = selectedItems.reduce((acc, item) => {
    const price = parseFloat(
      item.unit_price_snapshot || item.price || item.sale_price || 0
    );
    return acc + price * item.quantity;
  }, 0);


  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to proceed!");
      return;
    }
    const totalAmount = selectedItems.reduce((acc, item) => acc + (Number(item.unit_price_snapshot || item.price) * item.quantity), 0);

    navigate(`/checkout?token=${cartToken}`, {
      state: {
        type: "cart",
        selectedItems: selectedItems, 
        total: totalAmount 
      },
    });
  };
  return (
    <div className="bg-[#FAF8FC] min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-xl shadow-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-purple-50">
            <ShoppingBag className="mx-auto text-purple-300 mb-4" size={50} />
            <p className="text-gray-500 font-medium mb-4">Your cart is empty.</p>
            <Link
              to="/"
              className="inline-block bg-[#8E24AA] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#7b1fa2] transition shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items List */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-6 shadow-xs border border-purple-50 space-y-4">
              {/* Select All Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={
                      selectedSkus.length === items.length && items.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#8E24AA] rounded cursor-pointer"
                  />
                  Select All ({items.length} items)
                </label>
                <span className="text-xs text-gray-400">
                  {selectedSkus.length} selected
                </span>
              </div>

              {/* Items List Rendering */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const sku = item.variant_sku || item.sku;
                  const isSelected = selectedSkus.includes(sku);
                  const price =
                    item.unit_price_snapshot || item.price || item.sale_price || 0;
                  const imageSrc = item.thumbnail || item.image || item.product_image;

                  return (
                    <div
                      key={sku || item.id}
                      className={`flex items-center gap-3 py-4 transition ${
                        updatingSku === sku ? "opacity-60" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(sku)}
                        className="w-4 h-4 accent-[#8E24AA] rounded cursor-pointer"
                      />

                      {/* Image */}
                      <img
                        src={getImageUrl(imageSrc)}
                        alt={item.product_title || item.title}
                        className="w-18 h-18 object-contain rounded-xl bg-gray-50 border border-gray-100 p-1"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/100?text=No+Image";
                        }}
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">
                          {item.product_title || item.title || "Product"}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          SKU: {sku}
                        </p>
                        <p className="text-[#8E24AA] font-extrabold text-sm mt-1">
                          ₹{Number(price).toLocaleString()}
                        </p>
                      </div>

                      {/* Quantity & Delete Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleRemoveItem(sku)}
                          className="text-gray-400 hover:text-red-500 transition p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(sku, item.quantity, -1)
                            }
                            disabled={item.quantity <= 1 || updatingSku === sku}
                            className="p-1.5 hover:bg-gray-200 disabled:opacity-30 transition cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(sku, item.quantity, 1)
                            }
                            disabled={updatingSku === sku}
                            className="p-1.5 hover:bg-gray-200 transition cursor-pointer disabled:opacity-30"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Side Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-purple-50 h-fit space-y-4">
              <h2 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Selected Items</span>
                  <span>{selectedItems.length}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
                  <span>Total Payable</span>
                  <span className="text-[#8E24AA]">
                    ₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={selectedItems.length === 0}
                className="w-full bg-[#8E24AA] text-white py-3.5 rounded-xl font-bold text-sm text-center hover:bg-[#7b1fa2] transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                Proceed to Checkout ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}