import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import api from "../api/axios";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = api.defaults.baseURL? api.defaults.baseURL.replace("/api", "") : "http://127.0.0.1:8000";
    return `${baseUrl}${path.startsWith("/")? "" : "/"}${path}`;
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get("/brands/").catch(() => ({ data: [] })), api.get("/products/").catch(() => ({ data: [] }))])
    .then(([brandRes, prodRes]) => { setBrands(brandRes.data || []); setProducts(prodRes.data || []); })
    .finally(() => setLoading(false));
  }, []);

  const isProductInBrand = (product, brand) => {  return true };

  const handleBrandClick = (brand) => {
    const slugOrId = brand.slug || brand.id;
    const brandProducts = brand.products?.length > 0? brand.products : products.filter((p) => isProductInBrand(p, brand));
    if (brandProducts.length === 1) {
      navigate(`/product/${brandProducts[0].id}`);
    } else {
      navigate(`/brands/${slugOrId}`); 
    }
  };

  return (
    <div className="bg-[#FAF8FC] min-h-screen pb-12">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="bg-white p-4 rounded-2xl border-gray-100 shadow-xs">
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
        </div>

        {loading? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#8E24AA] border-t-transparent rounded-full animate-spin"></div></div>
        ) : brands.length === 0? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-xs">No brands found.</div>
        ) : (
          <div className="space-y-3">
            {brands.map((brand) => {
              const imageUrl = getImageUrl(brand.logo || brand.image);
              return (
                <div key={brand.id} onClick={() => handleBrandClick(brand)} className="bg-white rounded-2xl p-4 border-gray-100 shadow-xs flex items-center gap-4 hover:bg-purple-50/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-50 flex justify-center items-center shrink-0 border-purple-100">
                    {imageUrl? <img src={imageUrl} alt={brand.name} className="w-full h-full object-cover" /> : <span className="text-[#8E24AA] font-extrabold text-lg">{brand.name?.charAt(0).toUpperCase() || "B"}</span>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base">{brand.name}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{brand.slug}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}