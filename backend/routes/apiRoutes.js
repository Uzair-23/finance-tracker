const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Proxy Finnhub market data
router.get('/market/quote', protect, async (req, res) => {
  try {
    const { symbol } = req.query;
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${process.env.FINNHUB_API_KEY}`;
    const r = await axios.get(url);
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ message: 'Finnhub error', error: err.message });
  }
});

// Exchange rates using Finnhub
router.get('/market/rates', protect, async (req, res) => {
  try {
    const url = `https://finnhub.io/api/v1/forex/rates?base=USD&token=${process.env.FINNHUB_API_KEY}`;
    const r = await axios.get(url);
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ message: 'Rates error', error: err.message });
  }
});

// NewsData.io proxy
router.get('/news', protect, async (req, res) => {
  try {
    const q = req.query.q || 'finance';
    const url = `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}&q=${encodeURIComponent(q)}&language=en`;
    const r = await axios.get(url);
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ message: 'News error', error: err.message });
  }
});

// API Ninjas advice
router.get('/advice', protect, async (req, res) => {
  try {
    const q = req.query.q || 'personal finance';
    const url = `https://api.api-ninjas.com/v1/quotes?category=money`;
    const r = await axios.get(url, { headers: { 'X-Api-Key': process.env.API_NINJAS_KEY } });
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ message: 'Advice error', error: err.message });
  }
});

module.exports = router;