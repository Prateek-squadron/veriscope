const axios = require('axios');

/**
 * Reliable AI Service using multiple approaches
 * Falls back to pattern-based analysis when APIs fail
 */
class ReliableAiService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;
    
    // Multiple Hugging Face models for ensemble voting
    this.huggingFaceModels = [
      {
        name: 'martin-ha/toxic-comment-model',
        type: 'toxicity',
        weight: 1.0,
        enabled: true
      },
      {
        name: 'unitary/toxic-bert',
        type: 'toxicity', 
        weight: 1.2, // Higher weight for Google's model
        enabled: true
      },
      {
        name: 'citizenlab/distilbert-base-multilingual-cased-toxicity-classifier',
        type: 'toxicity',
        weight: 0.9,
        enabled: true
      },
      {
        name: 'facebook/bart-large-mnli',
        type: 'classification',
        weight: 1.1,
        enabled: true
      },
      {
        name: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
        type: 'sentiment',
        weight: 0.8,
        enabled: true
      }
    ];
    
    // API endpoints
    this.huggingFaceBase = 'https://api-inference.huggingface.co/models/';

    if (!this.huggingFaceApiKey) {
      console.warn('⚠️  HUGGING_FACE_API_KEY not found; Hugging Face calls may fail.');
    }
  }

  /**
   * Analyze text for phishing using multiple methods
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeText(text) {
    console.log('🔍 Starting reliable text analysis...');
    
    // Always do pattern-based analysis first (most reliable)
    const patternResult = this.analyzeTextPatterns(text);
    
    // Try Hugging Face model first, then OpenAI as fallback
    let aiResult = null;
    try {
      aiResult = await this.analyzeWithHuggingFace(text);
      console.log('✅ Hugging Face analysis successful');
    } catch (error) {
      console.log('❌ Hugging Face failed:', error.message);
    }
    
    // Try simple sentiment analysis
    let sentimentResult = null;
    try {
      sentimentResult = await this.analyzeSentiment(text);
    } catch (error) {
      console.log('❌ Sentiment analysis failed:', error.message);
    }
    
    // Combine results
    const finalResult = this.combineResults(patternResult, aiResult, sentimentResult);
    console.log('🎯 Final text analysis result:', finalResult);
    
    return finalResult;
  }

  /**
   * Analyze URL for malicious content
   * @param {string} url - URL to analyze
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeUrl(url) {
    console.log('🔍 Starting reliable URL analysis...');
    
    // Pattern-based URL analysis (always works)
    const patternResult = this.analyzeUrlPatterns(url);
    
    // Try basic domain reputation check
    let reputationResult = null;
    try {
      reputationResult = await this.checkDomainReputation(url);
    } catch (error) {
      console.log('❌ Domain reputation check failed:', error.message);
    }
    
    // Combine results
    const finalResult = this.combineUrlResults(patternResult, reputationResult);
    console.log('🎯 Final URL analysis result:', finalResult);
    
    return finalResult;
  }

  /**
   * Pattern-based text analysis (always works)
   * @param {string} text - Text to analyze
   * @returns {Object} Pattern analysis results
   */
  analyzeTextPatterns(text) {
    const lowerText = text.toLowerCase();
    
    // Weighted indicators - different risk levels get different scores
    const highRiskIndicators = [
      // Urgent security threats (15 points each)
      { words: ['urgent', 'immediate', 'suspend', 'suspended', 'locked', 'blocked', 'deactivated'], weight: 15 },
      { words: ['security alert', 'unusual activity', 'compromised', 'breach', 'unauthorized'], weight: 15 },
      { words: ['verify account', 'update payment', 'confirm identity'], weight: 15 },
    ];
    
    const mediumRiskIndicators = [
      // Promotional/offer language (10 points each)
      { words: ['free', 'offer', 'deal', 'discount', 'promotion', 'special offer'], weight: 10 },
      { words: ['claim', 'redeem', 'coupon', 'voucher', 'code', 'promo'], weight: 10 },
      { words: ['limited time', 'expires', 'deadline', 'act now', 'hurry'], weight: 10 },
      { words: ['prize', 'winner', 'congratulations', 'reward', 'bonus'], weight: 10 },
    ];
    
    const lowRiskIndicators = [
      // General suspicious language (5 points each)
      { words: ['click here', 'click now', 'download', 'install'], weight: 5 },
      { words: ['guaranteed', 'risk free', 'no obligation'], weight: 5 },
      { words: ['selected', 'chosen', 'eligible', 'qualified'], weight: 5 },
      { words: ['money', 'cash', 'payment', 'bank', 'paypal'], weight: 5 },
    ];
    
    // Pattern-based scoring (more nuanced)
    const suspiciousPatterns = [
      { pattern: /https?:\/\/[^\s]+/g, weight: 8, type: 'urls' },
      { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, weight: 6, type: 'emails' },
      { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, weight: 7, type: 'phones' },
      { pattern: /[!]{2,}/g, weight: 4, type: 'exclamation' },
      { pattern: /\b[A-Z]{4,}\b/g, weight: 3, type: 'caps' },
      { pattern: /\$\d+/g, weight: 6, type: 'money' },
      { pattern: /\b\d+%\s?(off|discount|save)/gi, weight: 8, type: 'percentage' },
    ];
    
    let totalScore = 0;
    let foundIndicators = [];
    let foundPatterns = [];
    let riskFactors = [];
    
    // Score high-risk indicators
    highRiskIndicators.forEach(group => {
      group.words.forEach(word => {
        if (lowerText.includes(word)) {
          totalScore += group.weight;
          foundIndicators.push({ word, weight: group.weight, risk: 'high' });
          riskFactors.push(`High risk: "${word}" detected`);
        }
      });
    });
    
    // Score medium-risk indicators  
    mediumRiskIndicators.forEach(group => {
      group.words.forEach(word => {
        if (lowerText.includes(word)) {
          totalScore += group.weight;
          foundIndicators.push({ word, weight: group.weight, risk: 'medium' });
          riskFactors.push(`Medium risk: "${word}" detected`);
        }
      });
    });
    
    // Score low-risk indicators
    lowRiskIndicators.forEach(group => {
      group.words.forEach(word => {
        if (lowerText.includes(word)) {
          totalScore += group.weight;
          foundIndicators.push({ word, weight: group.weight, risk: 'low' });
          riskFactors.push(`Low risk: "${word}" detected`);
        }
      });
    });
    
    // Score pattern matches
    suspiciousPatterns.forEach(patternObj => {
      const matches = text.match(patternObj.pattern);
      if (matches && matches.length > 0) {
        const patternScore = matches.length * patternObj.weight;
        totalScore += patternScore;
        foundPatterns.push({
          type: patternObj.type,
          count: matches.length,
          score: patternScore
        });
        riskFactors.push(`${matches.length} ${patternObj.type} detected`);
      }
    });
    
    // Calculate confidence and label using gradual scoring
    let confidence = 50; // Base confidence
    let label = 'safe';
    let riskLevel = 'low';
    
    if (totalScore >= 80) {
      // Very high risk: 80+ points
      label = 'phishing';
      riskLevel = 'high';
      confidence = Math.min(98, 75 + Math.round(totalScore / 4));
    } else if (totalScore >= 50) {
      // High risk: 50-79 points  
      label = 'phishing';
      riskLevel = 'high';
      confidence = Math.min(90, 65 + Math.round(totalScore / 3));
    } else if (totalScore >= 25) {
      // Medium risk: 25-49 points
      label = 'suspicious';
      riskLevel = 'medium';
      confidence = Math.min(85, 55 + Math.round(totalScore / 2));
    } else if (totalScore >= 10) {
      // Low-medium risk: 10-24 points
      label = 'suspicious';
      riskLevel = 'medium';
      confidence = Math.min(75, 50 + totalScore);
    } else if (totalScore > 0) {
      // Very low risk: 1-9 points
      label = 'safe';
      riskLevel = 'low';
      confidence = Math.max(75, 95 - totalScore * 3);
    } else {
      // No risk indicators: 0 points
      label = 'safe';
      riskLevel = 'low';
      confidence = Math.max(85, 98 - text.length / 20); // Longer text slightly less confident
    }
    
    return {
      label,
      confidence: Math.round(confidence),
      riskLevel,
      score: totalScore,
      message: `Pattern analysis: ${foundIndicators.length} indicators found (score: ${totalScore})`,
      details: {
        foundIndicators,
        foundPatterns,
        riskFactors,
        textLength: text.length,
        method: 'weighted-pattern-analysis'
      }
    };
  }

  /**
   * Pattern-based URL analysis (always works)
   * @param {string} url - URL to analyze
   * @returns {Object} URL analysis results
   */
  analyzeUrlPatterns(url) {
    const suspiciousDomains = [
      'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', // URL shorteners
      '.tk', '.ml', '.ga', '.cf', // Suspicious TLDs
      'temp-mail', 'guerrilla', '10minute' // Temp services
    ];
    
    const suspiciousKeywords = [
      'phishing', 'fake', 'scam', 'fraud', 'malware', 'virus',
      'login', 'secure', 'verify', 'account', 'update', 'confirm',
      'paypal', 'amazon', 'apple', 'microsoft', 'google' // Brand impersonation
    ];
    
    let score = 0;
    let flags = [];
    
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      const fullUrl = url.toLowerCase();
      
      // Check suspicious domains
      suspiciousDomains.forEach(suspiciousDomain => {
        if (domain.includes(suspiciousDomain)) {
          score += 30;
          flags.push(`Suspicious domain: ${suspiciousDomain}`);
        }
      });
      
      // Check suspicious keywords in URL
      suspiciousKeywords.forEach(keyword => {
        if (fullUrl.includes(keyword)) {
          score += 15;
          flags.push(`Suspicious keyword: ${keyword}`);
        }
      });
      
      // Check URL length (very long URLs can be suspicious)
      if (url.length > 100) {
        score += 10;
        flags.push('Very long URL');
      }
      
      // Check for IP address instead of domain
      if (/^\d+\.\d+\.\d+\.\d+/.test(domain)) {
        score += 25;
        flags.push('IP address instead of domain name');
      }
      
      // Check for excessive subdomains
      const subdomainCount = domain.split('.').length - 2;
      if (subdomainCount > 2) {
        score += 20;
        flags.push(`Excessive subdomains (${subdomainCount})`);
      }
      
    } catch (error) {
      score += 50;
      flags.push('Invalid URL format');
    }
    
    // Calculate final assessment
    let status = 'clean';
    let confidence = 50;
    
    if (score >= 50) {
      status = 'malicious';
      confidence = Math.min(95, 70 + (score - 50) / 2);
    } else if (score >= 25) {
      status = 'suspicious';
      confidence = Math.min(85, 60 + (score - 25));
    } else {
      status = 'clean';
      confidence = Math.max(70, 90 - score);
    }
    
    return {
      status,
      confidence: Math.round(confidence),
      score,
      message: `Pattern analysis: ${flags.length} suspicious indicators found`,
      flags,
      method: 'pattern-based'
    };
  }

  /**
   * Analyze with multiple Hugging Face models using ensemble voting
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Ensemble analysis results
   */
  async analyzeWithHuggingFace(text) {
    console.log('🤖 Starting multi-model ensemble analysis...');
    
    const modelResults = [];
    const promises = [];

    // Run all enabled models in parallel
    for (const model of this.huggingFaceModels) {
      if (!model.enabled) continue;
      
      promises.push(
        this.callSingleHuggingFaceModel(text, model)
          .then(result => ({ model: model.name, ...result }))
          .catch(error => ({ 
            model: model.name, 
            error: error.message,
            label: 'unknown',
            confidence: 0,
            weight: 0
          }))
      );
    }

    // Wait for all models to complete (with timeout)
    try {
      const results = await Promise.all(promises);
      
      // Filter successful results
      const successfulResults = results.filter(r => !r.error && r.confidence > 0);
      console.log(`✅ ${successfulResults.length}/${results.length} models succeeded`);
      
      if (successfulResults.length === 0) {
        console.log('❌ All Hugging Face models failed, falling back to OpenAI');
        return this.analyzeWithOpenAI(text);
      }
      
      // Ensemble voting with weighted average
      return this.combineModelResults(successfulResults);
      
    } catch (error) {
      console.log('❌ Ensemble analysis failed:', error.message);
      return this.analyzeWithOpenAI(text);
    }
  }

  /**
   * Call a single Hugging Face model
   * @param {string} text - Text to analyze
   * @param {Object} model - Model configuration
   * @returns {Promise<Object>} Single model results
   */
  async callSingleHuggingFaceModel(text, model) {
    const url = `${this.huggingFaceBase}${model.name}`;
    
    try {
      let requestData = { inputs: text };
      
      // Special handling for different model types
      if (model.type === 'classification' && model.name.includes('bart-large-mnli')) {
        requestData.parameters = {
          candidate_labels: ['phishing', 'scam', 'promotional', 'malicious', 'safe', 'legitimate']
        };
      }
      
      const response = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.huggingFaceApiKey ? { 'Authorization': `Bearer ${this.huggingFaceApiKey}` } : {})
        },
        timeout: 10000
      });

      const result = response.data;
      
      // Parse different response formats
      return this.parseModelResponse(result, model);
      
    } catch (error) {
      console.log(`⚠️ Model ${model.name} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Parse response from different Hugging Face model types
   * @param {*} result - Raw API response
   * @param {Object} model - Model configuration
   * @returns {Object} Standardized result
   */
  parseModelResponse(result, model) {
    let score = 0;
    let label = 'safe';
    let confidence = 0;
    
    try {
      if (model.type === 'toxicity') {
        // Handle toxicity models
        if (Array.isArray(result) && result.length > 0) {
          const scores = result[0];
          const toxicScore = scores.find(s => s.label === 'TOXIC')?.score || 0;
          const severeScore = scores.find(s => s.label === 'SEVERE_TOXIC')?.score || 0;
          const threatScore = scores.find(s => s.label === 'THREAT')?.score || 0;
          const insultScore = scores.find(s => s.label === 'INSULT')?.score || 0;
          
          score = Math.max(toxicScore, severeScore, threatScore, insultScore);
        }
      } else if (model.type === 'classification') {
        // Handle classification models (BART-MNLI)
        if (Array.isArray(result) && result.length > 0) {
          const phishingScore = result.find(r => ['phishing', 'scam', 'malicious'].includes(r.label.toLowerCase()))?.score || 0;
          const safeScore = result.find(r => ['safe', 'legitimate'].includes(r.label.toLowerCase()))?.score || 0;
          
          score = phishingScore;
        }
      } else if (model.type === 'sentiment') {
        // Handle sentiment models
        if (Array.isArray(result) && result.length > 0) {
          const negativeScore = result.find(r => r.label === 'NEGATIVE')?.score || 0;
          score = negativeScore;
        }
      }
      
      // Convert score to confidence and label
      confidence = Math.round(score * 100);
      
      if (score > 0.7) {
        label = 'phishing';
      } else if (score > 0.3) {
        label = 'suspicious';  
      } else {
        label = 'safe';
      }
      
      return {
        label,
        confidence,
        score,
        weight: model.weight,
        reasoning: `${model.name} detected ${label} with ${confidence}% confidence`
      };
      
    } catch (parseError) {
      throw new Error(`Failed to parse response: ${parseError.message}`);
    }
  }

  /**
   * Combine results from multiple models using weighted voting
   * @param {Array} results - Array of model results
   * @returns {Object} Combined ensemble result
   */
  combineModelResults(results) {
    let weightedScore = 0;
    let totalWeight = 0;
    const modelDetails = [];
    
    // Calculate weighted average
    for (const result of results) {
      const weight = result.weight || 1.0;
      weightedScore += result.score * weight;
      totalWeight += weight;
      modelDetails.push({
        model: result.model,
        label: result.label,
        confidence: result.confidence,
        weight: weight
      });
    }
    
    const finalScore = weightedScore / totalWeight;
    const finalConfidence = Math.round(finalScore * 100);
    
    let finalLabel = 'safe';
    if (finalScore > 0.7) {
      finalLabel = 'phishing';
    } else if (finalScore > 0.3) {
      finalLabel = 'suspicious';
    }
    
    return {
      label: finalLabel,
      confidence: finalConfidence,
      reasoning: `Ensemble of ${results.length} models: ${finalLabel} (${finalConfidence}% confidence)`,
      ensembleDetails: {
        modelsUsed: results.length,
        weightedScore: finalScore,
        modelResults: modelDetails
      }
    };
  }

  /**
   * Try to analyze with OpenAI (if API key available)
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} OpenAI analysis results
   */
  async analyzeWithOpenAI(text) {
    if (!this.openaiApiKey) {
      throw new Error('AI model not available');
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Analyze this text for phishing/scam indicators. Respond only with a JSON object containing: {"label": "safe|suspicious|phishing", "confidence": 1-100, "reasoning": "brief explanation"}. Text: "${text}"`
      }],
      max_tokens: 100,
      temperature: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  }

  /**
   * Simple sentiment analysis
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Sentiment results
   */
  async analyzeSentiment(text) {
    // Simple word-based sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'urgent', 'suspended', 'blocked', 'error'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    let sentiment = 'neutral';
    let confidence = 50;
    
    if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(80, 50 + (negativeCount - positiveCount) * 10);
    } else if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(80, 50 + (positiveCount - negativeCount) * 10);
    }
    
    return {
      sentiment,
      confidence: Math.round(confidence),
      positiveWords: positiveCount,
      negativeWords: negativeCount
    };
  }

  /**
   * Simple domain reputation check
   * @param {string} url - URL to check
   * @returns {Promise<Object>} Reputation results
   */
  async checkDomainReputation(url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // List of known safe domains
      const safeDomains = [
        'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
        'linkedin.com', 'github.com', 'stackoverflow.com', 'wikipedia.org', 'reddit.com'
      ];
      
      if (safeDomains.some(safeDomain => domain.endsWith(safeDomain))) {
        return {
          reputation: 'good',
          confidence: 90,
          source: 'known-safe-list'
        };
      }
      
      return {
        reputation: 'unknown',
        confidence: 50,
        source: 'no-data'
      };
      
    } catch (error) {
      return {
        reputation: 'suspicious',
        confidence: 70,
        source: 'invalid-url'
      };
    }
  }

  /**
   * Combine multiple text analysis results
   * @param {Object} patternResult - Pattern analysis results
   * @param {Object} aiResult - AI analysis results
   * @param {Object} sentimentResult - Sentiment analysis results
   * @returns {Object} Combined results
   */
  combineResults(patternResult, aiResult, sentimentResult) {
    let finalLabel = patternResult.label;
    let finalConfidence = patternResult.confidence;
    
    // If we have AI results, give them higher weight
    if (aiResult) {
      finalConfidence = Math.round((patternResult.confidence + aiResult.confidence * 1.5) / 2.5);
      
      // If AI and pattern agree, increase confidence
      if (aiResult.label === patternResult.label) {
        finalConfidence = Math.min(95, finalConfidence + 10);
      }
      
      // AI result takes precedence if significantly different
      if (aiResult.confidence > 80 && aiResult.confidence > patternResult.confidence + 20) {
        finalLabel = aiResult.label;
      }
    }
    
    // Negative sentiment increases suspicion
    if (sentimentResult && sentimentResult.sentiment === 'negative' && sentimentResult.confidence > 70) {
      if (finalLabel === 'safe') finalLabel = 'suspicious';
      finalConfidence = Math.min(95, finalConfidence + 5);
    }
    
    return {
      label: finalLabel,
      confidence: finalConfidence,
      riskLevel: finalLabel === 'phishing' ? 'high' : finalLabel === 'suspicious' ? 'medium' : 'low',
      message: `Reliable analysis: ${finalLabel} content detected`,
      details: {
        patternAnalysis: patternResult,
        aiAnalysis: aiResult,
        sentimentAnalysis: sentimentResult,
        method: 'combined-analysis'
      }
    };
  }

  /**
   * Combine URL analysis results
   * @param {Object} patternResult - Pattern analysis results
   * @param {Object} reputationResult - Reputation check results
   * @returns {Object} Combined results
   */
  combineUrlResults(patternResult, reputationResult) {
    let finalStatus = patternResult.status;
    let finalConfidence = patternResult.confidence;
    
    if (reputationResult) {
      if (reputationResult.reputation === 'good' && reputationResult.confidence > 80) {
        finalStatus = 'clean';
        finalConfidence = Math.max(finalConfidence, reputationResult.confidence);
      } else if (reputationResult.reputation === 'suspicious') {
        if (finalStatus === 'clean') finalStatus = 'suspicious';
        finalConfidence = Math.min(95, finalConfidence + 10);
      }
    }
    
    return {
      status: finalStatus,
      confidence: finalConfidence,
      message: `Reliable URL analysis: ${finalStatus} URL detected`,
      details: {
        patternAnalysis: patternResult,
        reputationCheck: reputationResult,
        method: 'combined-analysis'
      }
    };
  }

  /**
   * Check if service is available
   * @returns {boolean} Always true (pattern analysis always works)
   */
  isAvailable() {
    return true; // Pattern analysis always works
  }
}

module.exports = new ReliableAiService();