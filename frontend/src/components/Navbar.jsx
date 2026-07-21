import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import BarcodeScanner from "./BarcodeScanner";

export default function Navbar() {
  const { profile, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 glass px-6 py-3 flex items-center justify-between">
      <Link to="/" className="font-display font-semibold text-xl text-brand-600">
        NutriPlate
      </Link>

      <div className="flex items-center gap-5">
  <Link to="/" title="Home" className="text-lg">
    🏠
  </Link>
  <button onClick={toggleTheme} title="Toggle theme" className="text-lg">
    {theme === "dark" ? "☀️" : "🌙"}
  </button>
        <button onClick={() => setScannerOpen(true)} title="Scan a barcode" className="text-lg">
          📷
        </button>
        <Link to="/orders" className="text-sm font-medium hover:text-brand-600">
          Orders
        </Link>
        {profile?.isAdmin && (
          <Link to="/admin" className="text-sm font-medium hover:text-brand-600">
            Admin
          </Link>
        )}
        <button onClick={() => navigate("/cart")} className="relative text-xl">
          🛒
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
        {profile ? (
          <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-red-500">
            Logout
          </button>
        ) : (
          <Link to="/login" className="btn-primary text-sm">
            Login
          </Link>
        )}
      </div>

      <BarcodeScanner open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </nav>
  );
}
