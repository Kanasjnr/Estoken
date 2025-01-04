const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const propertyRoutes = require('./src/routes/propertyRoutes');
const userRoutes = require('./src/routes/userRoutes');
const marketplaceRoutes = require('./src/routes/marketplaceRoutes');
const rentalRoutes = require('./src/routes/rentalRoutes');

const errorHandler = require('./src/utils/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/rental', rentalRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));