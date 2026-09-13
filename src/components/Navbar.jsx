import { ShoppingCart, MessageCircle, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cart } = useCart();
  const itemCount = cart?.items?.reduce((a, i) => a + i.quantity, 0) || 0;
  const navigate = useNavigate();

  const ADMIN_WHATSAPP = "+917592998150"; 
  const whatsappLink = `https://wa.me/${ADMIN_WHATSAPP.replace(/\+/g, "")}?text=Hi%20ZindaStore%20Team,%20I%20need%20help%20with%20an%20order`;

  return (
    <header className="sticky top-0 z-50 bg-[#7f39ca] text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="font-black">zinda</span>
          <span className="font-light">store</span>
        </Link>

        <div className="flex items-center gap-5">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 transition">
            <MessageCircle size={24} />
          </a>
          <button onClick={() => navigate("/profile")} className="hover:text-gray-200 transition cursor-pointer">
            <User size={24} />
          </button>
          <Link to="/cart" className="relative hover:text-gray-200">
            <ShoppingCart size={24} />
            {itemCount > 0 &&
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            }
          </Link>
        </div>
      </div>
    </header>
  );
}