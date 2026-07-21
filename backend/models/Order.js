import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    totalNutrition: {
      calories: Number,
      protein_g: Number,
      carbs_g: Number,
      fat_g: Number,
    },
    status: {
      type: String,
      enum: ["placed", "preparing", "out-for-delivery", "delivered", "cancelled"],
      default: "placed",
    },
    couponCode: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
