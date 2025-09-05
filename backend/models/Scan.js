const mongoose = require('mongoose');

/**
 * Scan Schema for VeriScope application
 * Stores AI-powered phishing/malware scan results from VirusTotal and Hugging Face
 */
const scanSchema = new mongoose.Schema({
  // URL being scanned (optional - can be text-only scan)
  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // URL is optional
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL (must start with http:// or https://)'
    }
  },
  
  // Text content being analyzed for phishing
  text: {
    type: String,
    trim: true,
    maxlength: [10000, 'Text content cannot exceed 10,000 characters']
  },
  
  // URL scan results from VirusTotal
  urlScan: {
    status: {
      type: String,
      enum: ['clean', 'suspicious', 'malicious', 'unknown', 'processing', 'error'],
      default: 'unknown'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    message: String,
    details: mongoose.Schema.Types.Mixed,
    scannedAt: {
      type: Date,
      default: Date.now
    },
    fallback: {
      type: Boolean,
      default: false
    }
  },
  
  // Text scan results from Hugging Face
  textScan: {
    label: {
      type: String,
      enum: ['safe', 'suspicious', 'phishing', 'unknown'],
      default: 'unknown'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    message: String,
    details: mongoose.Schema.Types.Mixed,
    scannedAt: {
      type: Date,
      default: Date.now
    },
    fallback: {
      type: Boolean,
      default: false
    }
  },
  
  // Overall scan results (combination of URL + text scans)
  overallResult: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    recommendation: String
  },
  
  // User who initiated the scan
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitted by user is required']
  },
  
  // Scan processing status
  scanStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: {
    type: Date
  },
  
  // Error information if scan failed
  errorMessage: String,
  
  // Metadata for tracking API usage
  apiUsage: {
    virusTotal: {
      used: Boolean,
      quotaExceeded: Boolean
    },
    huggingFace: {
      used: Boolean,
      rateLimited: Boolean
    }
  }
});

/**
 * Indexes for efficient querying
 */
scanSchema.index({ submittedBy: 1, createdAt: -1 });
scanSchema.index({ scanStatus: 1 });
scanSchema.index({ 'overallResult.riskLevel': 1 });
scanSchema.index({ url: 1 }, { sparse: true });

/**
 * Instance method to mark scan as completed
 * @param {Object} urlResults - URL scan results
 * @param {Object} textResults - Text scan results  
 */
scanSchema.methods.markAsCompleted = function(urlResults, textResults) {
  this.scanStatus = 'completed';
  this.completedAt = new Date();
  
  if (urlResults) {
    this.urlScan = { ...urlResults, scannedAt: new Date() };
  }
  
  if (textResults) {
    this.textScan = { ...textResults, scannedAt: new Date() };
  }
  
  // Calculate overall result
  this.overallResult = this.calculateOverallResult();
  
  return this.save();
};

/**
 * Instance method to mark scan as failed
 * @param {string} errorMessage - Error description
 */
scanSchema.methods.markAsFailed = function(errorMessage) {
  this.scanStatus = 'failed';
  this.completedAt = new Date();
  this.errorMessage = errorMessage;
  return this.save();
};

/**
 * Calculate overall risk assessment from individual scan results
 * @returns {Object} Overall result object
 */
scanSchema.methods.calculateOverallResult = function() {
  const urlRisk = this.urlScan?.status;
  const textRisk = this.textScan?.label;
  const urlConfidence = this.urlScan?.confidence || 0;
  const textConfidence = this.textScan?.confidence || 0;
  
  let overallRisk = 'low';
  let overallConfidence = 0;
  let recommendation = '';
  
  // Determine highest risk level
  if (urlRisk === 'malicious' || textRisk === 'phishing') {
    overallRisk = 'high';
    recommendation = 'High risk detected. Avoid this content and do not click any links.';
  } else if (urlRisk === 'suspicious' || textRisk === 'suspicious' || 
             (urlRisk === 'malicious' && urlConfidence < 70) ||
             (textRisk === 'phishing' && textConfidence < 70)) {
    overallRisk = 'medium';
    recommendation = 'Suspicious content detected. Exercise caution and verify through other sources.';
  } else if (urlRisk === 'clean' && textRisk === 'safe') {
    overallRisk = 'low';
    recommendation = 'Content appears safe based on current analysis.';
  } else {
    overallRisk = 'low';
    recommendation = 'Unable to determine risk level conclusively. Use general caution.';
  }
  
  // Calculate weighted confidence
  if (urlConfidence > 0 && textConfidence > 0) {
    overallConfidence = Math.round((urlConfidence + textConfidence) / 2);
  } else if (urlConfidence > 0) {
    overallConfidence = urlConfidence;
  } else if (textConfidence > 0) {
    overallConfidence = textConfidence;
  } else {
    overallConfidence = 50; // Default moderate confidence
  }
  
  return {
    riskLevel: overallRisk,
    confidence: overallConfidence,
    recommendation
  };
};

/**
 * Static method to find scans by user with pagination
 * @param {string} userId - User's ObjectId
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Results per page (default: 10)
 * @returns {Object} Paginated results
 */
scanSchema.statics.findByUserPaginated = async function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const [scans, total] = await Promise.all([
    this.find({ submittedBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments({ submittedBy: userId })
  ]);
  
  return {
    scans,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Static method to get scan statistics for a user
 * @param {string} userId - User's ObjectId
 * @returns {Object} Scan statistics
 */
scanSchema.statics.getStatsByUser = async function(userId) {
  const stats = await this.aggregate([
    { $match: { submittedBy: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$scanStatus', 'completed'] }, 1, 0] }
        },
        highRisk: {
          $sum: { $cond: [{ $eq: ['$overallResult.riskLevel', 'high'] }, 1, 0] }
        },
        mediumRisk: {
          $sum: { $cond: [{ $eq: ['$overallResult.riskLevel', 'medium'] }, 1, 0] }
        },
        lowRisk: {
          $sum: { $cond: [{ $eq: ['$overallResult.riskLevel', 'low'] }, 1, 0] }
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      total: 0,
      completed: 0,
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0
    };
  }
  
  return stats[0];
};

// Create and export the Scan model
module.exports = mongoose.model('Scan', scanSchema);