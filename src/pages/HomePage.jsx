import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import SimpleCard from "../components/SimpleCard";
import {
  ShoppingBag,
  BookOpen,
  Wrench,
  Search,
  Store,
  ChevronRight,
  Hand
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Products");
  const [subTab, setSubTab] = useState("all");

  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [services, setServices] = useState([]);
  const [brands, setBrands] = useState([]);

  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const [showAllProducts, setShowAllProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const fetchBanners = api.get("/banners/").catch(() => api.get("/cms/banners/")).catch(() => ({ data: [] }));

    Promise.all([
      api.get("/products/"),
      api.get("/courses/"),
      api.get("/services/"),
      api.get("/brands/").catch(() => ({ data: [] })),
      fetchBanners
    ])
  .then(([prodRes, courseRes, servRes, brandRes, bannerRes]) => {
        setProducts(prodRes.data || []);
        setCourses(courseRes.data || []);
        setServices(servRes.data || []);
        setBrands(brandRes.data || []);
        setBanners(bannerRes.data || []);
      })
  .catch((err) => console.error("Error fetching homepage data:", err))
  .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const filterItems = (items) => {
    if (!searchQuery.trim()) return items;
    return items.filter((item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getBrandProducts = (brand) => {
    if (brand.products && Array.isArray(brand.products) && brand.products.length > 0) {
      return filterItems(brand.products);
    }
    return filterItems(
      products.filter((p) => {
        if (!p.brand) return false;
        if (typeof p.brand === "object") {
          return p.brand.id === brand.id || p.brand.slug === brand.slug || p.brand.name?.toLowerCase() === brand.name?.toLowerCase();
        }
        return p.brand === brand.id || p.brand === brand.slug || String(p.brand).toLowerCase() === brand.name?.toLowerCase();
      })
    );
  };

  
  const handleBrandClick = (brand) => {
    const slugOrId = brand.slug || brand.id;
    const brandProducts = getBrandProducts(brand);
    if (brandProducts.length === 1) {
      const singleProduct = brandProducts[0];
      navigate(`/product/${singleProduct.slug || singleProduct.id}`);
    } else {
      navigate(`/brands/${slugOrId}`); 
    }
  };

  const handleBannerClick = (banner) => {
    if (!banner) return;
    if (banner.link_path) {
      navigate(banner.link_path);
    } else if (banner.link_url) {
      window.open(banner.link_url, "_blank");
    }
  };

  const whatsappMessage = encodeURIComponent("Hi, I am interested in advertising or collaborating with Zinda Store.");
  const collabWhatsappUrl = `https://wa.me/917592998150?text=${whatsappMessage}`;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 pb-12 space-y-6">

      {/* TABS SECTION */}
      <div className="bg-gray-100 p-1 rounded-full flex justify-center items-center gap-2">
        {["Products", "Courses", "Services"].map((tab) => (
          <button
            key={tab}
            onClick={() => {setActiveTab(tab); setSubTab("all");}}
            className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2 px-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 ${
              activeTab === tab? "bg-white text-[#7B2CBF] shadow-sm" : "text-gray-600 hover:text-black"
            }`}
          >
            {tab === "Products" && <ShoppingBag size={16} />}
            {tab === "Courses" && <BookOpen size={16} />}
            {tab === "Services" && <Wrench size={16} />}
            {tab}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] shadow-sm text-gray-700"
        />
        <Search size={20} className="text-gray-400 absolute left-4 top-3.5" />
      </div>

      {/* BANNERS */}
      {banners.length > 0? (
        <div className="relative w-full overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div onClick={() => handleBannerClick(banners[currentBannerIndex])} className="cursor-pointer">
            <img src={banners[currentBannerIndex]?.image_url} alt={banners[currentBannerIndex]?.title || "Banner"} className="w-full h-44 sm:h-60 md:h-72 object-cover rounded-2xl transition-transform duration-500 hover:scale-105"/>
          </div>
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentBannerIndex(idx)} className={`h-2 rounded-full transition-all ${currentBannerIndex === idx? "w-6 bg-[#7B2CBF]" : "w-2 bg-white/70"}`} />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* BROWSE SECTION */}
      <section className="pt-2">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-800 text-lg">Browse</h3>
          <button onClick={() => { const type = activeTab === "Products"? "product" : activeTab === "Services"? "service" : "course"; navigate(`/categories?type=${type}`); }} className="text-sm font-semibold text-[#7B2CBF] hover:text-[#7521be] flex items-center gap-1 transition">
            See categories <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1">
          {activeTab === "Products" && (
            <>
              <button onClick={() => navigate("/brands")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-[#F6EFF8] hover:border-[#7B2CBF] hover:-translate-y-0.5 transition-all duration-300 shadow-xs">
                <Store size={16} /> Brands
              </button>
              <button onClick={() => setSubTab("all")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white text-gray-700 border-gray-200 hover:bg-[#F6EFF8] hover:border-[#7B2CBF] hover:-translate-y-0.5 transition-all duration-300 shadow-xs">
                <ShoppingBag size={16} /> All Products
              </button>
            </>
          )}
        </div>
      </section>

      {/* MAIN CONTENT */}
      {loading? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#7B2CBF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 mt-3 font-medium">Loading items...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {activeTab === "Products" && (
            <>
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-gray-800">Featured products</h2>
                  <button onClick={() => setShowAllProducts(!showAllProducts)} className="text-sm font-semibold text-[#7B2CBF] hover:underline transition">
                    {showAllProducts? "Show less" : "See all"}
                  </button>
                </div>
                {filterItems(products).length === 0? <p className="text-gray-500 text-sm py-8 text-center bg-white rounded-2xl">No products found</p> : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {(showAllProducts? filterItems(products) : filterItems(products).slice(0, 4)).map((product) => (
                      <div key={product.id} className="bg-white rounded-2xl border-gray-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-6 pt-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-800">Popular brands</h2>
                  <button onClick={() => navigate("/brands")} className="text-sm text-[#7B2CBF] font-semibold hover:underline flex items-center gap-0.5 transition">
                    See all brands <ChevronRight size={16} />
                  </button>
                </div>
                {brands.length === 0? <div className="bg-white p-6 text-center text-gray-500 rounded-2xl text-sm">No popular brands listed right now.</div> : (
                  brands.map((brand) => {
                    const brandProducts = getBrandProducts(brand);
                    if (brandProducts.length === 0) return null;
                    return (
                      <div key={brand.id} className="space-y-3 bg-white p-4 rounded-2xl border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-center">
                          <h3 onClick={() => handleBrandClick(brand)} className="font-bold text-gray-800 text-sm md:text-base hover:text-[#7B2CBF] cursor-pointer transition">{brand.name}</h3>
                          <button onClick={() => handleBrandClick(brand)} className="text-sm text-[#7B2CBF] font-semibold hover:underline flex items-center gap-0.5 transition">See all <ChevronRight size={16} /></button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {brandProducts.slice(0, 4).map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl border-gray-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                              <ProductCard product={product} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            </>
          )}

          {activeTab === "Courses" && (
            <section>
              <h2 className="text-base font-bold text-gray-800 mb-4">Featured courses</h2>
              {filterItems(courses).length === 0? <p className="text-gray-500 text-sm py-8 text-center bg-white rounded-2xl">No courses found</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filterItems(courses).map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl border-gray-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <SimpleCard item={course} type="course" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "Services" && (
            <section>
              <h2 className="text-base font-bold text-gray-800 mb-4">Featured services</h2>
              {filterItems(services).length === 0? <p className="text-gray-500 text-sm py-8 text-center bg-white rounded-2xl">No services found</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filterItems(services).map((service) => (
                    <div key={service.id} className="bg-white rounded-2xl border-gray-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <SimpleCard item={service} type="service" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Collab Banner */}
      <div className="mt-12 bg-white rounded-2xl border-gray-100 p-6 text-center shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex-col items-center justify-center">
        <h2 className="text-2xl font-black tracking-tight text-gray-800 mb-1"><span className="text-[#7B2CBF]">zinda</span> store</h2>
        <a href={collabWhatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group cursor-pointer mt-2">
          <div className="bg-[#F6EFF8] p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
            <Hand className="w-6 h-6 text-[#7B2CBF] transform -rotate-12" />
          </div>
          <p className="text-sm font-semibold text-gray-800 group-hover:text-[#7B2CBF] transition-colors">To Advertise here or to Collab with us</p>
          <span className="text-sm font-bold text-gray-900 group-hover:underline">Click here</span>
        </a>
      </div>
    </div>
  );
}