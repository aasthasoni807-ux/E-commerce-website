import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router";

export default function CheckoutAddress() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId) {
      navigate("/login");
      return;
    }

    setSaving(true);
    try {
      await api.post("/address/add", {
        ...form,
        userId,
      });
      navigate("/checkout");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fieldLabels = {
    fullName: "Full Name",
    phone: "Phone Number",
    addressLine: "Address Line",
    city: "City",
    state: "State",
    pincode: "Pincode",
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Delivery Address</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={saveAddress} className="space-y-4">
        {Object.keys(form).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldLabels[key]}
            </label>
            <input
              name={key}
              value={form[key]}
              placeholder={fieldLabels[key]}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
        >
          {saving ? "Saving..." : "Save & Continue"}
        </button>
      </form>
    </div>
  );
}