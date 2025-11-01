const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Create sample user + transactions (dev only)
router.get('/', async (req, res) => {
  try {
    const existing = await User.findOne({ email: 'demo@demo.com' });
    if (existing) return res.json({ message: 'Seed already exists' });
    const hashed = await bcrypt.hash('password', 10);
    const user = await User.create({ 
      name: 'Demo User', 
      email: 'demo@demo.com', 
      password: hashed, 
      preferredCurrency: 'USD', 
      monthlyBudget: 2000 
    });
    const sample = [
      { user: user._id, title: 'Salary', amount: 4000, category: 'Salary', type: 'income', date: new Date() },
      { user: user._id, title: 'Groceries', amount: 250, category: 'Food', type: 'expense', date: new Date() },
      { user: user._id, title: 'Rent', amount: 1200, category: 'Housing', type: 'expense', date: new Date() },
      { user: user._id, title: 'Coffee', amount: 5, category: 'Food', type: 'expense', date: new Date() }
    ];
    await Transaction.insertMany(sample);
    res.json({ message: 'Seed created', user: { email: user.email, password: 'password' } });
  } catch (err) { 
    res.status(500).json({ message: err.message }) 
  }
});

module.exports = router;