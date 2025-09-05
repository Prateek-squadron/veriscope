const Scan = require('../models/Scan');
const virusTotalService = require('../services/virusTotalService');
const huggingFaceService = require('../services/huggingFaceService');

/**
 * Submit content for AI-powered phishing/malware scanning
 * @desc    Analyzes URLs with VirusTotal and text with Hugging Face
 * @route   POST /api/content/scan
 * @access  Private
 */
const scanContent = async (req, res) => {
  console.log('🔍 Scan endpoint hit!');
  console.log('🔍 Request body:', req.body);
  console.log('🔍 User object:', req.user);
  console.log('🔍 User ID:', req.user?._id);
  console.log('🔍 User type:', typeof req.user);
  
  try {
    const { url, text } = req.body;
    const userId = req.user._id;

    // Validate input - at least one of url or text is required
    if (!url && !text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a URL or text content to scan'
      });
    }

    if (text && text.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Text content must be at least 10 characters long'
      });
    }

    if (url && !/^https?:\/\/.+/.test(url)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid URL (must start with http:// or https://)'
      });
    }

    // Create new scan record
    const scan = new Scan({
      url: url || undefined,
      text: text || undefined,
      submittedBy: userId,
      scanStatus: 'processing'
    });

    await scan.save();

    // Perform scans asynchronously
    let urlScanResult = null;
    let textScanResult = null;

    try {
      // Run scans in parallel for better performance
      const scanPromises = [];

      if (url) {
        console.log(`🔍 Starting URL scan for: ${url}`);
        scanPromises.push(
          virusTotalService.scanUrl(url)
            .then(result => ({ type: 'url', result }))
            .catch(error => ({ 
              type: 'url', 
              result: { 
                status: 'error', 
                confidence: 0, 
                message: `URL scan failed: ${error.message}` 
              } 
            }))
        );
      }

      if (text) {
        console.log(`📝 Starting text analysis for ${text.length} characters`);
        scanPromises.push(
          huggingFaceService.analyzeText(text)
            .then(result => ({ type: 'text', result }))
            .catch(error => ({ 
              type: 'text', 
              result: { 
                label: 'unknown', 
                confidence: 0, 
                message: `Text analysis failed: ${error.message}` 
              } 
            }))
        );
      }

      // Wait for all scans to complete
      const scanResults = await Promise.all(scanPromises);

      // Process results
      scanResults.forEach(({ type, result }) => {
        if (type === 'url') {
          urlScanResult = result;
        } else if (type === 'text') {
          textScanResult = result;
        }
      });

      // Update scan record with results
      await scan.markAsCompleted(urlScanResult, textScanResult);

      // Update API usage tracking
      scan.apiUsage = {
        virusTotal: {
          used: !!url,
          quotaExceeded: urlScanResult?.fallback || false
        },
        huggingFace: {
          used: !!text,
          rateLimited: textScanResult?.fallback || false
        }
      };
      await scan.save();

      console.log(`✅ Scan completed for user ${userId}`);

      // Prepare response
      const response = {
        success: true,
        scanId: scan._id,
        message: 'Scan completed successfully',
        results: {
          ...(urlScanResult && { urlScan: urlScanResult }),
          ...(textScanResult && { textScan: textScanResult }),
          overall: scan.overallResult
        },
        timestamp: scan.completedAt
      };

      res.status(200).json(response);

    } catch (scanError) {
      console.error('Scan processing error:', scanError);
      
      await scan.markAsFailed(scanError.message);
      
      res.status(500).json({
        success: false,
        scanId: scan._id,
        message: 'Scan processing failed',
        error: scanError.message
      });
    }

  } catch (error) {
    console.error('Scan controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during scan processing',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

/**
 * Get specific scan result by ID
 * @desc    Retrieve detailed scan results
 * @route   GET /api/content/scan/:id
 * @access  Private
 */
const getScanResult = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const scan = await Scan.findOne({ 
      _id: id, 
      submittedBy: userId 
    }).lean();

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan result not found'
      });
    }

    res.status(200).json({
      success: true,
      scan
    });

  } catch (error) {
    console.error('Get scan result error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving scan result',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

/**
 * Get user's scan history with pagination
 * @desc    Retrieve paginated list of user's scans
 * @route   GET /api/content/scan/history
 * @access  Private
 */
const getScanHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 per page

    const result = await Scan.findByUserPaginated(userId, page, limit);

    res.status(200).json({
      success: true,
      ...result,
      message: `Retrieved ${result.scans.length} scan results`
    });

  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving scan history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

/**
 * Get user's scan statistics
 * @desc    Retrieve summary statistics of user's scans
 * @route   GET /api/content/scan/stats
 * @access  Private
 */
const getScanStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const stats = await Scan.getStatsByUser(userId);

    res.status(200).json({
      success: true,
      stats: {
        ...stats,
        riskDistribution: {
          high: stats.highRisk,
          medium: stats.mediumRisk,
          low: stats.lowRisk
        },
        completionRate: stats.total > 0 
          ? Math.round((stats.completed / stats.total) * 100) 
          : 0
      }
    });

  } catch (error) {
    console.error('Get scan stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving scan statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

/**
 * Delete scan result by ID
 * @desc    Remove a scan result from user's history
 * @route   DELETE /api/content/scan/:id
 * @access  Private
 */
const deleteScanResult = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const scan = await Scan.findOneAndDelete({ 
      _id: id, 
      submittedBy: userId 
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan result not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scan result deleted successfully'
    });

  } catch (error) {
    console.error('Delete scan result error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting scan result',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

module.exports = {
  scanContent,
  getScanResult,
  getScanHistory,
  getScanStats,
  deleteScanResult
};