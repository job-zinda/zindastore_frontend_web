import { MessageSquare, User, ShoppingCart, ShoppingBag, BookOpen, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function HomeHeader({ activeTab, setActiveTab }) {
  const { cart } = useCart();
  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const tabs = [
    { name: "Products", icon: ShoppingBag },
    { name: "Courses", icon: BookOpen },
    { name: "Services", icon: Wrench },
  ];

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm">
      <header className="bg-zinda text-white px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="font-extrabold">zinda</span>store
        </Link>
        <div className="flex items-center gap-5">
          <MessageSquare size={22} className="cursor-pointer hover:opacity-80" />
          <User size={22} className="cursor-pointer hover:opacity-80" />
          <Link to="/cart" className="relative">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>
      <div className="px-4 py-2.5 bg-white border-b border-gray-100">
        <div className="flex bg-gray-100 rounded-full p-1">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                activeTab === tab.name
                  ? "bg-white text-zinda shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}