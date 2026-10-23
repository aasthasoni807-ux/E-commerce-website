import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router";

export default function Cart() {
  const userId = localStorage.getItem("userId");
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/cart/${userId}`);
      setCart(res.data);
    } catch (err) {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = async (productId) => {
    try {
      await api.post(`/cart/remove`, { userId, productId });
      loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove item");
    }
  };

  const updateQty = async (productId, quantity) => {
    if (quantity === 0) {
      await removeItem(productId);
      return;
    }
    try {
      await api.post(`/cart/update`, { userId, productId, quantity });
      loadCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update quantity");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Please log in to view your cart</h2>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    );
  }

  // Guard: cart is null or has no items
  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + (item.productId?.price ?? 0) * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-500 text-lg mb-6">Your cart is empty.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId?._id}
              className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.productId?.image || "https://via.placeholder.com/64"}
                  alt={item.productId?.title}
                  className="w-16 h-16 object-contain rounded bg-gray-50"
                />
                <div>
                  <h2 className="text-base font-semibold text-gray-800">
                    {item.productId?.title}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    ₹{item.productId?.price?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.productId?._id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-lg font-bold transition"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.productId?._id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-lg font-bold transition"
                >
                  +
                </button>
              </div>

              <p className="font-semibold text-gray-800 min-w-[80px] text-right">
                ₹{((item.productId?.price ?? 0) * item.quantity).toLocaleString()}
              </p>

              <button
                onClick={() => removeItem(item.productId?._id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium transition ml-4"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t">
            <h2 className="text-xl font-bold">Total: ₹{total.toLocaleString()}</h2>
            <button
              onClick={() => navigate("/checkout-address")}
              className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}