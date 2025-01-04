const Web3 = require('web3');
const PropertyTokenABI = require('../abis/PropertyToken.json');
const MarketplaceABI = require('../abis/Marketplace.json');
const RentalIncomeDispenserABI = require('../abis/RentalIncomeDispenser.json');
const UserRegistryABI = require('../abis/UserRegistry.json');

const web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL);

const propertyTokenContract = new web3.eth.Contract(PropertyTokenABI, process.env.PROPERTY_TOKEN_ADDRESS);
const marketplaceContract = new web3.eth.Contract(MarketplaceABI, process.env.MARKETPLACE_ADDRESS);
const rentalIncomeDispenserContract = new web3.eth.Contract(RentalIncomeDispenserABI, process.env.RENTAL_INCOME_DISPENSER_ADDRESS);
const userRegistryContract = new web3.eth.Contract(UserRegistryABI, process.env.USER_REGISTRY_ADDRESS);

exports.mintPropertyTokens = async (ownerAddress, totalTokens) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const result = await propertyTokenContract.methods.mint(ownerAddress, totalTokens, '0x').send({ from: accounts[0] });
    return result.events.TokenMinted.returnValues.tokenId;
  } catch (error) {
    console.error('Error minting tokens:', error);
    throw error;
  }
};

exports.createListing = async (seller, tokenId, amount, pricePerToken) => {
  try {
    const accounts = await web3.eth.getAccounts();
    await marketplaceContract.methods.createListing(tokenId, amount, pricePerToken).send({ from: seller });
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

exports.buyTokens = async (buyer, listingId, amount) => {
  try {
    const listing = await marketplaceContract.methods.listings(listingId).call();
    const totalCost = web3.utils.toBN(listing.pricePerToken).mul(web3.utils.toBN(amount));
    await marketplaceContract.methods.buyTokens(listingId, amount).send({ from: buyer, value: totalCost });
  } catch (error) {
    console.error('Error buying tokens:', error);
    throw error;
  }
};

exports.distributeRentalIncome = async (tokenId, amount) => {
  try {
    const accounts = await web3.eth.getAccounts();
    await rentalIncomeDispenserContract.methods.distributeRentalIncome(tokenId).send({ from: accounts[0], value: amount });
  } catch (error) {
    console.error('Error distributing rental income:', error);
    throw error;
  }
};

exports.claimRentalIncome = async (userAddress, tokenId) => {
  try {
    await rentalIncomeDispenserContract.methods.claimIncome(tokenId).send({ from: userAddress });
    const claimedAmount = await rentalIncomeDispenserContract.methods.getUnclaimedIncome(tokenId, userAddress).call();
    return claimedAmount;
  } catch (error) {
    console.error('Error claiming rental income:', error);
    throw error;
  }
};

exports.getUnclaimedIncome = async (tokenId, userAddress) => {
  try {
    const unclaimedAmount = await rentalIncomeDispenserContract.methods.getUnclaimedIncome(tokenId, userAddress).call();
    return unclaimedAmount;
  } catch (error) {
    console.error('Error getting unclaimed income:', error);
    throw error;
  }
};

exports.registerUser = async (address) => {
  try {
    await userRegistryContract.methods.registerUser().send({ from: address });
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

exports.approveKYC = async (address, kycHash) => {
  try {
    const accounts = await web3.eth.getAccounts();
    await userRegistryContract.methods.approveKYC(address, kycHash).send({ from: accounts[0] });
  } catch (error) {
    console.error('Error approving KYC:', error);
    throw error;
  }
};


