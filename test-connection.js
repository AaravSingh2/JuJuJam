// test-connection.js
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Atlas connected successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

connectDB();