const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');

router.post('/distribute', rentalController.distributeRentalIncome);
router.post('/claim', rentalController.claimRentalIncome);
router.get('/unclaimed/:tokenId', rentalController.getUnclaimedIncome);

module.exports = router;