const User = require('../models/userModel');
const blockchainService = require('../services/blockchainService');

exports.registerUser = async (req, res, next) => {
  try {
    const { address } = req.body;
    
    let user = await User.findOne({ address });
    if (user) {
      return res.status(400).json({ message: 'User already registered' });
    }

    await blockchainService.registerUser(address);

    user = new User({ address, isRegistered: true });
    await user.save();

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.approveKYC = async (req, res, next) => {
  try {
    const { address, kycHash } = req.body;
    
    const user = await User.findOne({ address });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await blockchainService.approveKYC(address, kycHash);

    user.isKYCApproved = true;
    user.kycHash = kycHash;
    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ address: req.params.address });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};