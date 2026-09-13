import { getImageUrl } from "../api/axios";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const salePrice = product.sale_price || product.variants?.[0]?.sale_price || product.base_price;
  const mrpPrice = product.mrp_price || product.variants?.[0]?.mrp_price;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md transition flex flex-col justify-between"
    >
      <div>
        <img
          src={getImageUrl(product.thumbnail || product.images?.[0]?.image)}
          alt={product.title}
          className="w-full h-40 object-cover rounded-lg mb-2"
        />
        <p className="text-xs text-gray-400 font-medium">{product.brand || "Zinda"}</p>
        <h3 className="font-semibold text-sm text-zinda-text truncate">{product.title}</h3>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <p className="text-zinda font-bold">₹{salePrice}</p>
        {mrpPrice && (
          <p className="text-xs line-through text-gray-400">₹{mrpPrice}</p>
        )}
      </div>
    </Link>
  );
}