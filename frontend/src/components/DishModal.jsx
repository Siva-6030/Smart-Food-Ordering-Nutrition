import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/api";

export default function DishModal({ dish, onClose, onAddToCart }) {
  const [swap, setSwap] = useState(null);
  const [loadingSwap, setLoadingSwap] = useState(false);

  useEffect(() => {
    if (!dish) return;
    setSwap(null);
    setLoadingSwap(true);
    api
      .get(`/ai/swap/${dish._id}`)
      .then(({ data }) => setSwap(data))
      .catch(() => setSwap(null))
      .finally(() => setLoadingSwap(false));
  }, [dish]);

  if (!dish) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        >
          <img src={dish.imageUrl} alt={dish.name} className="w-full h-56 object-cover rounded-t-2xl" />

          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{dish.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{dish.description}</p>
              </div>
              <span className="text-lg font-semibold text-brand-600">₹{dish.price}</span>
            </div>

            {/* Nutrition facts */}
            <div className="grid grid-cols-4 gap-3 mt-5">
              {[
                ["Calories", `${dish.nutrition?.calories} kcal`],
                ["Protein", `${dish.nutrition?.protein_g} g`],
                ["Carbs", `${dish.nutrition?.carbs_g} g`],
                ["Fat", `${dish.nutrition?.fat_g} g`],
              ].map(([label, value]) => (
                <div key={label} className="bg-white/60 dark:bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="font-semibold">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10">
                Spice: {"🌶️".repeat(dish.spiceLevel || 0) || "Mild"}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10">
                {dish.prepTimeMinutes} min prep
              </span>
              {dish.allergens?.map((a) => (
                <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                  ⚠ {a}
                </span>
              ))}
            </div>

            {/* AI healthier swap suggestion */}
            <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50 dark:bg-brand-500/10 p-4">
              <div className="text-sm font-medium text-brand-700 dark:text-brand-400">✨ AI suggestion</div>
              {loadingSwap && <p className="text-sm text-gray-500 mt-1">Thinking of a healthier swap...</p>}
              {!loadingSwap && swap?.swapName && (
                <p className="text-sm mt-1">
                  Try <strong>{swap.swapName}</strong> instead — {swap.reason}
                </p>
              )}
              {!loadingSwap && !swap?.swapName && (
                <p className="text-sm text-gray-500 mt-1">This dish is already a solid choice as-is.</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 font-medium">
                Close
              </button>
              <button
                onClick={() => {
                  onAddToCart(dish);
                  onClose();
                }}
                className="flex-1 btn-primary"
              >
                Add to cart
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
