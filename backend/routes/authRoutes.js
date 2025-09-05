const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * Authentication Routes
 * All routes related to user authentication and profile management
 */
const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { username, email, password }
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user's profile
 * @access  Private (requires authentication)
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user's profile
 * @access  Private (requires authentication)
 * @body    { username?, email? }
 */
router.put('/profile', authenticate, updateProfile);

module.exports = router;