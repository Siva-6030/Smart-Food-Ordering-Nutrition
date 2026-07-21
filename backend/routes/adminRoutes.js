import express from "express";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAnalytics,
} from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { ensureMenuEmbeddings } from "../services/ragService.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.post("/menu", createMenuItem);
router.put("/menu/:id", updateMenuItem);
router.delete("/menu/:id", deleteMenuItem);
router.get("/analytics", getAnalytics);

// Recompute embeddings for any menu items missing them (call after bulk edits)
router.post("/menu/reembed", async (req, res) => {
  const count = await ensureMenuEmbeddings();
  res.json({ reembedded: count });
});

export default router;
