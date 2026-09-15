import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Share2, MessageSquare, Check, Zap } from "lucide-react";
import api, { getImageUrl } from "../api/axios";

export default function ServiceDetail() {
  const { id, slug } = useParams();
  const serviceParam = slug || id;
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [referralCode, setReferralCode] = useState("");
  const [appliedReferral, setAppliedReferral] = useState("");
  const [referralSuccess, setReferralSuccess] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setSdkLoaded(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); }
  }, []);

  useEffect(() => {
    if (!serviceParam) return;
    setLoading(true);
    api.get(`/services/${serviceParam}/`)
    .then((res) => setService(res.data))
    .catch((err) => console.error("Service detail error:", err))
    .finally(() => setLoading(false));
  }, [serviceParam]);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value });

  const handleShare = async () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: service?.title || "Service Details", url: currentUrl });
      } catch (err) { console.log("Cancelled share", err); }
    } else {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return alert("Please enter a referral code.");
    try {
      await api.post("/referrals/verify/", { referral_code: referralCode.trim() });
      setAppliedReferral(referralCode.trim());
      setReferralSuccess(true);
      alert(`Referral code '${referralCode.trim()}' applied!`);
    } catch { alert("Invalid Referral Code"); }
  };

  const handleLetsPlan = () => {
    const rawNum = service?.whatsapp_number || "917592998150";
    let cleanNum = String(rawNum).replace(/\D/g, "");
    if (cleanNum.length === 10) cleanNum = "91" + cleanNum;
    const displayPrice = service?.base_price || service?.price || "0.00";
    const msg = `Hi, I am interested in this service:\n*${service?.title}*\nPrice: ₹${displayPrice}\nLink: ${window.location.href}`;
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleBookNow = async () => {
    if (!sdkLoaded) return alert("Payment loading... please wait");
    if (!form.customer_name || !form.customer_phone) return alert("Name and Phone required");

    setProcessing(true);
    try {
      const res = await api.post("/services/checkout/", {
        service_slug: service.slug || service.id,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        coupon_code: appliedReferral || referralCode,
      });

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
        key: razor.key_id,
        amount: razor.amount,
        currency: razor.currency,
        order_id: razor.order_id,
        name: "Zinda Store",
        description: service.title,
        prefill: { name: form.customer_name, email: form.customer_email, contact: form.customer_phone },
        theme: { color: "#8E24AA" },
        handler: async function (response) {
          try {
            await api.post("/payment/razorpay/verify/", {
              order_number: res.data.order_number,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
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
      alert(err.response?.data?.detail || "Booking failed.");
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAF8FC]"><div className="w-10 h-10 border-4 border-[#8E24AA] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!service) return <div className="p-8 text-center text-red-500 font-semibold min-h-screen flex-col justify-center items-center">Service not found.</div>;

  const displayPrice = service.base_price || service.price || "0.00";
  const displayMRP = service.mrp_price || service.mrp;
  const imageSrc = getImageUrl(service.thumbnail || service.image || service.primary_image);

  return (
    <div className="bg-[#FAF8FC] min-h-screen pb-12">
      <div className="max-w-3xl mx-auto p-4 space-y-4">

        <div className="relative bg-white border-gray-100 p-6 rounded-2xl flex items-center justify-center min-h-70 shadow-xs hover:shadow-md transition-all duration-300">
          {imageSrc? (
            <img 
              src={imageSrc} 
              alt={service.title} 
              className="max-h-60 object-contain rounded-lg bg-gray-100"
              onError={(e) => e.target.style.display='none'}
            />
          ) : (
            <div className="text-[#8E24AA] text-3xl font-black uppercase tracking-widest">zinda</div>
          )}
          <button onClick={handleShare} className="absolute top-4 right-4 bg-gray-800/60 hover:bg-gray-800 text-white p-2.5 rounded-full transition shadow-md cursor-pointer">
            {copied? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border-gray-100 shadow-xs space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">{service.title}</h2>
          <p className="text-xs text-gray-500">ID: {service.id} · By {service.provider || "Zinda Services"}</p>
          <div className="flex items-baseline gap-3 pt-1">
            <p className="text-2xl font-bold text-gray-900">₹{Number(displayPrice).toLocaleString()}</p>
            {displayMRP && <p className="text-sm line-through text-gray-400">MRP: ₹{Number(displayMRP).toLocaleString()}</p>}
          </div>
        </div>

        {service.description && (
          <div className="bg-white p-4 rounded-2xl border-gray-100 shadow-xs">
            <h3 className="font-semibold text-gray-800 mb-2">About this service</h3>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{service.description}</div>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <label className="block text-xs font-semibold text-gray-700">Have a Referral Code?</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="flex-1 bg-[#F6EFF8] border-purple-100 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA]"
            />
            <button
              type="button"
              onClick={handleApplyReferral}
              disabled={referralSuccess}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${referralSuccess? "bg-green-100 text-green-700" : "bg-[#8E24AA] text-white hover:bg-[#7b1fa2]"}`}
            >
              {referralSuccess? "Applied ✓" : "Apply"}
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-gray-100 shadow-xs space-y-3 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <h3 className="block text-sm font-semibold text-gray-800">Contact Details</h3>
          <input name="customer_name" placeholder="Full name *" value={form.customer_name} onChange={handleChange} className="w-full bg-[#F6EFF8] border-purple-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA]" />
          <input name="customer_phone" placeholder="Phone *" value={form.customer_phone} onChange={handleChange} className="w-full bg-[#F6EFF8] border-purple-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA]" />
          <input name="customer_email" placeholder="Email" value={form.customer_email} onChange={handleChange} className="w-full bg-[#F6EFF8] border-purple-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#8E24AA] focus:ring-1 focus:ring-[#8E24AA]" />
        </div>

        <div className="space-y-2.5 pt-2">
          <button 
            onClick={handleBookNow} 
            disabled={processing || !sdkLoaded}
            className="w-full bg-[#8E24AA] hover:bg-[#7b1fa2] text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Zap size={18} />  
            {processing ? "Processing..." : !sdkLoaded ? "Loading Payment..." : "Book Service"}
          </button>

          <button onClick={handleLetsPlan} className="w-full bg-[#FAF0F7] border-purple-200 text-[#8E24AA] py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-100 hover:-translate-y-0.5 transition-all shadow-xs cursor-pointer">
            <MessageSquare size={18} /> Let's Plan (WhatsApp)
          </button>
        </div>
      </div>
    </div>
  );
}