import Habit from "../models/Habit.js";

// ✅ Get all habits
export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find();
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Add a new habit
export const createHabit = async (req, res) => {
  try {
    const { name, frequency } = req.body;

    const newHabit = new Habit({ name, frequency });
    await newHabit.save();

    res.status(201).json(newHabit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Update a habit (mark as completed, change frequency, etc.)
export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(habit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete a habit
export const deleteHabit = async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: "Habit deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
