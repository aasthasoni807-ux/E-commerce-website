import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams } from "react-router";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedMsg, setAddedMsg] = useState("");

  const loadProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      setError("Product not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const addToCart = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first");
      return;
    }

    try {
      await api.post("/cart/add", {
        userId,
        productId: product._id,
      });

      setAddedMsg("Added to cart!");
      window.dispatchEvent(new Event("cartUpdated"));
      setTimeout(() => setAddedMsg(""), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 text-center text-red-500 text-lg">{error || "Product not found."}</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 bg-gray-50 rounded-xl flex items-center justify-center p-6">
          <img
            src={product.image || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={product.title}
            className="max-h-80 object-contain"
          />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center">
          <span className="text-sm text-blue-600 font-medium uppercase tracking-wide mb-2">
            {product.category}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.title}</h1>
          <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">₹{product.price?.toLocaleString()}</p>
          <p className={`text-sm mb-6 ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          {addedMsg && (
            <div className="mb-4 text-green-600 font-medium">{addedMsg}</div>
          )}

          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}