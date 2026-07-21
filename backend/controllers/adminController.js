import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// POST /api/admin/menu
export async function createMenuItem(req, res) {
  const item = await MenuItem.create(req.body); // embedding gets generated later via /admin/menu/:id/reembed
  res.status(201).json(item);
}

// PUT /api/admin/menu/:id
export async function updateMenuItem(req, res) {
  const item = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { ...req.body, embedding: [] }, // reset embedding so it gets regenerated with new data
    { new: true }
  );
  if (!item) return res.status(404).json({ error: "Dish not found" });
  res.json(item);
}

// DELETE /api/admin/menu/:id
export async function deleteMenuItem(req, res) {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ success: true });
}

// GET /api/admin/analytics
export async function getAnalytics(req, res) {
  const [totalOrders, totalRevenueAgg, totalUsers, topDishes, statusBreakdown] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, sum: { $sum: "$totalAmount" } } }]),
    User.countDocuments(),
    Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", count: { $sum: "$items.quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  res.json({
    totalOrders,
    totalRevenue: totalRevenueAgg[0]?.sum || 0,
    totalUsers,
    topDishes,
    statusBreakdown,
  });
}
