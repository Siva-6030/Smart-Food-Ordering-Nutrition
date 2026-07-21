import { useEffect, useState } from "react";
import api from "../api/api";

export default function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    dietType: "veg",
    price: "",
    imageUrl: "",
    ingredients: "",
    allergens: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/admin/analytics").then(({ data }) => setAnalytics(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.post("/admin/menu", {
        name: form.name,
        description: form.description,
        category: form.category,
        dietType: form.dietType,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        allergens: form.allergens.split(",").map((s) => s.trim()).filter(Boolean),
        nutrition: {
          calories: Number(form.calories),
          protein_g: Number(form.protein_g),
          carbs_g: Number(form.carbs_g),
          fat_g: Number(form.fat_g),
        },
      });
      // Trigger embedding generation for the new dish so the AI chatbot can find it
      await api.post("/admin/menu/reembed");
      setMessage("Dish added and embedded for AI search.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to add dish");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-semibold mb-4">Admin dashboard</h1>
        {analytics && (
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-brand-600">{analytics.totalOrders}</div>
              <div className="text-xs text-gray-500">Orders</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-brand-600">₹{analytics.totalRevenue}</div>
              <div className="text-xs text-gray-500">Revenue</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-semibold text-brand-600">{analytics.totalUsers}</div>
              <div className="text-xs text-gray-500">Users</div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Add a dish</h2>
        <form onSubmit={handleSubmit} className="glass rounded-xl p-5 grid grid-cols-2 gap-3">
          <input
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm col-span-2"
          />
          <textarea
            placeholder="Description"
            required
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm col-span-2"
          />
          <input
            placeholder="Category"
            required
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm"
          />
          <select
            value={form.dietType}
            onChange={(e) => setForm((f) => ({ ...f, dietType: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm"
          >
            <option value="veg">Veg</option>
            <option value="non-veg">Non-veg</option>
            <option value="vegan">Vegan</option>
          </select>
          <input
            placeholder="Price"
            type="number"
            required
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm"
          />
          <input
            placeholder="Image URL"
            required
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm"
          />
          <input
            placeholder="Ingredients (comma separated)"
            value={form.ingredients}
            onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm col-span-2"
          />
          <input
            placeholder="Allergens (comma separated)"
            value={form.allergens}
            onChange={(e) => setForm((f) => ({ ...f, allergens: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm col-span-2"
          />
          <input
            placeholder="Calories"
            type="number"
            value={form.calories}
            onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm"
          />
          <input
            placeholder="Protein (g)"
            type="number"
            value={form.protein_g}
            onChange={(e) => setForm((f) => ({ ...f, protein_g: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm"
          />
          <input
            placeholder="Carbs (g)"
            type="number"
            value={form.carbs_g}
            onChange={(e) => setForm((f) => ({ ...f, carbs_g: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm"
          />
          <input
            placeholder="Fat (g)"
            type="number"
            value={form.fat_g}
            onChange={(e) => setForm((f) => ({ ...f, fat_g: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-white/70 dark:bg-white/10 text-sm"
          />

          <button type="submit" disabled={saving} className="btn-primary col-span-2 mt-2">
            {saving ? "Saving..." : "Add dish"}
          </button>
          {message && <p className="text-sm text-center col-span-2 text-gray-500">{message}</p>}
        </form>
      </div>
    </div>
  );
}
