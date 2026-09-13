import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, Calendar, Loader2 } from "lucide-react";
import api from "../api/axios";

export default function ProfilePage() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!phone.trim() && !email.trim()) {
      return alert("Phone or Email enter cheyyu");
    }
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (phone) params.append("phone", phone);
      if (email) params.append("email", email);

      const res = await api.get(`/orders/guest-search/?${params.toString()}`);
      setOrders(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
      alert("Orders fetch cheyyan pattilla");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "delivered") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-[#F6EFF8] text-[#8E24AA]";
  };

  return (
    <div className="bg-[#FAF8FC] min-h-screen pb-12">
     
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        
        {/* Title Card */}
        <div className="bg-white p-4 rounded-2xl border-gray-100 shadow-xs">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-xs text-gray-500 mt-1">Track your orders with phone or email</p>
        </div>

        {/* Find My Orders Card */}
        <div className="bg-white rounded-2xl border-gray-100 shadow-xs p-5 space-y-3">
          <h2 className="text-base font-bold text-gray-800">Find My Orders</h2>
          
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#F6EFF8] border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8E24AA]"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#F6EFF8] border-purple-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8E24AA]"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-[#8E24AA] text-white font-semibold py-3 rounded-2xl hover:bg-[#7B1FA2] hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Search Orders
          </button>
        </div>

        {/* Orders List */}
        <div>
          {!searched ? (
            <div className="bg-white rounded-2xl border-gray-100 shadow-xs p-12 text-center">
              <p className="text-gray-500 text-sm">Enter phone or email to find your orders</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[#8E24AA]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border-gray-100 shadow-xs p-12 text-center">
              <p className="text-gray-500 text-sm">No orders found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 px-2">Your Orders ({orders.length})</h3>
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border-gray-100 shadow-xs p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Order #{order.order_number || order.id}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <Calendar size={12} />
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-[#FAF8FC] p-2 rounded-xl">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                          <Package size={16} className="text-[#8E24AA]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.name || item.product_name || item.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{item.type || "Product"} x {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800">₹{Number(item.price).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-800">Total Amount</p>
                    <p className="text-lg font-bold text-[#8E24AA]">₹{Number(order.total_amount).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}