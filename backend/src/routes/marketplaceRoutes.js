const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');

router.post('/listings', marketplaceController.createListing);
router.get('/listings', marketplaceController.getListings);
router.post('/buy', marketplaceController.buyTokens);

module.exports = router;