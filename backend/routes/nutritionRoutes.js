import express from "express";
import { lookupBarcode } from "../controllers/nutritionController.js";

const router = express.Router();

// Public — no login required, so users can scan before signing in
router.get("/barcode/:code", lookupBarcode);

export default router;
