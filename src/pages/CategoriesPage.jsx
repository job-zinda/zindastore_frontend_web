import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Package, BookOpen, Wrench } from "lucide-react";
import api from "../api/axios";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoryType = searchParams.get("type") || "product";

  useEffect(() => {
    const fetchCategoriesWithCount = async () => {
      setLoading(true);
      try {
       
        const catRes = await api.get(`/categories/?type=${categoryType}`);
        const cats = catRes.data.results || catRes.data || [];

        let itemsEndpoint = "/products/";
        if (categoryType === "course") itemsEndpoint = "/courses/";
        if (categoryType === "service") itemsEndpoint = "/services/";

        const itemsRes = await api.get(itemsEndpoint);
        const allItems = itemsRes.data.results || itemsRes.data || [];

     
        const catsWithCount = cats
         .map((cat) => {
            const count = allItems.filter((item) => {
              const itemCatName =
                typeof item.category === "object" && item.category!== null
                 ? item.category.name
                  : item.category;
              return itemCatName === cat.name;
            }).length;
            return {...cat, item_count: count };
          })
         .filter((cat) => cat.item_count > 0); 

        setCategories(catsWithCount);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithCount();
  }, [categoryType]);

  const headerTitle =
    categoryType === "service"
     ? "Service Categories"
      : categoryType === "course"
     ? "Course Categories"
      : "Product Categories";

  const CategoryIcon =
    categoryType === "service"? Wrench : categoryType === "course"? BookOpen : Package;

  const handleCategoryClick = (cat) => {
    const query = `type=${categoryType}&category=${cat.slug}&category_name=${encodeURIComponent(
      cat.name
    )}`;
    const route =
      categoryType === "service"? "services" : categoryType === "course"? "courses" : "products";
    navigate(`/${route}?${query}`);
  };

  return (
    <div className="bg-[#FAF8FC] min-h-screen pb-12">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="bg-white p-4 rounded-2xl border-gray-100 shadow-xs flex items-center gap-3">
          <CategoryIcon size={24} className="text-[#8E24AA]" />
          <h1 className="text-2xl font-bold text-gray-900">{headerTitle}</h1>
        </div>

        {loading? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#8E24AA] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : categories.length === 0? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-xs">
            No categories found
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className="bg-white p-4 rounded-2xl border-gray-100 shadow-xs flex items-center justify-between hover:bg-[#F6EFF8] hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div>
                  <h3 className="font-bold text-gray-800 text-base">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cat.item_count} {cat.item_count === 1? "Item" : "Items"}
                  </p>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}