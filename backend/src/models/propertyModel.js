const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  tokenId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  totalTokens: { type: Number, required: true },
  pricePerToken: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  ownerAddress: { type: String, required: true },
  rentalIncome: { type: Number, default: 0 },
  lastRentalDistribution: { type: Date },
});

module.exports = mongoose.model('Property', propertySchema);