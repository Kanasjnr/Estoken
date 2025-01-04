const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: { type: String, required: true },
  tokenId: { type: Number, required: true },
  amount: { type: Number, required: true },
  pricePerToken: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Listing', listingSchema);