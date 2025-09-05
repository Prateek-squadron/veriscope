const express = require('express');
const { scanContent, getScanResult, getScanHistory, deleteScanResult, getScanStats } = require('../controllers/scanController');
const { authenticate } = require('../middleware/auth');

/**
 * Scan Routes
 * All routes related to AI-powered phishing/malware scanning
 */
const router = express.Router();

/**
 * @route   POST /api/content/scan
 * @desc    Submit content for AI-powered phishing/malware analysis
 * @access  Private (requires authentication)
 * @body    { text?, url? } - At least one of text or url is required
 */
router.post('/scan', authenticate, scanContent);

/**
 * @route   GET /api/content/scan/history
 * @desc    Get user's scan history with pagination
 * @access  Private (requires authentication)
 * @query   { page?, limit? }
 */
router.get('/scan/history', authenticate, getScanHistory);

/**
 * @route   GET /api/content/scan/stats
 * @desc    Get user's scan statistics
 * @access  Private (requires authentication)
 */
router.get('/scan/stats', authenticate, getScanStats);

/**
 * @route   GET /api/content/scan/:id
 * @desc    Get specific scan result by ID
 * @access  Private (requires authentication)
 */
router.get('/scan/:id', authenticate, getScanResult);

/**
 * @route   DELETE /api/content/scan/:id
 * @desc    Delete scan result by ID
 * @access  Private (requires authentication)
 */
router.delete('/scan/:id', authenticate, deleteScanResult);

module.exports = router;