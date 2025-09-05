import axios from 'axios';

/**
 * Axios API utility for VeriScope frontend
 * Handles all HTTP requests with automatic JWT authentication
 */

// Create axios instance with base configuration
const getBaseURL = () => {
  // Production API URL from environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Development fallback
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // 15 seconds timeout for production
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to automatically attach JWT token
 * Gets token from localStorage and adds to Authorization header
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle common response scenarios
 * Automatically handles token expiration and authentication errors
 */
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token expired or invalid - clear localStorage and redirect to login
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login/register page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API calls
 */
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

/**
 * Content verification API calls
 */
export const contentAPI = {
  // Submit content for verification
  verifyContent: (contentData) => api.post('/content/verify', contentData),
  
  // Get verification result by ID
  getVerificationResult: (id) => api.get(`/content/${id}`),
  
  // Get user's verification history
  getHistory: (page = 1, limit = 10) => 
    api.get(`/content/history?page=${page}&limit=${limit}`),
  
  // Delete verification result
  deleteVerification: (id) => api.delete(`/content/${id}`),
};

/**
 * Utility API calls
 */
export const utilityAPI = {
  // Health check
  healthCheck: () => api.get('/health'),
  
  // Get API documentation
  getApiDocs: () => api.get('/'),
};

/**
 * Helper functions for token management
 */
export const tokenUtils = {
  // Save JWT token to localStorage
  saveToken: (token) => {
    localStorage.setItem('jwtToken', token);
  },
  
  // Get JWT token from localStorage
  getToken: () => {
    return localStorage.getItem('jwtToken');
  },
  
  // Remove JWT token from localStorage
  removeToken: () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('jwtToken');
    return !!token;
  },
};

/**
 * Helper functions for user data management
 */
export const userUtils = {
  // Save user data to localStorage
  saveUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
  },
  
  // Get user data from localStorage
  getUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  
  // Remove user data from localStorage
  removeUser: () => {
    localStorage.removeItem('user');
  },
};

export default api;