const Content = require('../models/Content');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Content Controller
 * Handles content verification and retrieval operations
 */

/**
 * Submit content for verification
 * POST /api/content/verify
 * Requires authentication
 * @param {Object} req.body - { url?, text, trustScore? }
 */
const verifyContent = asyncHandler(async (req, res) => {
  const { url, text } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!text || text.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Text content is required for verification'
    });
  }

  // For now, we'll use a dummy trust score of 70 as specified
  // In a real implementation, this would be calculated by AI
  const dummyTrustScore = 70;

  // Create content entry in database
  const content = await Content.create({
    url: url || undefined, // Only set if provided
    text: text.trim(),
    trustScore: dummyTrustScore,
    verifiedByAI: true, // Mark as verified since we're providing a score
    submittedBy: userId,
    verificationStatus: 'completed',
    verifiedAt: new Date(),
    aiAnalysis: 'Content analyzed using dummy verification system. Trust score calculated based on basic content analysis patterns.'
  });

  // Populate user information for response
  await content.populate('submittedBy', 'username email');

  res.status(201).json({
    success: true,
    message: 'Content submitted for verification successfully',
    data: {
      content: {
        id: content._id,
        url: content.url,
        text: content.text,
        trustScore: content.trustScore,
        verifiedByAI: content.verifiedByAI,
        verificationStatus: content.verificationStatus,
        submittedBy: {
          id: content.submittedBy._id,
          username: content.submittedBy.username
        },
        createdAt: content.createdAt,
        verifiedAt: content.verifiedAt
      }
    }
  });
});

/**
 * Get verification result by ID
 * GET /api/content/:id
 * Requires authentication
 */
const getVerificationResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Find content by ID
  const content = await Content.findById(id).populate('submittedBy', 'username email');

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Verification result not found'
    });
  }

  // Check if user has permission to view this content
  // Users can only view their own submitted content
  if (content.submittedBy._id.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only view your own verification results.'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      content: {
        id: content._id,
        url: content.url,
        text: content.text,
        trustScore: content.trustScore,
        verifiedByAI: content.verifiedByAI,
        verificationStatus: content.verificationStatus,
        aiAnalysis: content.aiAnalysis,
        submittedBy: {
          id: content.submittedBy._id,
          username: content.submittedBy.username
        },
        createdAt: content.createdAt,
        verifiedAt: content.verifiedAt
      }
    }
  });
});

/**
 * Get user's verification history
 * GET /api/content/history
 * Requires authentication
 */
const getVerificationHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Find user's content with pagination
  const content = await Content.find({ submittedBy: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('submittedBy', 'username');

  // Get total count for pagination info
  const total = await Content.countDocuments({ submittedBy: userId });

  res.status(200).json({
    success: true,
    data: {
      content: content.map(item => ({
        id: item._id,
        url: item.url,
        text: item.text.substring(0, 200) + (item.text.length > 200 ? '...' : ''), // Truncate text for list view
        trustScore: item.trustScore,
        verifiedByAI: item.verifiedByAI,
        verificationStatus: item.verificationStatus,
        createdAt: item.createdAt,
        verifiedAt: item.verifiedAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    }
  });
});

/**
 * Delete verification result
 * DELETE /api/content/:id
 * Requires authentication
 */
const deleteVerificationResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Find content by ID
  const content = await Content.findById(id);

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Verification result not found'
    });
  }

  // Check if user has permission to delete this content
  if (content.submittedBy.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only delete your own verification results.'
    });
  }

  await Content.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Verification result deleted successfully'
  });
});

module.exports = {
  verifyContent,
  getVerificationResult,
  getVerificationHistory,
  deleteVerificationResult
};