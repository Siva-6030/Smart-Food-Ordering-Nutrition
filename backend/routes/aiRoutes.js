import express from "express";
import { chatWithAI, getHealthySwap, getDailyTip } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", requireAuth, chatWithAI);
router.get("/swap/:dishId", getHealthySwap);
router.get("/daily-tip", getDailyTip);

export default router;
