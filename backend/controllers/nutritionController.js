// Open Food Facts is a free, open database of packaged food products —
// no API key required. Docs: https://openfoodfacts.github.io/api-documentation/
const OFF_BASE_URL = "https://world.openfoodfacts.org/api/v2/product";

// GET /api/nutrition/barcode/:code
export async function lookupBarcode(req, res) {
  const { code } = req.params;

  try {
    const response = await fetch(`${OFF_BASE_URL}/${code}.json`);
    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return res.status(404).json({ error: "Product not found for this barcode" });
    }

    const p = data.product;
    const n = p.nutriments || {};

    res.json({
      barcode: code,
      name: p.product_name || "Unknown product",
      brand: p.brands || "",
      imageUrl: p.image_front_small_url || p.image_url || null,
      allergens: (p.allergens_tags || []).map((a) => a.replace("en:", "")),
      nutrition: {
        calories: Math.round(n["energy-kcal_100g"] || 0),
        protein_g: Math.round(n["proteins_100g"] || 0),
        carbs_g: Math.round(n["carbohydrates_100g"] || 0),
        fat_g: Math.round(n["fat_100g"] || 0),
        sugar_g: Math.round(n["sugars_100g"] || 0),
        sodium_mg: Math.round((n["sodium_100g"] || 0) * 1000),
      },
      nutritionGrade: p.nutrition_grades || null, // Open Food Facts' own A-E health grade
      note: "Nutrition values are per 100g as reported by Open Food Facts.",
    });
  } catch (err) {
    console.error("Barcode lookup error:", err.message);
    res.status(502).json({ error: "Could not reach the product database. Try again." });
  }
}
