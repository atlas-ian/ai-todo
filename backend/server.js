// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import habitRoutes from "./routes/habitRoutes.js";

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // allows JSON request bodies




// ✅ Routes
app.use("/api/habits", habitRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Habit Tracker Backend is running!");
});
