import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import api, { getImageUrl } from "../api/axios";
import { useCart } from "../context/CartContext";
import { ArrowLeft, Loader2, Truck } from "lucide-react";

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const token = searchParams.get("token");
  const buyNowData = location.state || {};

  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState("");

  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };
    loadRazorpay().then((res) => {
      if (res) setSdkLoaded(true);
      else alert("Razorpay SDK failed to load. Check internet.");
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shipRes = await api.get("/shipping/methods/");
        setShippingMethods(shipRes.data);
        const freeMethod = shipRes.data.find(m => m.code === "free");
        setSelectedShipping(freeMethod? "free" : shipRes.data[0]?.code || "");

        if (token && buyNowData?.type === "cart" && buyNowData?.total) {
          setCartSubtotal(Number(buyNowData.total));
        } else if (token) {
          const res = await api.get(`/cart/${token}/`);
          setCartSubtotal(Number(res.data.total_price || 0));
        }
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, buyNowData]);

  const basePrice = () => {
    if (buyNowData?.price) return Number(buyNowData.price);
    if (buyNowData?.total) return Number(buyNowData.total);
    if (buyNowData?.selectedVariant?.sale_price) return Number(buyNowData.selectedVariant.sale_price);
    if (buyNowData?.product?.sale_price) return Number(buyNowData.product.sale_price);
    return Number(cartSubtotal || 0);
  };

  const selectedShipObj = shippingMethods.find(m => m.code === selectedShipping);
  const shippingCost = selectedShipObj? Number(selectedShipObj.base_rate) : 0;
  const total = basePrice() + shippingCost;

  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "", referral_code: "",
    address_line1: "", city: "", state: "Kerala", pincode: "", country: "India",
  });
  const [referralInfo, setReferralInfo] = useState(null);
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value });

  //Local + Live support
  const verifyReferral = async () => {
    if (!form.referral_code) return alert("Enter Referral Code");
    setCheckingReferral(true);
    try {
      let res;
      try {
        // Local setup - Coupon model
        res = await api.post("/coupons/verify/", { code: form.referral_code.trim() });
      } catch (e1) {
        try {
          // Live setup - Referrals app (fallback)
          res = await api.post("/referrals/verify/", {
            code: form.referral_code.trim(),
            coupon_code: form.referral_code.trim(),
            referral_code: form.referral_code.trim()
          });
        } catch (e2) {
         
          if (e2.response?.status === 404) {
            setReferralInfo({ code: form.referral_code.trim(), discount_value: "Will apply at checkout" });
            alert("Code added! Discount checkout il apply aavum (verify API 404 - but OK).");
            return;
          }
          throw e2;
        }
      }
      setReferralInfo(res.data);
      alert(`Applied! Discount: ${res.data.discount_value || res.data.value || "Applied"}`);
    } catch (err) {
      setReferralInfo(null);
      alert(err.response?.data?.detail || "Invalid Referral Code");
    } finally {
      setCheckingReferral(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!sdkLoaded) return alert("Razorpay loading... 2 sec wait cheyyu");
    if (!form.customer_name ||!form.customer_phone ||!form.address_line1 ||!form.city ||!form.pincode) {
      return alert("Please fill all required fields.");
    }
    if (!selectedShipping) return alert("Please select a shipping method");

    setProcessing(true);
    try {
      let res;
      const basePayload = {
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        coupon_code: form.referral_code.trim(),
        shipping_method_code: selectedShipping,
        shipping_address: { name: form.customer_name, phone: form.customer_phone, address_line1: form.address_line1, city: form.city, state: form.state, country: form.country, pincode: form.pincode },
        billing_address: { name: form.customer_name, phone: form.customer_phone, address_line1: form.address_line1, city: form.city, state: form.state, country: form.country, pincode: form.pincode },
      };

      if (token) {
        res = await api.post("/checkout/", {
        ...basePayload,
          token: token,
          selected_skus: buyNowData?.selectedItems?.length > 0? buyNowData.selectedItems.map(i => i.sku || i.variant_sku) : undefined
        });
      }
      else if (buyNowData?.type === "course" && buyNowData?.course) {
        res = await api.post("/courses/checkout/", {
          course_slug: buyNowData.course.slug, customer_name: form.customer_name,
          customer_email: form.customer_email, customer_phone: form.customer_phone,
          coupon_code: form.referral_code.trim()
        });
      }
      else if (buyNowData?.type === "service" && buyNowData?.service) {
        res = await api.post("/services/checkout/", {
          service_slug: buyNowData.service.slug, customer_name: form.customer_name,
          customer_email: form.customer_email, customer_phone: form.customer_phone,
          coupon_code: form.referral_code.trim()
        });
      } else {
        setProcessing(false);
        return alert("No item selected for checkout.");
      }

      const razor = res.data?.payment_intent?.razorpay;
      if (!razor) {
        setProcessing(false);
        return alert("Payment initialization failed.");
      }
      if (!window.Razorpay) {
        setProcessing(false);
        return alert("Razorpay SDK not loaded.");
      }

      const options = {
        key: razor.key_id, amount: razor.amount, currency: razor.currency, order_id: razor.order_id,
        name: "Zinda Store", description: buyNowData?.product?.title || "Order",
        prefill: { name: form.customer_name, email: form.customer_email, contact: form.customer_phone },
        theme: { color: "#8E24AA" },
        handler: async function (response) {
          try {
            await api.post("/payment/razorpay/verify/", {
              order_number: res.data.order_number, razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature,
            });
            alert("Payment Successful!");
            navigate("/order-success", { state: { orderNumber: res.data.order_number } });
          } catch(e) {
            alert("Payment verification failed");
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Checkout failed.");
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#8E24AA] animate-spin" /></div>;

  const item = buyNowData?.product || buyNowData?.course || buyNowData?.service;
  const rawImage = item?.images?.[0]?.image || item?.image || item?.thumbnail;
  const productImage = getImageUrl(rawImage);

  return (
    <div className="bg-[#FAF8FC] min-h-screen p-4 md:p-8">
      <div className="bg-white p-4 flex items-center gap-3 mb-6 rounded-2xl shadow-xs max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold">Checkout</h1>
      </div>
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {item && (
            <div className="bg-white border-gray-100 rounded-2xl p-4 shadow-xs">
              <div className="flex gap-4 items-center">
                {productImage? <img src={productImage} alt={item.title} className="w-20 h-20 object-cover rounded-xl" /> : <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>}
                <div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-xl font-bold text-[#8E24AA] mt-1">₹{basePrice().toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white p-6 rounded-2xl shadow-xs space-y-3">
            <h2 className="font-bold text-lg mb-2">2. Shipping Address</h2>
            <div className="grid grid-cols-2 gap-3">
              <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="Full Name *" className="border p-3 rounded-xl col-span-2 outline-none focus:border-[#8E24AA]" />
              <input name="customer_phone" value={form.customer_phone} onChange={handleChange} placeholder="Phone Number *" className="border p-3 rounded-xl outline-none focus:border-[#8E24AA]" />
              <input name="customer_email" value={form.customer_email} onChange={handleChange} placeholder="Email Address" className="border p-3 rounded-xl outline-none focus:border-[#8E24AA]" />
              <input name="address_line1" value={form.address_line1} onChange={handleChange} placeholder="House No, Street Address *" className="border p-3 rounded-xl col-span-2 outline-none focus:border-[#8E24AA]" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City *" className="border p-3 rounded-xl outline-none focus:border-[#8E24AA]" />
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode *" className="border p-3 rounded-xl outline-none focus:border-[#8E24AA]" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs flex gap-2">
            <input name="referral_code" value={form.referral_code} onChange={handleChange} placeholder="Enter Referral / Coupon Code" className="border p-3 rounded-xl flex-1 outline-none focus:border-[#8E24AA]" />
            <button type="button" onClick={verifyReferral} disabled={checkingReferral} className="bg-[#8E24AA] text-white px-5 rounded-xl font-semibold cursor-pointer disabled:opacity-50">
              {checkingReferral? "..." : "Apply"}
            </button>
          </div>
          {referralInfo && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-xl text-sm text-green-700">
              ✅ Code Applied: {referralInfo.code || form.referral_code}
            </div>
          )}
          <div className="bg-white p-6 rounded-2xl shadow-xs space-y-3">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2"><Truck size={20}/> 4. Shipping Method</h2>
            {shippingMethods.length === 0? <p className="text-sm text-gray-500">Loading shipping options...</p> :
              <div className="space-y-2">
                {shippingMethods.map(method => (
                  <label key={method.code} className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition ${selectedShipping === method.code? 'border-[#8E24AA] bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" value={method.code} checked={selectedShipping === method.code} onChange={() => setSelectedShipping(method.code)} className="accent-[#8E24AA]"/>
                      <span className="font-semibold">{method.name}</span>
                    </div>
                    <span className="font-bold">{Number(method.base_rate) === 0? 'FREE' : `₹${method.base_rate}`}</span>
                  </label>
                ))}
              </div>
            }
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs h-fit space-y-4">
          <h2 className="font-bold text-lg">Order Summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{basePrice().toLocaleString()}</span></div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span className={shippingCost === 0? "text-green-600 font-semibold" : "font-semibold"}>
              {shippingCost === 0? 'FREE' : `₹${shippingCost}`}
            </span>
          </div>
          {referralInfo && (
            <div className="flex justify-between text-sm text-green-600 font-semibold">
              <span>Coupon Discount</span><span>Applied</span>
            </div>
          )}
          <hr />
          <div className="flex justify-between font-bold text-lg">
            <span>Total Payable</span>
            <span className="text-[#8E24AA]">₹{total.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-400">Discount will be calculated on server at payment step.</p>
          <button onClick={handlePlaceOrder} disabled={processing ||!sdkLoaded} className="w-full bg-[#8E24AA] text-white py-3.5 rounded-xl font-bold hover:bg-[#7b1fa2] transition disabled:opacity-50">
            {processing? "Processing..." :!sdkLoaded? "Loading Payment..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}