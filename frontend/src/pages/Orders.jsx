import { useEffect, useState } from "react";
import api from "../api/api";

const STATUS_STEPS = ["placed", "preparing", "out-for-delivery", "delivered"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/mine")
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-20 text-gray-500">Loading orders...</p>;
  if (orders.length === 0) return <p className="text-center py-20 text-gray-500">No orders yet.</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-display font-semibold mb-2">Your orders</h1>
      {orders.map((order) => {
        const stepIndex = STATUS_STEPS.indexOf(order.status);
        return (
          <div key={order._id} className="glass rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">#{order._id.slice(-6).toUpperCase()}</span>
              <span className="font-semibold text-brand-600">₹{order.totalAmount}</span>
            </div>

            <div className="text-sm mb-3">
              {order.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
            </div>

            {order.status !== "cancelled" && (
              <div className="flex items-center gap-1">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex-1 flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${i <= stepIndex ? "bg-brand-500" : "bg-gray-300"}`}
                    />
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 ${i < stepIndex ? "bg-brand-500" : "bg-gray-300"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2 capitalize">{order.status.replace(/-/g, " ")}</div>
          </div>
        );
      })}
    </div>
  );
}
