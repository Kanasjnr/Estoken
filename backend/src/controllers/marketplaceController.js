const Listing = require('../models/listingModel');
const blockchainService = require('../services/blockchainService');

exports.createListing = async (req, res, next) => {
  try {
    const { tokenId, amount, pricePerToken } = req.body;
    const seller = req.user.address; // Assuming authentication middleware sets req.user

    await blockchainService.createListing(seller, tokenId, amount, pricePerToken);

    const newListing = new Listing({
      seller,
      tokenId,
      amount,
      pricePerToken
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    next(error);
  }
};

exports.getListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ isActive: true });
    res.json(listings);
  } catch (error) {
    next(error);
  }
};

exports.buyTokens = async (req, res, next) => {
  try {
    const { listingId, amount } = req.body;
    const buyer = req.user.address; // Assuming authentication middleware sets req.user

    const listing = await Listing.findById(listingId);
    if (!listing || !listing.isActive) {
      return res.status(404).json({ message: 'Listing not found or inactive' });
    }

    await blockchainService.buyTokens(buyer, listingId, amount);

    listing.amount -= amount;
    if (listing.amount === 0) {
      listing.isActive = false;
    }
    await listing.save();

    res.json({ message: 'Purchase successful', listing });
  } catch (error) {
    next(error);
  }
};