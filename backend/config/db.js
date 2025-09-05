const mongoose = require('mongoose');

/**
 * Database connection configuration
 * Connects to MongoDB using Mongoose ODM
 */
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    // Exit the process if database connection fails
    process.exit(1);
  }
};

module.exports = connectDB;