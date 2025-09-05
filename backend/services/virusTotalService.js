const axios = require('axios');

/**
 * VirusTotal API Service
 * Provides URL scanning functionality using VirusTotal's free API
 * Requires VIRUSTOTAL_API_KEY in environment variables
 */
class VirusTotalService {
  constructor() {
    this.apiKey = process.env.VIRUSTOTAL_API_KEY;
    this.baseUrl = 'https://www.virustotal.com/api/v3';
    
    if (!this.apiKey) {
      console.warn('⚠️  VIRUSTOTAL_API_KEY not found in environment variables');
    }
  }

  /**
   * Submit URL for analysis to VirusTotal
   * @param {string} url - URL to scan
   * @returns {Promise<string>} Analysis ID for checking results
   */
  async submitUrl(url) {
    if (!this.apiKey) {
      throw new Error('VirusTotal API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/urls`,
        `url=${encodeURIComponent(url)}`,
        {
          headers: {
            'x-apikey': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );

      return response.data.data.id;
    } catch (error) {
      if (error.response?.status === 429) {
        // API quota exceeded
        throw new Error('VirusTotal API quota exceeded');
      }
      
      console.error('VirusTotal URL submission error:', error.message);
      throw new Error(`VirusTotal API error: ${error.message}`);
    }
  }

  /**
   * Get analysis results from VirusTotal
   * @param {string} analysisId - Analysis ID from submitUrl
   * @returns {Promise<Object>} Analysis results
   */
  async getAnalysis(analysisId) {
    if (!this.apiKey) {
      throw new Error('VirusTotal API key not configured');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/analyses/${analysisId}`,
        {
          headers: {
            'x-apikey': this.apiKey
          },
          timeout: 10000
        }
      );

      return response.data.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('VirusTotal API quota exceeded');
      }
      
      console.error('VirusTotal analysis retrieval error:', error.message);
      throw new Error(`VirusTotal API error: ${error.message}`);
    }
  }

  /**
   * Scan URL and return results (combines submit + get analysis)
   * @param {string} url - URL to scan
   * @returns {Promise<Object>} Scan results with status and confidence
   */
  async scanUrl(url) {
    try {
      // Submit URL for analysis
      const analysisId = await this.submitUrl(url);
      
      // Wait a moment for analysis to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get analysis results (may need to retry if still processing)
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        try {
          const analysis = await this.getAnalysis(analysisId);
          
          if (analysis.attributes.status === 'completed') {
            return this.parseAnalysisResults(analysis);
          }
          
          // Wait before retry if still processing
          await new Promise(resolve => setTimeout(resolve, 3000));
          attempts++;
        } catch (error) {
          if (error.message.includes('quota exceeded')) {
            return this.getFallbackResponse();
          }
          throw error;
        }
      }
      
      // If still processing after max attempts, return partial result
      return {
        status: 'processing',
        confidence: 50,
        message: 'Analysis still in progress'
      };
      
    } catch (error) {
      console.error('VirusTotal scan error:', error.message);
      
      if (error.message.includes('quota exceeded')) {
        return this.getFallbackResponse();
      }
      
      // Return error response
      return {
        status: 'error',
        confidence: 0,
        message: `Scan failed: ${error.message}`
      };
    }
  }

  /**
   * Parse VirusTotal analysis results into standardized format
   * @param {Object} analysis - Raw analysis data from VirusTotal
   * @returns {Object} Parsed results
   */
  parseAnalysisResults(analysis) {
    const stats = analysis.attributes.stats;
    const totalEngines = Object.values(stats).reduce((sum, count) => sum + count, 0);
    
    if (totalEngines === 0) {
      return {
        status: 'unknown',
        confidence: 50,
        message: 'No scan results available'
      };
    }
    
    const maliciousCount = stats.malicious || 0;
    const suspiciousCount = stats.suspicious || 0;
    const harmlessCount = stats.harmless || 0;
    
    // Calculate threat level
    const threatRatio = (maliciousCount + suspiciousCount) / totalEngines;
    
    let status, confidence;
    
    if (maliciousCount > 0) {
      status = 'malicious';
      confidence = Math.min(95, 70 + (maliciousCount / totalEngines) * 25);
    } else if (suspiciousCount > 2) {
      status = 'suspicious';
      confidence = Math.min(85, 60 + (suspiciousCount / totalEngines) * 25);
    } else if (harmlessCount > totalEngines * 0.8) {
      status = 'clean';
      confidence = Math.min(95, 80 + (harmlessCount / totalEngines) * 15);
    } else {
      status = 'unknown';
      confidence = 50;
    }
    
    return {
      status,
      confidence: Math.round(confidence),
      message: `Scanned by ${totalEngines} engines: ${maliciousCount} malicious, ${suspiciousCount} suspicious, ${harmlessCount} harmless`,
      details: {
        engines: totalEngines,
        malicious: maliciousCount,
        suspicious: suspiciousCount,
        harmless: harmlessCount,
        threatRatio: Math.round(threatRatio * 100)
      }
    };
  }

  /**
   * Fallback response when API quota is exceeded
   * @returns {Object} Fallback scan results
   */
  getFallbackResponse() {
    return {
      status: 'unknown',
      confidence: 70,
      message: 'VirusTotal API quota exceeded, using fallback detection',
      fallback: true
    };
  }

  /**
   * Check if VirusTotal service is available
   * @returns {boolean} Service availability
   */
  isAvailable() {
    return !!this.apiKey;
  }
}

module.exports = new VirusTotalService();