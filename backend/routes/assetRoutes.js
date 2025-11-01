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
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100) : 0;
    
    // Risk evaluation
    const riskFactors = [];
    const suggestions = [];
    let riskScore = 0;

    // Check savings rate
    if (savingsRate < 10) {
      riskFactors.push('Critical: Very low savings rate (below 10%)');
      suggestions.push('Aim to save at least 10% of your monthly income');
      riskScore += 3;
    } else if (savingsRate < 20) {
      riskFactors.push('Warning: Low savings rate (below 20%)');
      suggestions.push('Try to increase your savings rate to 20% for better financial security');
      riskScore += 2;
    }

    // Check expense to income ratio
    const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome * 100) : 100;
    if (expenseRatio > 90) {
      riskFactors.push('Critical: Expenses consuming over 90% of income');
      suggestions.push('Review and reduce non-essential expenses');
      riskScore += 3;
    } else if (expenseRatio > 70) {
      riskFactors.push('Warning: High expense to income ratio');
      suggestions.push('Consider creating a budget to reduce expenses');
      riskScore += 2;
    }

    // Check asset diversification
    const assetTypes = new Set(assets.map(a => a.type));
    if (assetTypes.size < 2 && totalAssetsValue > 0) {
      riskFactors.push('Warning: Limited asset diversification');
      suggestions.push('Consider diversifying your assets across different types');
      riskScore += 1;
    }

    // Emergency fund check
    const liquidAssets = assets
      .filter(a => a.type === 'cash' || a.type === 'savings')
      .reduce((sum, a) => sum + a.value, 0);
    const monthlyExpensesCovered = monthlyExpenses > 0 ? (liquidAssets / monthlyExpenses) : 0;
    
    if (monthlyExpensesCovered < 3) {
      riskFactors.push('Warning: Low emergency fund');
      suggestions.push('Build an emergency fund to cover at least 3-6 months of expenses');
      riskScore += 2;
    }

    // Add investment advice if applicable
    if (totalAssetsValue > 0 && assetTypes.size === 1 && assets.every(a => a.type === 'savings')) {
      suggestions.push('Consider investing some savings in diversified assets for potential better returns');
    }

    // Add income stability check
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const hasRegularIncome = incomeTransactions.length >= 3;
    if (!hasRegularIncome) {
      riskFactors.push('Warning: Irregular income pattern');
      suggestions.push('Consider building a larger emergency fund due to income variability');
      riskScore += 1;
    }

    // Determine overall risk level
    let riskLevel = 'low';
    if (riskScore >= 6) {
      riskLevel = 'high';
    } else if (riskScore >= 3) {
      riskLevel = 'medium';
    }

    res.json({
      summary: {
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
        totalAssetsValue,
        liquidAssets,
        monthlyExpensesCovered,
        expenseRatio
      },
      risk: {
        level: riskLevel,
        factors: riskFactors,
        suggestions
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;