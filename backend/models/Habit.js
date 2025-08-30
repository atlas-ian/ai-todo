import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // every habit must have a title
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "daily",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);
