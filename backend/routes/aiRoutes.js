const express = require('express');
const virusTotalService = require('../services/virusTotalService');
const huggingFaceService = require('../services/huggingFaceService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/ai/analyze
 * @desc    AI-powered content analysis (working endpoint)
 * @access  Private
 */
router.post('/analyze', authenticate, async (req, res) => {
  console.log('✅ AI ANALYZE ENDPOINT HIT!');
  
  try {
    const { text, url } = req.body;
    
    if (!text && !url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either text or URL to analyze'
      });
    }

    let textResult = null;
    let urlResult = null;
    
    // Analyze text
    if (text && text.length >= 10) {
      console.log('🔍 Analyzing text with Hugging Face...');
      try {
        textResult = await huggingFaceService.analyzeText(text);
        console.log('Text analysis result:', textResult);
      } catch (error) {
        console.error('Text analysis error:', error.message);
        textResult = { 
          label: 'unknown', 
          confidence: 50, 
          message: `Analysis failed: ${error.message}` 
        };
      }
    }
    
    // Analyze URL
    if (url && /^https?:\/\/.+/.test(url)) {
      console.log('🔍 Analyzing URL with VirusTotal...');
      try {
        urlResult = await virusTotalService.scanUrl(url);
        console.log('URL analysis result:', urlResult);
      } catch (error) {
        console.error('URL analysis error:', error.message);
        urlResult = { 
          status: 'unknown', 
          confidence: 50, 
          message: `Scan failed: ${error.message}` 
        };
      }
    }
    
    // Calculate overall risk score
    let overallScore = 50;
    let riskLevel = 'medium';
    
    if (textResult && urlResult) {
      // Both text and URL analyzed
      const textScore = textResult.label === 'safe' ? 80 : 
                       textResult.label === 'suspicious' ? 40 : 
                       textResult.label === 'phishing' ? 20 : 50;
      
      const urlScore = urlResult.status === 'clean' ? 80 : 
                      urlResult.status === 'suspicious' ? 40 : 
                      urlResult.status === 'malicious' ? 20 : 50;
      
      overallScore = Math.round((textScore + urlScore) / 2);
    } else if (textResult) {
      overallScore = textResult.label === 'safe' ? 80 : 
                    textResult.label === 'suspicious' ? 40 : 
                    textResult.label === 'phishing' ? 20 : 50;
    } else if (urlResult) {
      overallScore = urlResult.status === 'clean' ? 80 : 
                    urlResult.status === 'suspicious' ? 40 : 
                    urlResult.status === 'malicious' ? 20 : 50;
    }
    
    if (overallScore >= 70) riskLevel = 'low';
    else if (overallScore >= 40) riskLevel = 'medium';
    else riskLevel = 'high';
    
    res.json({
      success: true,
      message: 'AI analysis completed',
      results: {
        ...(textResult && { textAnalysis: textResult }),
        ...(urlResult && { urlAnalysis: urlResult }),
        overall: {
          trustScore: overallScore,
          riskLevel,
          recommendation: riskLevel === 'high' 
            ? 'High risk detected - avoid this content'
            : riskLevel === 'medium' 
            ? 'Suspicious content - exercise caution' 
            : 'Content appears relatively safe'
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'AI analysis failed',
      error: error.message
    });
  }
});

module.exports = router;