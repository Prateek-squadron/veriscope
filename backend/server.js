/**
 * VeriScope Backend Server
 * Main entry point for the Express.js application
 */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Initialize Express application
const app = express();
// AI integration restart trigger

// Connect to MongoDB database
connectDB();

// Middleware setup
// Enable CORS for cross-origin requests (important for frontend integration)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  process.env.CLIENT_URL,
  // Add your Vercel domain here when deployed
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow cookies and authorization headers
}));

// Body parsing middleware (parse JSON requests)
app.use(express.json({ limit: '10mb' })); // Limit request size for security
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyToLog = { ...req.body };
      // Hide password for security
      if (bodyToLog.password) bodyToLog.password = '***';
      console.log(`📦 Request Body:`, bodyToLog);
    }
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);      // Authentication routes: /api/auth/*
app.use('/api/content', contentRoutes);  // Content verification routes: /api/content/*
app.use('/api/ai', aiRoutes);          // AI analysis routes: /api/ai/*

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'VeriScope API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation endpoint
app.get('/api', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to VeriScope API',
    version: '1.0.0',
    endpoints: {
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile'
      },
      content: {
        verify: 'POST /api/content/verify',
        getResult: 'GET /api/content/:id',
        history: 'GET /api/content/history',
        delete: 'DELETE /api/content/:id'
      },
      aiScanning: {
        scan: 'POST /api/content/scan',
        getScanResult: 'GET /api/content/scan/:id',
        scanHistory: 'GET /api/content/scan/history',
        scanStats: 'GET /api/content/scan/stats',
        deleteScan: 'DELETE /api/content/scan/:id'
      },
      utility: {
        health: 'GET /api/health',
        docs: 'GET /api'
      }
    }
  });
});

// Error handling middleware (must be after all routes)
app.use(notFound);      // Handle 404 errors for undefined routes
app.use(errorHandler);   // Global error handler

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 VeriScope Backend Server Started
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server running on port ${PORT}
📊 API endpoint: http://localhost:${PORT}/api
🏥 Health check: http://localhost:${PORT}/api/health
  `);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;