const mongoose = require('mongoose');

/**
 * Content Schema for VeriScope application
 * Stores content verification data and results
 */
const contentSchema = new mongoose.Schema({
  // URL of the content being verified (optional, can be text-only verification)
  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // If URL is provided, validate it's a proper URL format
        if (!v) return true; // URL is optional
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL (must start with http:// or https://)'
    }
  },
  
  // Text content to be verified
  text: {
    type: String,
    required: [true, 'Text content is required for verification'],
    trim: true,
    maxlength: [10000, 'Text content cannot exceed 10,000 characters']
  },
  
  // Trust score calculated by AI verification (0-100 scale)
  trustScore: {
    type: Number,
    default: 0,
    min: [0, 'Trust score cannot be negative'],
    max: [100, 'Trust score cannot exceed 100']
  },
  
  // Flag indicating if content has been processed by AI
  verifiedByAI: {
    type: Boolean,
    default: false
  },
  
  // Reference to the user who submitted this content for verification
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitted by user is required']
  },
  
  // Timestamp when content was submitted
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Additional metadata for tracking verification process
  verificationStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Store any AI analysis results or notes
  aiAnalysis: {
    type: String,
    maxlength: [2000, 'AI analysis cannot exceed 2,000 characters']
  },
  
  // Track when verification was completed
  verifiedAt: {
    type: Date
  }
});

/**
 * Index for efficient querying
 * - Compound index for user's content queries
 * - Index on createdAt for chronological sorting
 */
contentSchema.index({ submittedBy: 1, createdAt: -1 });
contentSchema.index({ verificationStatus: 1 });
contentSchema.index({ trustScore: -1 });

/**
 * Instance method to mark content as verified
 * @param {number} score - Trust score from AI analysis
 * @param {string} analysis - AI analysis results
 */
contentSchema.methods.markAsVerified = function(score, analysis = '') {
  this.trustScore = score;
  this.verifiedByAI = true;
  this.verificationStatus = 'completed';
  this.verifiedAt = new Date();
  this.aiAnalysis = analysis;
  return this.save();
};

/**
 * Static method to find content by user
 * @param {string} userId - User's ObjectId
 * @returns {Array} Array of content documents
 */
contentSchema.statics.findByUser = function(userId) {
  return this.find({ submittedBy: userId }).sort({ createdAt: -1 });
};

// Create and export the Content model
module.exports = mongoose.model('Content', contentSchema);