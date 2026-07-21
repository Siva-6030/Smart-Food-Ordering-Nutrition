import express from "express";
import { listMenuItems, getMenuItem, listCategories, toggleFavorite } from "../controllers/menuController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listMenuItems);
router.get("/categories/list", listCategories);
router.get("/:id", getMenuItem);
router.post("/:id/favorite", requireAuth, toggleFavorite);

export default router;
