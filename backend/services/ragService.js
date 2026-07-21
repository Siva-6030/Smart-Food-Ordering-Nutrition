import MenuItem from "../models/MenuItem.js";
import { getEmbedding, chatComplete } from "./geminiService.js";

// Simple in-memory cache: query -> { answer, expiresAt }
// Keeps repeat questions ("is this vegan?") from re-hitting the OpenAI API.
// For production, swap this for Redis.
const responseCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

function buildEmbeddingText(item) {
  return `${item.name}. Category: ${item.category}. Diet: ${item.dietType}.
Description: ${item.description}.
Ingredients: ${item.ingredients.join(", ")}.
Allergens: ${item.allergens.join(", ") || "none"}.
Nutrition: ${item.nutrition.calories} kcal, ${item.nutrition.protein_g}g protein, ${item.nutrition.carbs_g}g carbs, ${item.nutrition.fat_g}g fat.
Health tags: ${item.healthTags.join(", ") || "none"}.`;
}

/** Call once (e.g. after seeding or menu changes) to (re)compute embeddings for items missing them. */
export async function ensureMenuEmbeddings() {
  const items = await MenuItem.find({ embedding: { $size: 0 } });
  for (const item of items) {
    const text = buildEmbeddingText(item);
    const embedding = await getEmbedding(text);
    item.embedding = embedding;
    item.embeddingSourceText = text;
    await item.save();
  }
  return items.length;
}

/** Retrieve the top-K most relevant menu items for a natural-language query. */
export async function retrieveRelevantDishes(query, k = 5) {
  const queryEmbedding = await getEmbedding(query);
  const allItems = await MenuItem.find({ embedding: { $ne: [] } }).lean();

  const scored = allItems
    .map((item) => ({
      item,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return scored.map((s) => s.item);
}

/**
 * Main RAG entry point used by the chat endpoint.
 * Retrieves relevant dishes from MongoDB, grounds the LLM answer in that
 * data instead of letting it hallucinate ingredients/nutrition facts.
 */
export async function answerFoodQuestion({ query, userProfile }) {
  const cacheKey = JSON.stringify({ query: query.toLowerCase().trim(), goal: userProfile?.healthGoal });
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { answer: cached.answer, cached: true, sources: cached.sources };
  }

  const dishes = await retrieveRelevantDishes(query, 5);

  const context = dishes
    .map(
      (d, i) =>
        `[${i + 1}] ${d.name} — ${d.category}, ${d.dietType}, ₹${d.price}
Calories: ${d.nutrition?.calories} kcal | Protein: ${d.nutrition?.protein_g}g | Carbs: ${d.nutrition?.carbs_g}g | Fat: ${d.nutrition?.fat_g}g
Allergens: ${d.allergens.join(", ") || "none"} | Health tags: ${d.healthTags.join(", ") || "none"}
Ingredients: ${d.ingredients.join(", ")}`
    )
    .join("\n\n");

  const system = `You are a nutrition assistant embedded in a food ordering app.
Answer ONLY using the menu context provided below — never invent dishes, prices, or nutrition facts that aren't in the context.
If the context doesn't contain relevant info, say so honestly and suggest the user browse the full menu.
Keep answers concise (3-5 sentences), warm, and practical. Reference dish names from the context when relevant.
${userProfile?.healthGoal && userProfile.healthGoal !== "none" ? `The user's stated health goal is: ${userProfile.healthGoal}. Tailor suggestions accordingly.` : ""}
${userProfile?.allergies?.length ? `The user has these allergies, flag any conflicts clearly: ${userProfile.allergies.join(", ")}.` : ""}

Menu context:
${context}`;

  const answer = await chatComplete({
    system,
    messages: [{ role: "user", content: query }],
  });

  const sources = dishes.map((d) => ({ id: d._id, name: d.name }));
  responseCache.set(cacheKey, { answer, sources, expiresAt: Date.now() + CACHE_TTL_MS });

  return { answer, cached: false, sources };
}

/** "Swap Score" — suggest one healthier alternative to a given dish, grounded in real menu items. */
export async function suggestHealthierSwap(dishId) {
  const dish = await MenuItem.findById(dishId).lean();
  if (!dish) throw new Error("Dish not found");

  const candidates = await retrieveRelevantDishes(
    `Healthier lower-calorie or higher-protein alternative to ${dish.name}, similar category: ${dish.category}`,
    6
  );
  const alternatives = candidates.filter((c) => String(c._id) !== String(dishId));

  const system = `You are a nutrition assistant. Given a dish and a list of candidate alternatives (all real menu items),
pick the SINGLE best healthier swap and explain why in ONE sentence (max 25 words).
Respond ONLY as JSON: {"swapId": "<id or null>", "swapName": "<name or null>", "reason": "<one sentence or null>"}
If no candidate is genuinely healthier, return nulls.`;

  const userMsg = `Original dish: ${dish.name} (${dish.nutrition?.calories} kcal, ${dish.nutrition?.protein_g}g protein)

Candidates:
${alternatives
  .map((c) => `id:${c._id} | ${c.name} | ${c.nutrition?.calories} kcal | ${c.nutrition?.protein_g}g protein`)
  .join("\n")}`;

  const raw = await chatComplete({
    system,
    messages: [{ role: "user", content: userMsg }],
    responseFormatJson: true,
  });

  return JSON.parse(raw);
}
