import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../utils/api';

/**
 * VerifyContent Page Component
 * 
 * Form for submitting content (text/URL) for AI verification.
 * Displays results with trust score and saves content ID in state.
 */
const VerifyContent = () => {
  // Form state
  const [formData, setFormData] = useState({
    text: '',
    url: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'url'

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }

    // Clear result when form changes
    if (result) {
      setResult(null);
    }
  };

  /**
   * Handle tab switching
   */
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setFormData({ text: '', url: '' });
    setError('');
    setResult(null);
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    if (activeTab === 'text') {
      if (!formData.text.trim()) {
        return 'Please enter some text to verify';
      }
      if (formData.text.trim().length < 10) {
        return 'Text must be at least 10 characters long';
      }
    } else if (activeTab === 'url') {
      if (!formData.url.trim()) {
        return 'Please enter a URL to verify';
      }
      if (!isValidUrl(formData.url.trim())) {
        return 'Please enter a valid URL (must start with http:// or https://)';
      }
    }
    return null;
  };

  /**
   * Check if URL is valid
   */
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // Prepare submission data
      const submissionData = {};
      
      if (activeTab === 'text') {
        submissionData.text = formData.text.trim();
      } else if (activeTab === 'url') {
        submissionData.url = formData.url.trim();
        submissionData.text = `Content verification for URL: ${formData.url.trim()}`;
      }

      // Make API call
      const response = await contentAPI.verifyContent(submissionData);

      if (response.data.success) {
        setResult(response.data.data.content);
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(
        err.response?.data?.message || 
        'Verification failed. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setFormData({ text: '', url: '' });
    setResult(null);
    setError('');
  };

  /**
   * Get trust score color class
   */
  const getTrustScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verify Content
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Submit text content or URLs for AI-powered verification. 
            Get instant trust scores and detailed analysis to help you 
            assess the credibility of information.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => handleTabSwitch('text')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'text'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Text Content
                </div>
              </button>
              <button
                onClick={() => handleTabSwitch('url')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'url'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  URL Verification
                </div>
              </button>
            </nav>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Form Fields */}
            {activeTab === 'text' && (
              <div className="mb-6">
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                  Text Content
                </label>
                <textarea
                  id="text"
                  name="text"
                  rows={8}
                  value={formData.text}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Paste the text content you want to verify here..."
                  disabled={loading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum 10 characters required. Maximum 10,000 characters.
                </p>
              </div>
            )}

            {activeTab === 'url' && (
              <div className="mb-6">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  URL to Verify
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/article-to-verify"
                  disabled={loading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a valid URL starting with http:// or https://
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                } transition-colors duration-200`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify Content
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex-1 sm:flex-none py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Verification Results
            </h2>
            
            {/* Trust Score */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Trust Score</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTrustScoreColor(result.trustScore)}`}>
                  {result.trustScore}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    result.trustScore >= 70 ? 'bg-green-500' :
                    result.trustScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.trustScore}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                {result.trustScore >= 70 && 'High trustworthiness - Content appears reliable'}
                {result.trustScore >= 40 && result.trustScore < 70 && 'Moderate trustworthiness - Exercise caution'}
                {result.trustScore < 40 && 'Low trustworthiness - Content may be unreliable'}
              </p>
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Verified Content</h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {result.text.substring(0, 200)}
                  {result.text.length > 200 && '...'}
                </p>
              </div>

              {result.url && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Source URL</h3>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 break-all"
                  >
                    {result.url}
                  </a>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Analysis</h3>
                <p className="text-sm text-gray-600">
                  {result.aiAnalysis || 'AI analysis completed successfully.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Verified on {new Date(result.createdAt).toLocaleString()}
                </span>
                <div className="flex space-x-2">
                  <Link
                    to={`/history`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View in History
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How Verification Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Trust Score</h4>
              <p className="text-sm text-blue-700">
                Our AI analyzes multiple factors including source credibility, 
                content patterns, and contextual accuracy to generate a trust score from 0-100%.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Content Types</h4>
              <p className="text-sm text-blue-700">
                You can verify both direct text content and URLs. 
                Our system analyzes the content structure, sources, and reliability indicators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyContent;