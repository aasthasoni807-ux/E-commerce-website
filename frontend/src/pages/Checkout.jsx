import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router";

export default function Checkout() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          api.get(`/cart/${userId}`),
          api.get(`/address/${userId}`),
        ]);
        setCart(cartRes.data);
        setAddresses(addrRes.data);
        if (addrRes.data.length > 0) setSelectedAddress(addrRes.data[0]);
      } catch (err) {
        setError("Failed to load checkout data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + (item.productId?.price ?? 0) * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }
    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setPlacing(true);
    try {
      const res = await api.post("/order/place", {
        userId,
        address: selectedAddress,
      });
      // Navigate using the corrected 'orderId' field
      navigate(`/order-success/${res.data.orderId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Address Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Select Delivery Address</h2>
          <button
            onClick={() => navigate("/checkout-address")}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add New Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
            <p className="mb-3">No saved addresses found.</p>
            <button
              onClick={() => navigate("/checkout-address")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <label
                key={addr._id}
                className={`block border-2 p-4 rounded-lg cursor-pointer transition ${
                  selectedAddress?._id === addr._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress?._id === addr._id}
                    onChange={() => setSelectedAddress(addr)}
                    className="mt-1"
                  />
                  <div>
                    <strong className="text-gray-800">{addr.fullName}</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-sm text-gray-500">📞 {addr.phone}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
        {items.map((item) => (
          <div key={item.productId?._id} className="flex justify-between text-sm text-gray-700 mb-2">
            <span>{item.productId?.title} × {item.quantity}</span>
            <span>₹{((item.productId?.price ?? 0) * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button
        onClick={placeOrder}
        disabled={placing || addresses.length === 0}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold text-lg"
      >
        {placing ? "Placing Order..." : "Place Order (Cash on Delivery)"}
      </button>
    </div>
  );
}