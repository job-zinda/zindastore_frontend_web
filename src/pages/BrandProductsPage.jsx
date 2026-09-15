import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import api, { getImageUrl } from "../api/axios";

export default function BrandProductsPage() {
  const { brandSlug } = useParams();
  const [products, setProducts] = useState([]);
  const [brandName, setBrandName] = useState("Products");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.get("/products/").catch(() => ({ data: { results: [] } })),
      api.get("/brands/").catch(() => ({ data: { results: [] } })),
    ])
     .then(([prodRes, brandRes]) => {
        const allProducts = Array.isArray(prodRes.data)? prodRes.data : prodRes.data?.results || [];
        const allBrands = Array.isArray(brandRes.data)? brandRes.data : brandRes.data?.results || [];

        const param = String(brandSlug || "").toLowerCase().trim();

        const currentBrand = allBrands.find((b) => {
          const bId = String(b.id || "").toLowerCase().trim();
          const bSlug = String(b.slug || "").toLowerCase().trim();
          const bName = String(b.name || "").toLowerCase().trim();
          return bId === param || bSlug === param || bName === param;
        });

        if (currentBrand) {
          setBrandName(currentBrand.name);
        } else {
          setBrandName(brandSlug? brandSlug.replace(/-/g, " ").toUpperCase() : "Brand Products");
        }

        const matchedProducts = allProducts.filter((p) => {
          if (!p.brand &&!p.brand_id &&!p.brand_slug &&!p.brand_name) return false;

          let pBrandId = "", pBrandName = "", pBrandSlug = "";

          if (typeof p.brand === "object" && p.brand!== null) {
            pBrandId = String(p.brand.id || "").toLowerCase().trim();
            pBrandName = String(p.brand.name || "").toLowerCase().trim();
            pBrandSlug = String(p.brand.slug || "").toLowerCase().trim();
          } else {
            pBrandId = String(p.brand || p.brand_id || "").toLowerCase().trim();
            pBrandName = String(p.brand || p.brand_name || "").toLowerCase().trim();
            pBrandSlug = String(p.brand || p.brand_slug || "").toLowerCase().trim();
          }

          if (currentBrand) {
            const cBrandId = String(currentBrand.id || "").toLowerCase().trim();
            const cBrandName = String(currentBrand.name || "").toLowerCase().trim();
            const cBrandSlug = String(currentBrand.slug || "").toLowerCase().trim();

            if (pBrandId && pBrandId === cBrandId) return true;
            if (pBrandName && pBrandName === cBrandName) return true;
            if (pBrandSlug && pBrandSlug === cBrandSlug) return true;
          }

          if (param) {
            if (pBrandId === param) return true;
            if (pBrandName === param) return true;
            if (pBrandSlug === param) return true;
          }

          return false;
        });

        setProducts(matchedProducts);
      })
     .catch((err) => console.error("Error fetching brand products:", err))
     .finally(() => setLoading(false));
  }, [brandSlug]);

  const filteredProducts = products.filter((item) =>
    (item.title || item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#FAF8FC] min-h-screen pb-12">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="bg-white p-4 rounded-2xl border-gray-100 shadow-xs">
          <h1 className="text-2xl font-bold text-gray-900">{brandName}</h1>
          <p className="text-xs text-gray-500 mt-1">{filteredProducts.length} Products</p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products in this brand"
            className="w-full bg-white border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#8E24AA] text-gray-800 shadow-sm"
          />
          <Search size={18} className="text-gray-400 absolute left-4 top-3.5" />
        </div>

        {loading? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#8E24AA] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-xs">
            No products found in this brand.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const rawImg = product.image || product.thumbnail || product.primary_image || (product.images && product.images[0]?.image);
              const prodImg = getImageUrl(rawImg);
              const price = product.sale_price || product.price || "0.00";
              const mrp = product.mrp_price || product.mrp;

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.slug || product.id}`)}
                  className="bg-white rounded-2xl border-gray-100 shadow-xs p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {prodImg && (
                    <img src={prodImg} alt="" className="w-20 h-20 object-cover rounded-xl border-gray-100 shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-1">
                      {product.title || product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-bold text-gray-900">₹{Number(price).toLocaleString()}</p>
                      {mrp && Number(mrp) > Number(price) && <p className="text-xs line-through text-gray-400">₹{Number(mrp).toLocaleString()}</p>}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}