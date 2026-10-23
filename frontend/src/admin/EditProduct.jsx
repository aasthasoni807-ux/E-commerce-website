import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "",
    stock: "",
  });

  const allowedFields = ["title", "price", "description", "category", "image", "stock"];
  const fieldLabels = {
    title: "Product Title",
    price: "Price",
    description: "Description",
    category: "Category",
    image: "Image URL",
    stock: "Stock",
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data;
        // Only populate allowed fields — don't load _id, __v, timestamps
        setForm({
          title: p.title ?? "",
          price: p.price ?? "",
          description: p.description ?? "",
          category: p.category ?? "",
          image: p.image ?? "",
          stock: p.stock ?? "",
        });
      } catch (err) {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/products/update/${id}`, form);
      alert("Product updated!");
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Edit Product</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>
      )}

      <form className="space-y-3" onSubmit={handleSubmit}>
        {allowedFields.map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabels[key]}
            </label>
            <input
              name={key}
              value={form[key]}
              onChange={handleChange}
              placeholder={fieldLabels[key]}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {saving ? "Saving..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}