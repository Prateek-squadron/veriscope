const express = require('express');
const {
  verifyContent,
  getVerificationResult,
  getVerificationHistory,
  deleteVerificationResult
} = require('../controllers/contentController');
const {
  scanContent,
  getScanResult,
  getScanHistory,
  getScanStats,
  deleteScanResult
} = require('../controllers/scanController');
const { authenticate } = require('../middleware/auth');
const virusTotalService = require('../services/virusTotalService');
const huggingFaceService = require('../services/huggingFaceService');

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

// AI-Powered Phishing/Malware Scan Routes (MUST be before /:id routes)

/**
 * @route   POST /api/content/scan
 * @desc    Submit content for AI-powered phishing/malware analysis
 * @access  Private (requires authentication)
 * @body    { text?, url? } - At least one of text or url is required
 */
router.post('/testscan', authenticate, (req, res) => {
  console.log('🔍 TESTSCAN route handler called!');
  res.json({ success: true, message: 'Test scan route works!', body: req.body, user: req.user.username });
});

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

// WORKING AI ENDPOINT
router.post('/ai-test', authenticate, async (req, res) => {
  console.log('🚀 AI TEST ENDPOINT HIT!');
  
  try {
    const { text, url } = req.body;
    console.log('Request:', { text, url });
    
    if (!text && !url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text or URL'
      });
    }

    let results = { success: true, message: 'AI Analysis Complete' };
    
    // Test text analysis
    if (text && text.length >= 10) {
      console.log('Analyzing text...');
      try {
        const textResult = await huggingFaceService.analyzeText(text);
        results.textAnalysis = textResult;
        console.log('Text result:', textResult);
      } catch (error) {
        console.error('Text analysis error:', error.message);
        results.textError = error.message;
      }
    }
    
    // Test URL analysis  
    if (url) {
      console.log('Analyzing URL...');
      try {
        const urlResult = await virusTotalService.scanUrl(url);
        results.urlAnalysis = urlResult;
        console.log('URL result:', urlResult);
      } catch (error) {
        console.error('URL analysis error:', error.message);
        results.urlError = error.message;
      }
    }
    
    res.json(results);
    
  } catch (error) {
    console.error('AI Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'AI test failed',
      error: error.message
    });
  }
});

// Generic content routes (MUST be after specific routes)

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