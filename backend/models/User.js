import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String },
    dietPreference: {
      type: String,
      enum: ["veg", "non-veg", "vegan", "both"],
      default: "both",
    },
    healthGoal: {
      type: String,
      enum: [
        "none",
        "weight-loss",
        "muscle-gain",
        "diabetic-friendly",
        "high-protein",
        "low-calorie",
      ],
      default: "none",
    },
    allergies: [{ type: String }],
    isAdmin: { type: Boolean, default: false },
    favoriteDishIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
    recentlyViewedIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
    loyaltyPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
