import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// Create transaction
router.post("/", async (req, res) => {
  try {
    const { amount, type, category, date, note } = req.body;
    const transaction = new Transaction({ amount, type, category, date, note, userId: req.user.id });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get transactions
router.get("/", async (req, res) => {
  try {
    const { category, type, from, to, search } = req.query;
    let filter = { userId: req.user.id };
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (search) {
      filter.$or = [
        { note: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }
    const transactions = await Transaction.find(filter);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update transaction
router.patch("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction || transaction.userId.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden." });
    Object.assign(transaction, req.body);
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete transaction
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction || transaction.userId.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden." });
    await transaction.remove();
    res.json({ message: "Transaction deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
