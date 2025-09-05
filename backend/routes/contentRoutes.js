const express = require('express');
const {
  verifyContent,
  getVerificationResult,
  getVerificationHistory,
  deleteVerificationResult
} = require('../controllers/contentController');
const { authenticate } = require('../middleware/auth');

/**
 * Content Routes
 * All routes related to content verification and management
 */
const router = express.Router();

/**
 * @route   POST /api/content/verify
 * @desc    Submit content for verification
 * @access  Private (requires authentication)
 * @body    { text, url? }
 */
router.post('/verify', authenticate, verifyContent);

/**
 * @route   GET /api/content/history
 * @desc    Get user's verification history with pagination
 * @access  Private (requires authentication)
 * @query   { page?, limit? }
 */
router.get('/history', authenticate, getVerificationHistory);

/**
 * @route   GET /api/content/:id
 * @desc    Get specific verification result by ID
 * @access  Private (requires authentication)
 */
router.get('/:id', authenticate, getVerificationResult);

/**
 * @route   DELETE /api/content/:id
 * @desc    Delete verification result by ID
 * @access  Private (requires authentication)
 */
router.delete('/:id', authenticate, deleteVerificationResult);

module.exports = router;