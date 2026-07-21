import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getWeeklyNutritionReport,
} from "../controllers/orderController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth); // every order route requires login

router.post("/", placeOrder);
router.get("/mine", getMyOrders);
router.get("/weekly-nutrition-report", getWeeklyNutritionReport);
router.get("/:id", getOrder);
router.patch("/:id/status", requireAdmin, updateOrderStatus);

export default router;
