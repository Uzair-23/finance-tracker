const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  preferredCurrency: { type: String, enum: ['USD','EUR','GBP','INR'], default: 'USD' },
  monthlyBudget: { type: Number, default: 0 },
  savingGoal: { type: Number, default: 0 },
  savingGoalType: { type: String, enum: ['monthly', 'yearly', 'custom'], default: 'monthly' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);