const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Finnhub API Key
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

// Get stock quote from Finnhub
router.get('/market/quote', protect, async (req, res) => {
  try {
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`;
    const r = await axios.get(url);
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ message: 'Finnhub error', error: err.message });
  }
});

// Get best performing stocks (by gainers)
router.get('/market/gainers', protect, async (req, res) => {
  try {
    // Get US stock market gainers
    const url = `https://finnhub.io/api/v1/stock/screener?exchange=US&token=${FINNHUB_KEY}`;
    const r = await axios.get(url);
    // Sort by change percent and get top 10
    const stocks = r.data?.results || [];
    const gainers = stocks
      .filter(s => s.change && s.change > 0)
      .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
      .slice(0, 10);
    res.json(gainers);
  } catch (err) {
    res.status(500).json({ message: 'Gainers error', error: err.message });
  }
});

// Get popular stocks (most traded)
router.get('/market/popular', protect, async (req, res) => {
  try {
    // Get popular stocks - using recommendation trends
    const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'JNJ'];
    const promises = popularSymbols.map(async (symbol) => {
      try {
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`;
        const quoteRes = await axios.get(quoteUrl);
        const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`;
        const profileRes = await axios.get(profileUrl);
        return {
          symbol,
          ...quoteRes.data,
          name: profileRes.data?.name || symbol,
          logo: profileRes.data?.logo || null
        };
      } catch (err) {
        return { symbol, error: err.message };
      }
    });
    const results = await Promise.all(promises);
    res.json(results.filter(r => !r.error));
  } catch (err) {
    res.status(500).json({ message: 'Popular stocks error', error: err.message });
  }
});

// Get market trends (general market overview)
router.get('/market/trends', protect, async (req, res) => {
  try {
    // Get major indices
    const indices = [
      { symbol: '^GSPC', name: 'S&P 500' },
      { symbol: '^DJI', name: 'Dow Jones' },
      { symbol: '^IXIC', name: 'NASDAQ' },
      { symbol: '^NSEI', name: 'NSE Nifty' },
      { symbol: '^BSESN', name: 'BSE Sensex' }
    ];
    const promises = indices.map(async (index) => {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${index.symbol}&token=${FINNHUB_KEY}`;
        const r = await axios.get(url);
        return {
          ...index,
          ...r.data
        };
      } catch (err) {
        return { ...index, error: err.message };
      }
    });
    const results = await Promise.all(promises);
    res.json(results.filter(r => !r.error));
  } catch (err) {
    res.status(500).json({ message: 'Market trends error', error: err.message });
  }
});

// Exchange rates using Finnhub
router.get('/market/rates', protect, async (req, res) => {
  try {
    const url = `https://finnhub.io/api/v1/forex/rates?base=USD&token=${FINNHUB_KEY}`;
    const r = await axios.get(url);
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ message: 'Rates error', error: err.message });
  }
});

// NewsData.io - Finance related news only
router.get('/news', protect, async (req, res) => {
  try {
    const category = req.query.category || 'finance';
    const apiKey = process.env.NEWSDATA_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'NewsData API key not configured' });
    }
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&category=business&language=en&q=${encodeURIComponent(category)}`;
    const r = await axios.get(url);
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ message: 'News error', error: err.message });
  }
});

// API Ninjas - Financial tips and advice
router.get('/advice', protect, async (req, res) => {
  try {
    const apiKey = process.env.API_NINJAS_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'API Ninjas key not configured' });
    }
    // Get financial tips/quotes
    const url = `https://api.api-ninjas.com/v1/quotes?category=money`;
    const r = await axios.get(url, { 
      headers: { 'X-Api-Key': apiKey },
      params: { limit: 10 }
    });
    res.json(r.data || []);
  } catch (err) {
    res.status(500).json({ message: 'Advice error', error: err.message });
  }
});

module.exports = router;