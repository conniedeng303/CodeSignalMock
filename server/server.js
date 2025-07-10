require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);

const uri = process.env.MONGO_URI;
const port = process.env.PORT || 5000;

mongoose.connect(uri)
  .then(() => console.log('Testing - Connected to MongoDB'))
  .catch(err => console.error('Testing - MongoDB connection failed:', err));

app.listen(port, () => {
  console.log(`Testing - Server running on port ${port}`);
});
