const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create transaction
router.post('/', protect, async (req, res) => {
  try {
    const data = { ...req.body, user: req.user._id };
    const tx = await Transaction.create(data);
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get transactions with optional filters
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const filter = { user: req.user._id };
    if (category) filter.category = category;
    if (startDate || endDate) filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
    const txs = await Transaction.find(filter).sort({ date: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update
router.put('/:id', protect, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!tx) return res.status(404).json({ message: 'Not found' });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    if (!tx) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Summary endpoint: totals + top categories
router.get('/summary/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const txs = await Transaction.find({ user: userId });
    const totalIncome = txs
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = txs
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const categories = {};
    txs.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    const topCategories = Object.entries(categories)
      .sort((a,b) => b[1]-a[1])
      .slice(0,3)
      .map(([k,v]) => ({category:k, amount:v}));
    res.json({ totalIncome, totalExpense, balance: totalIncome - totalExpense, topCategories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;