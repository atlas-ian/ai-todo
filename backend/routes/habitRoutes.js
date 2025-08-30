import express from "express";
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
} from "../controllers/habitController.js";

const router = express.Router();

// Routes
router.get("/", getHabits);          // GET /api/habits
router.post("/", createHabit);       // POST /api/habits
router.put("/:id", updateHabit);     // PUT /api/habits/:id
router.delete("/:id", deleteHabit);  // DELETE /api/habits/:id

export default router;
