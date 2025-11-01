const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['income','expense'], required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String },
  currency: { type: String, enum: ['USD','EUR','GBP','INR'], default: 'USD' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);