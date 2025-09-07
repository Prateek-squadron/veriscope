# 🚀 Production Deployment Setup Guide

## Issues Fixed for Production

### 1. Frontend API URL Configuration
- **Problem**: Frontend `.env.production` had placeholder URL `https://your-backend-app-name.onrender.com/api`
- **Fix**: Updated to use proper Render service name: `https://veriscope-backend.onrender.com/api`

### 2. CORS Configuration
- **Problem**: Backend CORS only allowed localhost, blocking production frontend
- **Fix**: Added Vercel deployment domains to allowed origins with regex pattern matching

### 3. Environment Variables
- **Problem**: Render deployment had missing/incorrect environment variables
- **Fix**: Updated `render.yaml` with proper PORT and CLIENT_URL settings

## Production Deployment Steps

### Step 1: Deploy Backend to Render

1. **Create Render Account**: Go to [render.com](https://render.com)

2. **Connect GitHub**: Link your GitHub account to Render

3. **Create Web Service**:
   - Service Name: `veriscope-backend`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Health Check Path: `/api/health`

4. **Set Environment Variables** in Render Dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://veriscope-user:5TevzFyzzvmm3RBN@veriscope-cluster.xlyfvx5.mongodb.net/veriscope?retryWrites=true&w=majority&appName=veriscope-cluster
   JWT_SECRET=veriscope_super_secret_jwt_key_2024_make_it_long_and_complex_for_security
   CLIENT_URL=https://veriscope.vercel.app
   ```

5. **Deploy**: Render will automatically deploy from your GitHub repository

### Step 2: Deploy Frontend to Vercel

1. **Connect GitHub**: Go to [vercel.com](https://vercel.com) and connect GitHub

2. **Import Project**: Import the `veriscope` repository

3. **Configure Build Settings**:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/build`
   - Install Command: `cd frontend && npm install`

4. **Set Environment Variables** in Vercel Dashboard:
   ```
   REACT_APP_API_URL=https://veriscope-backend.onrender.com/api
   ```

5. **Deploy**: Vercel will build and deploy automatically

### Step 3: Update URLs

Once deployed, update the configuration files with actual URLs:

**Frontend** (`.env.production`):
```
REACT_APP_API_URL=https://your-actual-render-url.onrender.com/api
```

**Backend** (`render.yaml`):
```yaml
CLIENT_URL: https://your-actual-vercel-url.vercel.app
```

## Testing Production Deployment

### 1. Backend Health Check
Visit: `https://veriscope-backend.onrender.com/api/health`

Should return:
```json
{
  "success": true,
  "message": "VeriScope API is running",
  "timestamp": "2025-09-07T...",
  "environment": "production"
}
```

### 2. Frontend Application
Visit: `https://veriscope.vercel.app`

### 3. Registration/Login Test
1. Go to registration page
2. Fill out form with new user details
3. Check browser console for any CORS errors
4. Verify successful registration and redirect to dashboard

## Troubleshooting

### CORS Errors
- Check that Vercel URL is included in backend CORS configuration
- Verify CLIENT_URL environment variable in Render
- Check browser console for specific CORS error messages

### API Connection Errors
- Verify backend is deployed and accessible at health check endpoint
- Check REACT_APP_API_URL in frontend environment variables
- Ensure backend MongoDB connection is working

### Authentication Issues
- Verify JWT_SECRET is set in Render environment
- Check that MongoDB URI is correct and database is accessible
- Test login with demo accounts

## Demo Accounts
```
Email: demo@veriscope.com, Password: demo123
Email: test@veriscope.com, Password: test123
```