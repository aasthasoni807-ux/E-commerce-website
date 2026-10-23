import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function Navbar() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    const loadCart = async () => {
      if (!userId) {
        setCartCount(0);
        return;
      }
      try {
        const res = await api.get(`/cart/${userId}`);
        // Guard against null cart or missing items
        const items = res.data?.items ?? [];
        const total = items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, [userId]);

  const logout = () => {
    localStorage.clear();
    setCartCount(0);
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <Link to="/" className="font-bold text-xl tracking-tight hover:text-blue-400 transition">
        🛍️ Maruti Store
      </Link>

      <div className="flex gap-4 items-center">
        <Link
          to="/cart"
          className="relative text-xl hover:text-blue-400 transition"
          aria-label="View Cart"
        >
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>

        {!userId ? (
          <>
            <Link
              to="/login"
              className="text-sm font-medium hover:text-blue-400 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-sm text-gray-300 hidden sm:inline">Hi, {userName}</span>
            )}
            <button
              onClick={logout}
              className="text-sm font-medium hover:text-red-400 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}