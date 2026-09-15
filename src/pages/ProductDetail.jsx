import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Share2, ShoppingBag, MessageSquare, Star, Edit3, Zap, Check, X
} from "lucide-react";
import api, { getImageUrl } from "../api/axios";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { slug, id } = useParams();
  const productSlug = slug || id;
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newNameOrEmail, setNewNameOrEmail] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const getImagesForVariant = (variant, allImages) => {
    if (!allImages ||!Array.isArray(allImages)) return [];
    if (!variant) return allImages;
    const variantImages = allImages.filter(img => img.variant === variant.id);
    return variantImages.length > 0? variantImages : allImages;
  };

  useEffect(() => {
    if (!productSlug) return;
    setLoading(true);

    Promise.all([
      api.get(`/products/${productSlug}/`),
      api.get(`/products/${productSlug}/reviews/`).catch(() => ({ data: [] }))
    ])
.then(([prodRes, reviewRes]) => {
        const prodData = prodRes.data;
        setProduct(prodData);
        setReviews(reviewRes.data?.results || reviewRes.data || []);

        if (prodData.variants && prodData.variants.length > 0) {
          const firstVariant = prodData.variants[0];
          setSelectedVariant(firstVariant);
          const firstImages = getImagesForVariant(firstVariant, prodData.images);
          setActiveImage(firstImages?.[0] || prodData.images?.[0] || null);
        } else {
          setActiveImage(prodData.images?.[0] || null);
        }
      })
.catch((err) => console.error("Error fetching product details:", err))
.finally(() => setLoading(false));
  }, [productSlug]);

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    const images = getImagesForVariant(variant, product.images);
    setActiveImage(images.length > 0? images[0] : null);
  };

  const handleSelectImage = (img) => {
    setActiveImage(img);
    if (!product?.variants) return;
    const matchedVariant = product.variants.find((variant) => variant.id === img.variant);
    if (matchedVariant) setSelectedVariant(matchedVariant);
  };

  const galleryImagesForSelected = selectedVariant? getImagesForVariant(selectedVariant, product?.images) : product?.images || [];

  const getDisplayPrice = () => selectedVariant?.sale_price || product?.sale_price || "0.00";
  const getDisplayMRP = () => selectedVariant?.mrp_price || product?.mrp_price || null;

  const handleShare = async () => {
    const currentUrl = window.location.href;
    const shareTitle = product?.title || "Product Detail";
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, text: `Check out ${shareTitle}`, url: currentUrl }); }
      catch (err) { console.log("Cancelled share", err); }
    } else {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleAddToCart = async () => {
    if (!product || isAdding) return;
    setIsAdding(true);
    await addToCart(product, selectedVariant || product.variants?.[0] || null, 1);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    const variant = selectedVariant || product.variants?.[0];
    if (!variant) return alert("Please select a variant");

    try {
      setIsAdding(true);
      const cartRes = await api.post("/cart/");
      const newToken = cartRes.data.token;
      localStorage.setItem("cart_token", newToken);

      await api.post(`/cart/${newToken}/add/`, {
        variant_sku: variant.sku,
        quantity: 1,
      });

      navigate(`/checkout?token=${newToken}`, {
        state: { type: "cart", total: Number(variant.sale_price || product.sale_price) },
      });

    } catch (err) {
      console.error(err);
      alert("Failed to create checkout");
    } finally {
      setIsAdding(false);
    }
  };

  const handleLetsPlan = () => {
    if (!product) return;
    let rawNum = product.whatsapp_number || "917592998150";
    let cleanNum = String(rawNum).replace(/\D/g, "");
    if (cleanNum.length === 10) cleanNum = "91" + cleanNum;
    const currentPrice = getDisplayPrice();
    const customMessage = product.whatsapp_message || "Hi, I am interested in this product:";
    const fullMessage = `${customMessage}\n\n*Product:* ${product?.title}\n*Variant:* ${selectedVariant?.sku || ""}\n*Price:* ₹${currentPrice}\n*Link:* ${window.location.href}`;
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(fullMessage)}`, "_blank");
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    const targetSlug = product?.slug || productSlug;
    api.post(`/products/${targetSlug}/reviews/`, {
      rating: newRating, title: newTitle, body: newBody, name_or_email: newNameOrEmail
    })
.then((res) => {
        alert("Review submitted successfully!");
        setReviews([res.data,...reviews]);
        setShowModal(false);
        setNewTitle(""); setNewBody(""); setNewNameOrEmail("");
      })
.catch((err) => {
        console.error("Review Submit Error:", err);
        alert("Failed to submit review. Please try again.");
      })
.finally(() => setReviewSubmitting(false));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF8FC]"><div className="w-10 h-10 border-4 border-[#8E24AA] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return <div className="p-8 text-center text-gray-500 min-h-screen flex flex-col justify-center items-center"><p className="text-lg font-semibold">Product not found!</p><button onClick={() => navigate("/")} className="mt-4 text-[#8E24AA] underline cursor-pointer">Go back to Home</button></div>;

  const currentPrice = getDisplayPrice();
  const currentMRP = getDisplayMRP();

  return (
    <div className="bg-[#FAF8FC] min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100">
        <div className="relative p-6 flex justify-center">
          <img src={getImageUrl(activeImage)} alt={product.title} className="max-h-80 object-contain rounded-lg transition-all duration-300"/>
          <button onClick={handleShare} className="absolute top-4 right-4 bg-gray-800/60 hover:bg-gray-800 text-white p-2.5 rounded-full transition shadow-md cursor-pointer">
            {copied? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
          </button>
        </div>

        {galleryImagesForSelected.length > 0 && (
          <div className="flex gap-3 px-4 pb-4 overflow-x-auto">
            {galleryImagesForSelected.map((img) => (
              <button
                key={img.id}
                onClick={() => handleSelectImage(img)}
                className={`w-16 h-16 shrink-0 border-2 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  getImageUrl(activeImage) === getImageUrl(img)? 'border-[#8E24AA] ring-2 ring-[#8E24AA]' : 'border-gray-200 hover:border-[#8E24AA]'
                }`}
              >
                <img src={getImageUrl(img)} className="w-full h-full object-cover"/>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
          <p className="text-xs text-gray-500 mt-1">{product.brand?.name || product.brand || "Brand"} · {product.category?.name || product.category || "Category"}</p>
        </div>

        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-gray-800 text-sm">Select Option / Size:</h3>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                const label = variant.variant_attributes && Object.keys(variant.variant_attributes).length > 0
             ? Object.values(variant.variant_attributes).join(" - ")
                  : variant.sku || `Option ${variant.id}`;
                return (
                  <button key={variant.id} onClick={() => handleSelectVariant(variant)} className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${isSelected? "bg-[#8E24AA] text-white border-[#8E24AA] shadow-sm" : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"}`}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <div className="bg-[#F6EFF8] border-purple-100 rounded-2xl p-4 flex items-baseline gap-3">
            <p className="text-2xl font-bold text-gray-900">₹{Number(currentPrice).toLocaleString()}</p>
            {currentMRP && Number(currentMRP) > Number(currentPrice) && <p className="text-sm line-through text-gray-400">MRP: ₹{Number(currentMRP).toLocaleString()}</p>}
          </div>
        </div>

        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-3">{product.description || "No description provided for this product."}</div>

        <div className="space-y-2.5 pt-3">
          <button onClick={handleBuyNow} className="w-full bg-[#8E24AA] text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-[#7b1fa2] hover:-translate-y-0.5 transition-all shadow-md cursor-pointer"><Zap size={18} /> Buy Now</button>
          <button onClick={handleAddToCart} disabled={isAdding} className="w-full bg-[#FAF0F7] border border-purple-200 text-[#8E24AA] py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-100 hover:-translate-y-0.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"><ShoppingBag size={18} /> {isAdding? "Adding..." : "Add to Cart"}</button>
          <button onClick={handleLetsPlan} className="w-full bg-white border border-purple-200 text-gray-700 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 hover:-translate-y-0.5 transition-all shadow-xs cursor-pointer"><MessageSquare size={18} className="text-[#8E24AA]" /> Let's Plan (WhatsApp)</button>
        </div>

        <div className="pt-6 border-t border-gray-200 space-y-3">
          <h3 className="font-semibold text-gray-900 text-base">Reviews & Ratings</h3>
          {reviews.length === 0? <p className="text-xs text-gray-500 py-2">No reviews yet.</p> :
            <div className="space-y-3">
              {reviews.map((rev, index) =>
                <div key={rev.id || index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-1 text-amber-500 mb-1">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < rev.rating? "currentColor" : "none"} />)}</div>
                  {rev.title && <p className="text-sm font-bold text-gray-800 mb-0.5">{rev.title}</p>}
                  <p className="text-sm text-gray-600">{rev.body}</p>
                  <p className="text-xs text-gray-400 mt-2">- {rev.name_or_email}</p>
                </div>
              )}
            </div>
          }
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-20">
        <button onClick={() => setShowModal(true)} className="bg-[#FAF8FC] border-purple-300 text-[#8E24AA] px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg hover:bg-purple-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"><Edit3 size={16} /> Write a review</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20} /></button>
            <h3 className="font-bold text-gray-800 text-lg">Write a Review</h3>
            <form onSubmit={handleAddReview} className="space-y-3">
              <div><label className="block text-xs text-gray-600 font-semibold mb-1">Rating</label><div className="flex gap-2">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} onClick={() => setNewRating(star)} className="text-amber-500 cursor-pointer"><Star size={24} fill={star <= newRating? "currentColor" : "none"} /></button>)}</div></div>
              <div><label className="block text-xs text-gray-600 font-semibold mb-1">Name / Email</label><input type="text" required value={newNameOrEmail} onChange={(e) => setNewNameOrEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#8E24AA] outline-none"/></div>
              <div><label className="block text-xs text-gray-600 font-semibold mb-1">Title</label><input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#8E24AA] outline-none"/></div>
              <div><label className="block text-xs text-gray-600 font-semibold mb-1">Review</label><textarea rows="3" required value={newBody} onChange={(e) => setNewBody(e.target.value)} className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#8E24AA] outline-none"></textarea></div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs text-gray-500 cursor-pointer">Cancel</button><button type="submit" disabled={reviewSubmitting} className="px-5 py-2 rounded-xl text-xs bg-[#8E24AA] text-white cursor-pointer disabled:opacity-50 font-semibold">{reviewSubmitting? "Submitting..." : "Submit"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}