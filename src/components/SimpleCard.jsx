import { getImageUrl } from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, CreditCard } from "lucide-react";

export default function SimpleCard({ item, type }) {
  const navigate = useNavigate();
  const linkTo = type === "course" ? `/course/${item.slug || item.id}` : `/service/${item.slug || item.id}`;
  const displayPrice = item.price || item.sale_price || item.base_price || "0.00";
  const showPrice = type !== "service";

  // WhatsApp Let's Plan Trigger
  const handleLetsPlan = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rawNum = item.whatsapp_number || "917592998150";
    let cleanNum = String(rawNum).replace(/\D/g, "");
    if (cleanNum.length === 10) cleanNum = "91" + cleanNum;

    const priceLine = showPrice ? `\nPrice: ₹${displayPrice}` : "";
    const fullMessage = `Hi, I am interested in: *${item.title || item.name}*${priceLine}\nLink: ${window.location.origin}${linkTo}`;
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(fullMessage)}`, "_blank");
  };

  const handleReadyToPay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(linkTo);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-purple-100 p-4 hover:shadow-md transition flex flex-col justify-between">
      <Link to={linkTo} className="block space-y-2">
        <div className="relative w-full h-44 bg-purple-50 rounded-xl overflow-hidden flex items-center justify-center p-2">
          {item.thumbnail || item.image ? (
            <img
              src={getImageUrl(item.thumbnail || item.image)}
              alt={item.title || item.name}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <span className="text-purple-700 font-bold text-2xl">zinda</span>
          )}
        </div>

        <div className="pt-1">
          <h3 className="font-bold text-base text-gray-900 truncate">{item.title || item.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            {item.summary || item.description || item.author || "Upgrade your business"}
          </p>
          {showPrice && (
            <p className="text-lg font-extrabold text-[#9C4196] mt-1">₹{displayPrice}</p>
          )}
        </div>
      </Link>

      {/* Clean Single Button Row */}
      <div className="mt-4 pt-2 border-t border-purple-50">
        <button
          onClick={handleLetsPlan}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#9C4196] hover:bg-[#83337e] text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
        >
          <MessageSquare size={14} className="shrink-0" />
          <span className="truncate">Let's Plan</span>
        </button>
      </div>
    </div>
  );
}