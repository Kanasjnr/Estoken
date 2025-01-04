const Property = require('../models/propertyModel');
const blockchainService = require('../services/blockchainService');

exports.createProperty = async (req, res, next) => {
  try {
    const { name, description, location, totalTokens, pricePerToken, imageUrl, ownerAddress } = req.body;
    
    const tokenId = await blockchainService.mintPropertyTokens(ownerAddress, totalTokens);
    
    const newProperty = new Property({
      tokenId,
      name,
      description,
      location,
      totalTokens,
      pricePerToken,
      imageUrl,
      ownerAddress
    });

    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    next(error);
  }
};

exports.getProperties = async (req, res, next) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    next(error);
  }
};

exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findOne({ tokenId: req.params.tokenId });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    next(error);
  }
};