const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for VeriScope application
 * Stores user authentication and profile information
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  // Track user activity and account status
  isActive: {
    type: Boolean,
    default: true
  },
  // Track when user joined
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Track last login for security purposes
  lastLogin: {
    type: Date
  }
});

/**
 * Pre-save middleware to hash password before storing
 * Only hash the password if it has been modified (or is new)
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare entered password with hashed password
 * @param {string} enteredPassword - Plain text password from user
 * @returns {boolean} True if password matches
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Remove password from JSON output for security
 * This prevents password from being sent in API responses
 */
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Create and export the User model
module.exports = mongoose.model('User', userSchema);