const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  isRegistered: { type: Boolean, default: false },
  isKYCApproved: { type: Boolean, default: false },
  kycHash: { type: String },
  email: { type: String, unique: true, sparse: true },
  name: { type: String },
});

module.exports = mongoose.model('User', userSchema);