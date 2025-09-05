const jwt = require('jsonwebtoken');

/**
 * JWT utility functions for token generation and verification
 */

/**
 * Generate a JWT token for user authentication
 * @param {string} userId - User's unique identifier
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // Payload: user identifier
    process.env.JWT_SECRET, // Secret key from environment
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d' // Token expiration time
    }
  );
};

/**
 * Verify JWT token and extract user information
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken
};