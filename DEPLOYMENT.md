# 🚀 VeriScope Deployment Guide

Complete step-by-step guide to deploy your MERN stack application for **FREE**.

## 📋 **Prerequisites**

- GitHub account
- MongoDB Atlas account (free)
- Render account (free)  
- Vercel account (free)

---

## 🗃️ **Step 1: MongoDB Atlas Setup**

### 1.1 Create MongoDB Atlas Account
```bash
# 1. Go to: https://www.mongodb.com/cloud/atlas
# 2. Sign up for free account
# 3. Verify email
# 4. Create organization: "VeriScope"
# 5. Create project: "veriscope-production"
```

### 1.2 Create Free Cluster
```bash
# In Atlas Dashboard:
# 1. Click "Build a Database"
# 2. Choose "M0 Sandbox" (FREE - $0/month forever)
# 3. Provider: AWS (recommended)
# 4. Region: Choose closest to you
# 5. Cluster Name: "veriscope-cluster"
# 6. Click "Create Cluster" (takes 3-5 minutes)
```

### 1.3 Create Database User
```bash
# 1. Go to "Database Access" in left sidebar
# 2. Click "Add New Database User"
# 3. Authentication Method: Password
# 4. Username: veriscope-user
# 5. Password: Click "Autogenerate Secure Password" (SAVE THIS!)
# 6. Database User Privileges: "Read and write to any database"
# 7. Click "Add User"
```

### 1.4 Configure Network Access
```bash
# 1. Go to "Network Access" in left sidebar
# 2. Click "Add IP Address"
# 3. Click "Allow Access from Anywhere" 
# 4. Confirm with "0.0.0.0/0" (needed for Render)
# 5. Comment: "Production deployment access"
# 6. Click "Confirm"
```

### 1.5 Get Connection String
```bash
# 1. Go to "Database" in left sidebar  
# 2. Click "Connect" on your cluster
# 3. Choose "Connect your application"
# 4. Driver: Node.js, Version: 5.5 or later
# 5. Copy connection string (looks like):
#    mongodb+srv://veriscope-user:<password>@veriscope-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
# 6. Replace <password> with your actual password
# 7. Add database name: /veriscope before the ?
# 8. SAVE THIS - you'll need it for Render!
```

---

## 🎯 **Step 2: Prepare Your Code**

### 2.1 Commit Your Code to GitHub
```bash
# Initialize git repository (if not already done)
cd C:\veriscope
git init
git add .
git commit -m "Initial deployment setup"

# Create GitHub repository
# 1. Go to https://github.com/new
# 2. Repository name: veriscope
# 3. Make it Public (required for free plans)
# 4. Don't initialize with README (you already have code)
# 5. Click "Create repository"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/veriscope.git
git branch -M main
git push -u origin main
```

### 2.2 Update Environment Files

**Backend (.env for production):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://veriscope-user:YOUR_PASSWORD@veriscope-cluster.xxxxx.mongodb.net/veriscope?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-generate-this
CLIENT_URL=https://veriscope-YOUR_USERNAME.vercel.app
```

**Frontend (.env.production):**
```env
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://veriscope-backend-YOUR_USERNAME.onrender.com/api
```

---

## 🖥️ **Step 3: Deploy Backend to Render**

### 3.1 Create Render Account
```bash
# 1. Go to: https://render.com
# 2. Sign up with GitHub (recommended)
# 3. Authorize Render to access your repositories
```

### 3.2 Deploy Backend Service
```bash
# 1. In Render Dashboard, click "New +"
# 2. Choose "Web Service"
# 3. Connect your GitHub repository: "veriscope"
# 4. Configure service:
#    - Name: veriscope-backend
#    - Environment: Node
#    - Region: Oregon (US West) - fastest free region
#    - Branch: main
#    - Root Directory: backend
#    - Build Command: npm install
#    - Start Command: npm start
#    - Instance Type: Free ($0/month)
```

### 3.3 Set Environment Variables in Render
```bash
# In your service dashboard:
# 1. Go to "Environment" tab
# 2. Add these variables:

NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://veriscope-user:YOUR_PASSWORD@veriscope-cluster.xxxxx.mongodb.net/veriscope?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-here
CLIENT_URL=https://veriscope-YOUR_USERNAME.vercel.app

# 3. Click "Save Changes"
# 4. Service will automatically redeploy
```

### 3.4 Verify Backend Deployment
```bash
# Your backend will be available at:
# https://veriscope-backend-YOUR_USERNAME.onrender.com

# Test health endpoint:
curl https://veriscope-backend-YOUR_USERNAME.onrender.com/api/health

# Should return:
# {"success":true,"message":"VeriScope API is running","data":{"uptime":"...","environment":"production"}}
```

---

## 🌐 **Step 4: Deploy Frontend to Vercel**

### 4.1 Create Vercel Account
```bash
# 1. Go to: https://vercel.com
# 2. Sign up with GitHub (recommended)
# 3. Authorize Vercel to access your repositories
```

### 4.2 Deploy Frontend
```bash
# 1. In Vercel Dashboard, click "New Project"
# 2. Import your GitHub repository: "veriscope"
# 3. Configure project:
#    - Framework Preset: Create React App
#    - Root Directory: frontend
#    - Build Command: npm run build
#    - Output Directory: build
#    - Install Command: npm install
```

### 4.3 Set Environment Variables in Vercel
```bash
# 1. Go to project settings
# 2. Click "Environment Variables" tab
# 3. Add:

Name: REACT_APP_API_URL
Value: https://veriscope-backend-YOUR_USERNAME.onrender.com/api
Environment: Production

# 4. Click "Save"
# 5. Go to "Deployments" tab and click "Redeploy"
```

### 4.4 Custom Domain (Optional)
```bash
# 1. Go to project settings
# 2. Click "Domains" tab  
# 3. Your app is available at: veriscope-YOUR_USERNAME.vercel.app
# 4. You can add custom domain if you have one
```

---

## 🔧 **Step 5: Final Configuration**

### 5.1 Update CORS in Backend
```bash
# Update CLIENT_URL in Render environment variables:
CLIENT_URL=https://veriscope-YOUR_USERNAME.vercel.app

# Redeploy backend service in Render
```

### 5.2 Seed Database with Demo Users
```bash
# Option 1: Trigger via API call
curl -X POST https://veriscope-backend-YOUR_USERNAME.onrender.com/api/seed

# Option 2: Run seed script manually in Render console
# (if you added a seed endpoint)
```

---

## 🧪 **Step 6: Testing Your Live Deployment**

### 6.1 Test Backend API
```bash
# Health check
curl https://veriscope-backend-YOUR_USERNAME.onrender.com/api/health

# Register new user
curl -X POST https://veriscope-backend-YOUR_USERNAME.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login with demo account
curl -X POST https://veriscope-backend-YOUR_USERNAME.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@veriscope.com","password":"demo123"}'
```

### 6.2 Test Frontend Application
```bash
# 1. Visit: https://veriscope-YOUR_USERNAME.vercel.app
# 2. Try dark mode toggle
# 3. Register new account
# 4. Login with demo accounts:
#    - Email: demo@veriscope.com, Password: demo123
#    - Email: test@veriscope.com, Password: test123
# 5. Test all features
```

---

## 🚨 **Troubleshooting**

### Backend Issues
```bash
# Check logs in Render:
# 1. Go to your service dashboard
# 2. Click "Logs" tab
# 3. Look for errors

# Common issues:
# - MongoDB connection string incorrect
# - Environment variables not set
# - CORS blocking frontend requests
```

### Frontend Issues  
```bash
# Check browser console for errors
# Common issues:
# - API URL incorrect in REACT_APP_API_URL
# - Build failing due to TypeScript errors
# - CORS issues (check backend logs)
```

### Database Issues
```bash
# Check MongoDB Atlas:
# 1. Network Access allows 0.0.0.0/0
# 2. Database user has correct permissions
# 3. Connection string is correct
# 4. Password doesn't contain special characters that need encoding
```

---

## 💡 **Production Tips**

### Performance
- **Render free tier**: 512MB RAM, sleeps after 15min inactivity
- **Vercel free tier**: Unlimited static hosting, serverless functions
- **MongoDB Atlas free tier**: 512MB storage

### Security
- Use strong JWT secrets (32+ characters)
- Enable MongoDB IP whitelist in production
- Use environment variables for all secrets
- Enable HTTPS (automatic on Render/Vercel)

### Monitoring
- Check Render service logs regularly
- Monitor MongoDB Atlas metrics
- Set up Vercel analytics (free tier available)

---

## 🎉 **Success!**

Your MERN stack application is now live:

- **Frontend**: https://veriscope-YOUR_USERNAME.vercel.app
- **Backend**: https://veriscope-backend-YOUR_USERNAME.onrender.com
- **Database**: MongoDB Atlas (cloud)

**Total cost: $0/month** 🎊

---

## 📞 **Need Help?**

- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs  
- MongoDB Atlas docs: https://docs.atlas.mongodb.com