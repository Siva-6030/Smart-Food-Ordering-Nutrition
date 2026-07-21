import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/api";
import FoodCard from "../components/FoodCard";
import DishModal from "../components/DishModal";
import LoadingSkeleton from "../components/LoadingSkeleton";
import VoiceSearch from "../components/VoiceSearch";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);
  const [filters, setFilters] = useState({ diet: "both", category: "", search: "" });
  const { addItem } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleDishClick = (dish) => {
    if (!profile) {
      navigate("/login");
      return;
    }
    setSelectedDish(dish);
  };

  useEffect(() => {
    api.get("/menu/categories/list").then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.diet !== "both") params.diet = filters.diet;
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;

    api
      .get("/menu", { params })
      .then(({ data }) => setDishes(data))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-3xl font-display font-semibold">Discover meals that fit your goals</h1>
        <p className="text-gray-500 mt-1">AI-curated nutrition insight on every dish.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <input
            placeholder="Search dishes... or use the mic"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="px-4 py-2 rounded-xl bg-white/70 dark:bg-white/10 text-sm outline-none flex-1"
          />
          <VoiceSearch onResult={(transcript) => setFilters((f) => ({ ...f, search: transcript }))} />
        </div>
        <select
          value={filters.diet}
          onChange={(e) => setFilters((f) => ({ ...f, diet: e.target.value }))}
          className="px-4 py-2 rounded-xl bg-white/70 dark:bg-white/10 text-sm outline-none"
        >
          <option value="both">All diets</option>
          <option value="veg">Vegetarian</option>
          <option value="non-veg">Non-vegetarian</option>
          <option value="vegan">Vegan</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          className="px-4 py-2 rounded-xl bg-white/70 dark:bg-white/10 text-sm outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : dishes.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No dishes match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dishes.map((dish) => (
            <FoodCard key={dish._id} dish={dish} onClick={() => handleDishClick(dish)} onAddToCart={addItem} />
          ))}
        </div>
      )}

      <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} onAddToCart={addItem} />
    </div>
  );
}