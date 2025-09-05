const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Authentication Controller
 * Handles user registration, login, and profile operations
 */

/**
 * Register a new user
 * POST /api/auth/register
 * @param {Object} req.body - { username, email, password }
 */
const register = asyncHandler(async (req, res) => {
  console.log('🔐 Registration attempt:', { username: req.body.username, email: req.body.email });
  const { username, email, password } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username, email, and password'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    return res.status(400).json({
      success: false,
      message: `User with this ${field} already exists`
    });
  }

  // Create new user (password will be hashed automatically by the User model)
  const user = await User.create({
    username,
    email,
    password
  });

  // Generate JWT token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    }
  });
});

/**
 * Login user
 * POST /api/auth/login
 * @param {Object} req.body - { email, password }
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  // Find user by email (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated'
    });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate JWT token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        lastLogin: user.lastLogin
      },
      token
    }
  });
});

/**
 * Get current user profile
 * GET /api/auth/profile
 * Requires authentication
 */
const getProfile = asyncHandler(async (req, res) => {
  // User information is already available from auth middleware
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    }
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 * Requires authentication
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user._id;

  // Prepare update object with provided fields only
  const updateData = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;

  // Check if no update data provided
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username or email to update'
    });
  }

  // Check for duplicate username/email (excluding current user)
  if (username || email) {
    const query = {
      _id: { $ne: userId },
      $or: []
    };
    
    if (username) query.$or.push({ username });
    if (email) query.$or.push({ email });
    
    const existingUser = await User.findOne(query);
    
    if (existingUser) {
      const field = existingUser.username === username ? 'username' : 'email';
      return res.status(400).json({
        success: false,
        message: `This ${field} is already taken`
      });
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt
      }
    }
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};