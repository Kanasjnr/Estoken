const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/approve-kyc', userController.approveKYC);
router.get('/:address', userController.getUserProfile);

module.exports = router;