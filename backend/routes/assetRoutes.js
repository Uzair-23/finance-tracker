const express = require('express');
const Asset = require('../models/Asset');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create asset
router.post('/', protect, async (req, res) => {
  try {
    const asset = await Asset.create({
      ...req.body,
      user: req.user._id
    });
    res.json(asset);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all assets
router.get('/', protect, async (req, res) => {
  try {
    const assets = await Asset.find({ user: req.user._id });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update asset
router.put('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete asset
router.delete('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get financial health analysis
router.get('/analysis', protect, async (req, res) => {
  try {
    const assets = await Asset.find({ user: req.user._id });
    const transactions = await Transaction.find({ 
      user: req.user._id,
      date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
    });

    // Calculate total assets value
    const totalAssetsValue = assets.reduce((sum, asset) => sum + asset.value, 0);

    // Calculate income and expenses
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate monthly averages (over 3 months)
    const monthlyIncome = income / 3;
    const monthlyExpenses = expenses / 3;

    // Financial health indicators
    const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome * 100;
    const debtToAssetRatio = expenses / totalAssetsValue; // Simplified version
    
    // Risk evaluation
    const riskFactors = [];
    const riskLevel = {
      score: 0,
      label: 'low',
      suggestions: []
    };

    // Check savings rate
    if (savingsRate < 20) {
      riskFactors.push('Low savings rate');
      riskLevel.score += 2;
      riskLevel.suggestions.push('Try to save at least 20% of your monthly income');
    }

    // Check expense to income ratio
    if (monthlyExpenses / monthlyIncome > 0.7) {
      riskFactors.push('High expense to income ratio');
      riskLevel.score += 2;
      riskLevel.suggestions.push('Your expenses are too high relative to income');
    }

    // Check asset diversification
    const assetTypes = new Set(assets.map(a => a.type));
    if (assetTypes.size < 3) {
      riskFactors.push('Low asset diversification');
      riskLevel.score += 1;
      riskLevel.suggestions.push('Consider diversifying your assets');
    }

    // Set risk level label based on score
    if (riskLevel.score >= 4) riskLevel.label = 'high';
    else if (riskLevel.score >= 2) riskLevel.label = 'medium';

    res.json({
      summary: {
        totalAssetsValue,
        monthlyIncome,
        monthlyExpenses,
        savingsRate
      },
      metrics: {
        debtToAssetRatio,
        expenseToIncomeRatio: monthlyExpenses / monthlyIncome
      },
      risk: {
        level: riskLevel.label,
        factors: riskFactors,
        suggestions: riskLevel.suggestions
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;