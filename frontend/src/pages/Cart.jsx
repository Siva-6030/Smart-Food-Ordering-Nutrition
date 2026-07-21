import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../api/api";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const payload = {
        items: items.map((i) => ({ menuItemId: i.menuItem._id, quantity: i.quantity })),
      };
      const { data } = await api.post("/orders", payload);
      clearCart();
      navigate(`/orders`);
    } catch (err) {
      alert(err.response?.data?.error || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return <p className="text-center py-20 text-gray-500">Your cart is empty.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-display font-semibold mb-6">Your cart</h1>

      <div className="space-y-3">
        {items.map(({ menuItem, quantity }) => (
          <div key={menuItem._id} className="glass rounded-xl p-4 flex items-center gap-4">
            <img src={menuItem.imageUrl} alt={menuItem.name} className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="font-medium">{menuItem.name}</div>
              <div className="text-sm text-gray-500">₹{menuItem.price}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(menuItem._id, quantity - 1)}
                className="w-7 h-7 rounded-full border flex items-center justify-center"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => updateQuantity(menuItem._id, quantity + 1)}
                className="w-7 h-7 rounded-full border flex items-center justify-center"
              >
                +
              </button>
            </div>
            <button onClick={() => removeItem(menuItem._id)} className="text-red-500 text-sm">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-4 mt-6 flex justify-between items-center">
        <span className="font-medium">Total</span>
        <span className="text-lg font-semibold text-brand-600">₹{totalAmount}</span>
      </div>

      <button onClick={placeOrder} disabled={placing} className="btn-primary w-full mt-4">
        {placing ? "Placing order..." : "Place order"}
      </button>
    </div>
  );
}
