import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import User from "../models/User.js";

// POST /api/orders  { items: [{ menuItemId, quantity }] }
export async function placeOrder(req, res) {
  const { items, couponCode } = req.body;
  if (!items?.length) return res.status(400).json({ error: "Cart is empty" });

  const menuItems = await MenuItem.find({ _id: { $in: items.map((i) => i.menuItemId) } });

  let totalAmount = 0;
  const totalNutrition = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  const orderItems = items.map((cartItem) => {
    const menuItem = menuItems.find((m) => String(m._id) === cartItem.menuItemId);
    if (!menuItem) throw new Error(`Dish ${cartItem.menuItemId} not found`);

    totalAmount += menuItem.price * cartItem.quantity;
    totalNutrition.calories += (menuItem.nutrition?.calories || 0) * cartItem.quantity;
    totalNutrition.protein_g += (menuItem.nutrition?.protein_g || 0) * cartItem.quantity;
    totalNutrition.carbs_g += (menuItem.nutrition?.carbs_g || 0) * cartItem.quantity;
    totalNutrition.fat_g += (menuItem.nutrition?.fat_g || 0) * cartItem.quantity;

    return {
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: cartItem.quantity,
    };
  });

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    totalNutrition,
    couponCode,
  });

  // Award loyalty points: 1 point per ₹100 spent
  await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: Math.floor(totalAmount / 100) } });

  res.status(201).json(order);
}

// GET /api/orders/mine
export async function getMyOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}

// GET /api/orders/:id
export async function getOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (String(order.user) !== String(req.user._id) && !req.user.isAdmin) {
    return res.status(403).json({ error: "Not your order" });
  }
  res.json(order);
}

// PATCH /api/orders/:id/status  (admin only) { status }
export async function updateOrderStatus(req, res) {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
}

// GET /api/orders/weekly-nutrition-report  (for the logged-in user)
export async function getWeeklyNutritionReport(req, res) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const orders = await Order.find({ user: req.user._id, createdAt: { $gte: oneWeekAgo } });

  const totals = orders.reduce(
    (acc, o) => {
      acc.calories += o.totalNutrition?.calories || 0;
      acc.protein_g += o.totalNutrition?.protein_g || 0;
      acc.orderCount += 1;
      return acc;
    },
    { calories: 0, protein_g: 0, orderCount: 0 }
  );

  res.json({ ...totals, avgCaloriesPerOrder: totals.orderCount ? Math.round(totals.calories / totals.orderCount) : 0 });
}
