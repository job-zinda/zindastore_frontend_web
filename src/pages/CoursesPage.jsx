import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import api, { getImageUrl } from "../api/axios";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categorySlug = searchParams.get("category");
  const categoryName = searchParams.get("category_name") || "All Courses";

  useEffect(() => {
    setLoading(true);
    let endpoint = "/courses/";
    if (categorySlug) {
      endpoint = `/courses/?category=${categorySlug}`;
    }
    api.get(endpoint)
   .then((res) => setCourses(res.data.results || res.data || []))
   .catch((err) => console.error(err))
   .finally(() => setLoading(false));
  }, [categorySlug]);

  const filteredCourses = courses.filter((c) =>
  !searchQuery.trim() || (c.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#FAF8FC] min-h-screen">
      <div className="bg-[#faf8fc] text-black p-4 flex items-center gap-4 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="hover:bg-white/10 p-1 rounded-full"><ArrowLeft size={22} /></button>
        <h1 className="text-xl font-semibold capitalize">{categoryName}</h1>
      </div>
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="relative">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search in ${categoryName}...`} className="w-full bg-white border-gray-200 rounded-2xl px-4 py-3 pl-11 text-sm focus:ring-2 focus:ring-[#8E24AA] focus:border-[#8E24AA]" />
          <Search size={18} className="text-gray-400 absolute left-4 top-3.5" />
        </div>
        {loading? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#8E24AA] border-t-transparent rounded-full animate-spin"></div></div> :
         filteredCourses.length === 0? <div className="bg-white p-12 text-center text-gray-500 rounded-2xl shadow-xs">No courses found</div> :
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
           {filteredCourses.map((course) => (
             <div key={course.id} onClick={() => navigate(`/course/${course.slug}`)} className="bg-white rounded-2xl p-3 border-gray-100 shadow-xs cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
               <img
                 src={course.thumbnail? getImageUrl(course.thumbnail) : "/placeholder.jpg"}
                 alt={course.title}
                 className="w-full h-36 object-cover rounded-xl mb-3 bg-gray-100"
                 onError={(e) => e.target.src = "/placeholder.jpg"}
               />
               <h3 className="font-bold text-gray-800 text-sm">{course.title}</h3>
               <p className="font-bold text-[#8E24AA] text-sm mt-2">₹{Number(course.sale_price).toLocaleString()}</p>
             </div>
           ))}
         </div>}
      </main>
    </div>
  );
}