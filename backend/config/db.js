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
    // Do not exit the process; allow server to start for health checks and static routes
    // Features depending on DB will naturally return errors until DB is available
    return null;
  }
};

module.exports = connectDB;