import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/auth/me — called right after Firebase login to fetch/create the Mongo profile
router.get("/me", requireAuth, (req, res) => res.json(req.user));

// PUT /api/auth/me — update diet preference, health goal, allergies
router.put("/me", requireAuth, async (req, res) => {
  const { dietPreference, healthGoal, allergies } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { dietPreference, healthGoal, allergies },
    { new: true }
  );
  res.json(updated);
});

export default router;
