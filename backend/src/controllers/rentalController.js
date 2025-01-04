const Property = require('../models/propertyModel');
const blockchainService = require('../services/blockchainService');

exports.distributeRentalIncome = async (req, res, next) => {
  try {
    const { tokenId, amount } = req.body;

    const property = await Property.findOne({ tokenId });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await blockchainService.distributeRentalIncome(tokenId, amount);

    property.rentalIncome += amount;
    property.lastRentalDistribution = new Date();
    await property.save();

    res.json({ message: 'Rental income distributed successfully', property });
  } catch (error) {
    next(error);
  }
};

exports.claimRentalIncome = async (req, res, next) => {
  try {
    const { tokenId } = req.body;
    const userAddress = req.user.address; // Assuming authentication middleware sets req.user

    const claimedAmount = await blockchainService.claimRentalIncome(userAddress, tokenId);

    res.json({ message: 'Rental income claimed successfully', claimedAmount });
  } catch (error) {
    next(error);
  }
};

exports.getUnclaimedIncome = async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const userAddress = req.user.address; // Assuming authentication middleware sets req.user

    const unclaimedAmount = await blockchainService.getUnclaimedIncome(tokenId, userAddress);

    res.json({ unclaimedAmount });
  } catch (error) {
    next(error);
  }
};