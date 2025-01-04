const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.post('/', propertyController.createProperty);
router.get('/', propertyController.getProperties);
router.get('/:tokenId', propertyController.getPropertyById);

module.exports = router;