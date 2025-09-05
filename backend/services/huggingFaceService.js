const axios = require('axios');

/**
 * Hugging Face Inference API Service
 * Provides text phishing detection using free Hugging Face models
 * Requires HUGGING_FACE_API_KEY in environment variables
 */
class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUGGING_FACE_API_KEY;
    this.baseUrl = 'https://api-inference.huggingface.co/models';
    
    // Use a pre-trained phishing detection model (free tier compatible)
    this.models = {
      phishing: 'unitary/toxic-bert',  // Alternative: 'martin-ha/toxic-comment-model'
      sentiment: 'cardiffnlp/twitter-roberta-base-sentiment-latest'
    };
    
    if (!this.apiKey) {
      console.warn('⚠️  HUGGING_FACE_API_KEY not found in environment variables');
    }
  }

  /**
   * Classify text for phishing/malicious content
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Classification results
   */
  async classifyText(text) {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    if (!text || text.length < 10) {
      throw new Error('Text too short for meaningful analysis');
    }

    try {
      // Use toxic content detection as a proxy for phishing detection
      const response = await axios.post(
        `${this.baseUrl}/${this.models.phishing}`,
        {
          inputs: text.substring(0, 512) // Limit text length for API
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return this.parseClassificationResults(response.data, text);
      
    } catch (error) {
      if (error.response?.status === 429) {
        // API rate limit exceeded
        throw new Error('Hugging Face API rate limit exceeded');
      }
      
      if (error.response?.status === 503 && error.response.data?.error?.includes('loading')) {
        // Model is loading, wait and retry once
        console.log('Model loading, waiting...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        try {
          const retryResponse = await axios.post(
            `${this.baseUrl}/${this.models.phishing}`,
            {
              inputs: text.substring(0, 512)
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 15000
            }
          );
          
          return this.parseClassificationResults(retryResponse.data, text);
          
        } catch (retryError) {
          console.error('Hugging Face retry error:', retryError.message);
          return this.getFallbackResponse(text);
        }
      }
      
      console.error('Hugging Face classification error:', error.message);
      
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return this.getFallbackResponse(text);
      }
      
      throw new Error(`Hugging Face API error: ${error.message}`);
    }
  }

  /**
   * Analyze text sentiment to help detect suspicious content
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Sentiment analysis results
   */
  async analyzeSentiment(text) {
    if (!this.apiKey) {
      return this.getFallbackSentiment();
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.models.sentiment}`,
        {
          inputs: text.substring(0, 512)
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const results = response.data[0];
        const topResult = results.reduce((prev, current) => 
          prev.score > current.score ? prev : current
        );
        
        return {
          label: topResult.label.toLowerCase(),
          confidence: Math.round(topResult.score * 100),
          results: results
        };
      }
      
      return this.getFallbackSentiment();
      
    } catch (error) {
      console.error('Sentiment analysis error:', error.message);
      return this.getFallbackSentiment();
    }
  }

  /**
   * Comprehensive text analysis combining multiple techniques
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Combined analysis results
   */
  async analyzeText(text) {
    try {
      // Run classification and sentiment analysis
      const [classification, sentiment] = await Promise.allSettled([
        this.classifyText(text),
        this.analyzeSentiment(text)
      ]);

      const classResult = classification.status === 'fulfilled' 
        ? classification.value 
        : this.getFallbackResponse(text);
        
      const sentimentResult = sentiment.status === 'fulfilled' 
        ? sentiment.value 
        : this.getFallbackSentiment();

      // Combine results for better accuracy
      return this.combineAnalysisResults(classResult, sentimentResult, text);
      
    } catch (error) {
      console.error('Text analysis error:', error.message);
      return this.getFallbackResponse(text);
    }
  }

  /**
   * Parse classification results into standardized format
   * @param {Array} results - Raw results from Hugging Face
   * @param {string} originalText - Original input text
   * @returns {Object} Parsed results
   */
  parseClassificationResults(results, originalText) {
    if (!Array.isArray(results) || results.length === 0) {
      return this.getFallbackResponse(originalText);
    }

    // Get the highest confidence result
    const topResult = results.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );

    const confidence = Math.round(topResult.score * 100);
    const label = topResult.label.toLowerCase();
    
    // Map labels to our phishing detection categories
    let status, riskLevel;
    
    if (label.includes('toxic') || label.includes('threat') || confidence > 70) {
      status = 'phishing';
      riskLevel = 'high';
    } else if (confidence > 40) {
      status = 'suspicious';
      riskLevel = 'medium';
    } else {
      status = 'safe';
      riskLevel = 'low';
    }

    return {
      label: status,
      confidence,
      riskLevel,
      message: `Text classified as ${status} with ${confidence}% confidence`,
      details: {
        originalLabel: topResult.label,
        allResults: results.map(r => ({
          label: r.label,
          confidence: Math.round(r.score * 100)
        }))
      }
    };
  }

  /**
   * Combine classification and sentiment results for better accuracy
   * @param {Object} classification - Classification results
   * @param {Object} sentiment - Sentiment analysis results
   * @param {string} text - Original text
   * @returns {Object} Combined results
   */
  combineAnalysisResults(classification, sentiment, text) {
    // Basic text pattern analysis
    const patterns = this.analyzeTextPatterns(text);
    
    // Adjust confidence based on multiple factors
    let finalConfidence = classification.confidence;
    let finalLabel = classification.label;
    
    // Suspicious sentiment patterns can increase phishing likelihood
    if (sentiment.label === 'negative' && sentiment.confidence > 80) {
      finalConfidence = Math.min(95, finalConfidence + 10);
    }
    
    // Common phishing patterns boost confidence
    if (patterns.suspiciousPatterns > 2) {
      finalConfidence = Math.min(95, finalConfidence + 15);
      if (finalLabel === 'safe') {
        finalLabel = 'suspicious';
      }
    }
    
    // Very short or very long texts are often suspicious
    if (text.length < 50 || text.length > 2000) {
      finalConfidence = Math.max(30, finalConfidence - 10);
    }

    return {
      label: finalLabel,
      confidence: Math.round(finalConfidence),
      riskLevel: this.getRiskLevel(finalConfidence, finalLabel),
      message: `Combined analysis: ${finalLabel} content detected`,
      details: {
        classification,
        sentiment,
        patterns,
        factors: {
          textLength: text.length,
          suspiciousPatterns: patterns.suspiciousPatterns
        }
      }
    };
  }

  /**
   * Analyze text for common phishing patterns
   * @param {string} text - Text to analyze
   * @returns {Object} Pattern analysis results
   */
  analyzeTextPatterns(text) {
    const lowerText = text.toLowerCase();
    
    const phishingKeywords = [
      'urgent', 'immediate', 'click here', 'verify account', 'suspend', 'limited time',
      'confirm identity', 'update payment', 'security alert', 'act now', 'expire',
      'winner', 'congratulations', 'free money', 'inheritance', 'lottery',
      'prince', 'million dollars', 'transfer funds', 'beneficiary'
    ];
    
    const urgencyWords = [
      'urgent', 'immediate', 'asap', 'emergency', 'critical', 'act now',
      'limited time', 'expires', 'deadline', 'final notice'
    ];
    
    const financialWords = [
      'bank', 'account', 'payment', 'credit card', 'paypal', 'bitcoin',
      'money', 'funds', 'transfer', 'deposit', 'withdraw'
    ];
    
    let suspiciousPatterns = 0;
    const foundKeywords = [];
    
    // Check for phishing keywords
    phishingKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        suspiciousPatterns++;
        foundKeywords.push(keyword);
      }
    });
    
    // Check for multiple urgency words
    const urgencyCount = urgencyWords.filter(word => lowerText.includes(word)).length;
    if (urgencyCount > 1) suspiciousPatterns++;
    
    // Check for financial + urgency combination
    const financialCount = financialWords.filter(word => lowerText.includes(word)).length;
    if (financialCount > 0 && urgencyCount > 0) suspiciousPatterns++;
    
    // Check for excessive punctuation/caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    const exclamationCount = (text.match(/!/g) || []).length;
    
    if (capsRatio > 0.3 || exclamationCount > 3) suspiciousPatterns++;
    
    return {
      suspiciousPatterns,
      foundKeywords,
      urgencyCount,
      financialCount,
      capsRatio: Math.round(capsRatio * 100),
      exclamationCount
    };
  }

  /**
   * Get risk level based on confidence and label
   * @param {number} confidence - Confidence score
   * @param {string} label - Classification label
   * @returns {string} Risk level
   */
  getRiskLevel(confidence, label) {
    if (label === 'phishing' && confidence > 80) return 'high';
    if (label === 'phishing' || (label === 'suspicious' && confidence > 70)) return 'medium';
    return 'low';
  }

  /**
   * Fallback response when API is unavailable
   * @param {string} text - Original text
   * @returns {Object} Fallback analysis results
   */
  getFallbackResponse(text) {
    const patterns = this.analyzeTextPatterns(text);
    
    let confidence = 50; // Default moderate confidence
    let label = 'unknown';
    
    if (patterns.suspiciousPatterns > 3) {
      confidence = 75;
      label = 'suspicious';
    } else if (patterns.suspiciousPatterns > 1) {
      confidence = 65;
      label = 'suspicious';
    } else {
      confidence = 60;
      label = 'safe';
    }
    
    return {
      label,
      confidence,
      riskLevel: this.getRiskLevel(confidence, label),
      message: 'Hugging Face API unavailable, using pattern-based analysis',
      fallback: true,
      details: {
        patterns
      }
    };
  }

  /**
   * Fallback sentiment response
   * @returns {Object} Default sentiment
   */
  getFallbackSentiment() {
    return {
      label: 'neutral',
      confidence: 50,
      fallback: true
    };
  }

  /**
   * Check if Hugging Face service is available
   * @returns {boolean} Service availability
   */
  isAvailable() {
    return !!this.apiKey;
  }
}

module.exports = new HuggingFaceService();