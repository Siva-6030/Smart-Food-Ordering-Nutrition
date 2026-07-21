import { motion } from "framer-motion";

export default function FoodCard({ dish, onClick, onAddToCart }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="glass rounded-2xl overflow-hidden cursor-pointer group"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 text-gray-800">
          {dish.dietType === "veg" ? "🟢 Veg" : dish.dietType === "vegan" ? "🌱 Vegan" : "🔴 Non-veg"}
        </span>
        {dish.healthTags?.[0] && (
          <span className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-500/90 text-white">
            {dish.healthTags[0]}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 dark:text-white">{dish.name}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-300">⭐ {dish.rating}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{dish.description}</p>

        <div className="flex justify-between items-center mt-3">
          <div>
            <span className="font-semibold text-brand-600">₹{dish.price}</span>
            <span className="text-xs text-gray-400 ml-2">{dish.nutrition?.calories} kcal</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(dish);
            }}
            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
