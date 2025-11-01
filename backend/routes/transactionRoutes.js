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

// Financial Risk Evaluation endpoint
router.get('/evaluate-risk', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get transactions from the last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const txs = await Transaction.find({
      user: userId,
      date: { $gte: lastMonth }
    });

    // Calculate monthly income and expenses
    const monthlyIncome = txs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = txs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate monthly savings
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsPercentage = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    // Determine risk level
    let riskLevel;
    let message;
    let suggestions = [];

    if (monthlyExpenses > monthlyIncome) {
      riskLevel = 'high';
      message = '⚠️ High Risk: Your expenses exceed your income';
      suggestions = [
        'Immediately review and cut non-essential expenses',
        'Look for additional income sources',
        'Create a strict budget plan'
      ];
    } else if (savingsPercentage < 20) {
      riskLevel = 'medium';
      message = '⚡ Medium Risk: Your savings rate is below recommended 20%';
      suggestions = [
        'Try to increase your savings to at least 20% of income',
        'Review your monthly subscriptions and recurring expenses',
        'Consider creating a budget'
      ];
    } else {
      riskLevel = 'safe';
      message = '✅ Safe: Your finances are well balanced';
      suggestions = [
        'Consider investing your savings',
        'Keep maintaining your good financial habits',
        'Plan for long-term financial goals'
      ];
    }

    res.json({
      riskLevel,
      message,
      suggestions,
      stats: {
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        savingsPercentage: Math.round(savingsPercentage)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;