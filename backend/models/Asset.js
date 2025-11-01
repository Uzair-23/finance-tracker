const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['real_estate', 'vehicle', 'investment', 'savings', 'other']
  },
  value: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  description: String,
  appreciation: {
    type: Number,
    default: 0  // Annual appreciation rate in percentage
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Asset', AssetSchema)