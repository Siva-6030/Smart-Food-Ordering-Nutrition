import { answerFoodQuestion, suggestHealthierSwap } from "../services/ragService.js";
import { chatComplete } from "../services/geminiService.js";

// POST /api/ai/chat  { query }
export async function chatWithAI(req, res) {
  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: "Query is required" });

  try {
    const result = await answerFoodQuestion({ query, userProfile: req.user });
    res.json(result);
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ error: "AI assistant is temporarily unavailable" });
  }
}

// GET /api/ai/swap/:dishId
export async function getHealthySwap(req, res) {
  try {
    const swap = await suggestHealthierSwap(req.params.dishId);
    res.json(swap);
  } catch (err) {
    console.error("Swap suggestion error:", err.message);
    res.status(500).json({ error: "Could not generate a suggestion right now" });
  }
}

// GET /api/ai/daily-tip
export async function getDailyTip(req, res) {
  try {
    const tip = await chatComplete({
      system:
        "You give one short, practical, non-generic healthy eating tip per request. One or two sentences max. No preamble, just the tip.",
      messages: [{ role: "user", content: "Give me today's healthy eating tip." }],
    });
    res.json({ tip });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch a tip right now" });
  }
}
