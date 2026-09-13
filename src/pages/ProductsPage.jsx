import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { ArrowLeft } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("All Products");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const brandFilter = searchParams.get("brand");
  const categorySlug = searchParams.get("category");
  const categoryName = searchParams.get("category_name");

  useEffect(() => {
    setLoading(true);
    let endpoint = "/products/";
    const params = new URLSearchParams();
    if (categorySlug) params.append("category", categorySlug); 
    if (brandFilter) params.append("brand", brandFilter);
    if (params.toString()) endpoint += `?${params.toString()}`;

    api.get(endpoint)
 .then((res) => {
        const allProducts = res.data.results || res.data || [];
        setProducts(allProducts);
        if (categoryName &&!brandFilter) setPageTitle(categoryName);
      })
 .catch((err) => console.error("Error fetching products:", err))
 .finally(() => setLoading(false));
  }, [brandFilter, categorySlug, categoryName]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8FC]">
      <div className="w-10 h-10 border-4 border-[#8E24AA] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-[#FAF8FC] min-h-screen pb-12">
      <div className="bg-white p-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm border-b">
        <button onClick={() => navigate(-1)} className="p-1 cursor-pointer hover:bg-gray-100 rounded-full">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">{pageTitle}</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {products.length === 0? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xs">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border-gray-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}