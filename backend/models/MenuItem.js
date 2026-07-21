import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema(
  {
    calories: Number,
    protein_g: Number,
    carbs_g: Number,
    fat_g: Number,
    fiber_g: Number,
    sugar_g: Number,
    sodium_mg: Number,
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // e.g. "Main Course", "Dessert"
    dietType: {
      type: String,
      enum: ["veg", "non-veg", "vegan"],
      required: true,
    },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    ingredients: [{ type: String }],
    allergens: [{ type: String }], // e.g. ["nuts", "dairy", "gluten"]
    spiceLevel: { type: Number, min: 0, max: 3, default: 1 }, // 0=mild,3=very spicy
    prepTimeMinutes: { type: Number, default: 15 },
    nutrition: nutritionSchema,
    healthTags: [{ type: String }], // e.g. ["high-protein", "low-calorie", "diabetic-friendly"]
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 4.2 },
    ratingCount: { type: Number, default: 0 },
    // Cached OpenAI embedding of a text summary of this dish, used for RAG retrieval
    embedding: { type: [Number], default: [] },
    embeddingSourceText: { type: String, default: "" },
  },
  { timestamps: true }
);

menuItemSchema.index({ name: "text", description: "text", category: "text" });

export default mongoose.model("MenuItem", menuItemSchema);
