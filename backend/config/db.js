import mongoose from "mongoose";

export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    // Give stderr time to flush before killing the process
    await new Promise((resolve) => setTimeout(resolve, 500));
    process.exit(1);
  }
}
