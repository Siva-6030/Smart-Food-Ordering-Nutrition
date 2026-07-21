import MenuItem from "../models/MenuItem.js";
import User from "../models/User.js";

// GET /api/menu?diet=veg&category=Main+Course&search=paneer&healthTag=high-protein
export async function listMenuItems(req, res) {
  const { diet, category, search, healthTag, maxCalories } = req.query;
  const filter = { isAvailable: true };

  if (diet && diet !== "both") filter.dietType = diet;
  if (category) filter.category = category;
  if (healthTag) filter.healthTags = healthTag;
  if (maxCalories) filter["nutrition.calories"] = { $lte: Number(maxCalories) };
  if (search) filter.$text = { $search: search };

  const items = await MenuItem.find(filter).sort({ rating: -1 }).limit(100);
  res.json(items);
}

// GET /api/menu/:id
export async function getMenuItem(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Dish not found" });

  // Track recently viewed if the user is logged in
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentlyViewedIds: item._id },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recentlyViewedIds: { $each: [item._id], $position: 0, $slice: 10 } },
    });
  }

  res.json(item);
}

// GET /api/menu/categories/list
export async function listCategories(req, res) {
  const categories = await MenuItem.distinct("category");
  res.json(categories);
}

// POST /api/menu/:id/favorite  (toggle)
export async function toggleFavorite(req, res) {
  const user = req.user;
  const dishId = req.params.id;
  const isFav = user.favoriteDishIds.some((id) => String(id) === dishId);

  if (isFav) {
    user.favoriteDishIds = user.favoriteDishIds.filter((id) => String(id) !== dishId);
  } else {
    user.favoriteDishIds.push(dishId);
  }
  await user.save();
  res.json({ favorited: !isFav });
}
