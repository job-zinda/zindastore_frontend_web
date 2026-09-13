import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Wrench } from "lucide-react";
import api from "../api/axios";

const BASE_URL = "http://localhost:8000"; 

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categorySlug = searchParams.get("category");
  const categoryName = searchParams.get("category_name") || "All Services";

  useEffect(() => {
    setLoading(true);
    let endpoint = "/services/";
    if (categorySlug) {
      endpoint = `/services/?category=${categorySlug}`;
    }
    api.get(endpoint)
    .then((res) => setServices(res.data.results || res.data || []))
    .catch((err) => console.error(err))
    .finally(() => setLoading(false));
  }, [categorySlug]);

  return (
    <div className="bg-[#FAF8FC] min-h-screen">
      <div className="bg-[#faf8fc] text-black p-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-1 rounded-full"><ArrowLeft size={22} /></button>
        <Wrench size={20} />
        <h1 className="text-xl font-semibold">{categoryName}</h1>
      </div>
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        {loading? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#8E24AA] border-t-transparent rounded-full animate-spin"></div></div> :
         services.length === 0? <div className="bg-white p-12 text-center text-gray-500 rounded-2xl shadow-xs">No services found in this category</div> :
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
           {services.map((service) => (
             <div key={service.id} onClick={() => navigate(`/service/${service.slug}`)} className="bg-white rounded-2xl p-4 border-gray-100 shadow-xs cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
               <img 
                 src={service.thumbnail? `${BASE_URL}${service.thumbnail}` : "/placeholder.jpg"}
                 alt={service.title}
                 className="w-full h-40 object-cover rounded-xl mb-3 bg-gray-100"
                 onError={(e) => e.target.src = "/placeholder.jpg"}
               />
               <h3 className="font-bold text-gray-800">{service.title}</h3>
               <p className="font-bold text-[#8E24AA] text-sm mt-2">₹{Number(service.base_price).toLocaleString()}</p>
             </div>
           ))}
         </div>}
      </main>
    </div>
  );
}