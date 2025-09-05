# 🚨 VeriScope Deployment Troubleshooting Guide

## Strategic Zero-Cost Deployment Plan

### Phase 1: Pre-Deployment Verification ✅

1. **Local Environment Check**
   ```bash
   # Verify both servers are running
   # Frontend: http://localhost:3000 ✅
   # Backend: http://localhost:5000/api/health ✅
   ```

2. **Code Repository Check**
   ```bash
   git status
   git add .
   git commit -m "Pre-deployment verification"
   git push origin main
   ```

### Phase 2: Common Deployment Failure Points

#### MongoDB Atlas Issues (Most Common)
- ❌ **Connection String Format**: Wrong format or missing database name
- ❌ **Network Access**: Not allowing 0.0.0.0/0
- ❌ **User Permissions**: Database user lacks read/write access
- ❌ **Password Special Characters**: Unescaped characters in password

#### Render Backend Issues
- ❌ **Environment Variables**: Missing or incorrect values
- ❌ **Build Command**: Wrong Node.js version or missing dependencies
- ❌ **Port Configuration**: Not using process.env.PORT
- ❌ **Start Command**: Incorrect npm script

#### Vercel Frontend Issues
- ❌ **API URL**: Wrong backend URL in REACT_APP_API_URL
- ❌ **Build Directory**: Not pointing to correct build folder
- ❌ **Environment Variables**: Missing in production

### Phase 3: Step-by-Step Verification

#### Step 1: MongoDB Atlas Verification
```bash
# Test connection string locally first
# Update backend/.env with Atlas connection string
# Run: cd backend && npm start
# Check console for "MongoDB Connected" message
```

#### Step 2: GitHub Repository Setup
```bash
# Ensure code is pushed to GitHub
git remote -v
git status
git push origin main
```

#### Step 3: Render Deployment
```bash
# Manual verification checklist:
# ✅ Service created from GitHub repo
# ✅ Root directory set to "backend"
# ✅ Build command: "npm install"
# ✅ Start command: "npm start"
# ✅ Environment variables added
# ✅ Service shows "Live" status
```

#### Step 4: Test Backend Independently
```bash
# Test your Render backend URL
curl https://YOUR-SERVICE-NAME.onrender.com/api/health
```

#### Step 5: Vercel Deployment
```bash
# Manual verification checklist:
# ✅ Project imported from GitHub
# ✅ Root directory set to "frontend" 
# ✅ Framework preset: Create React App
# ✅ REACT_APP_API_URL points to Render backend
# ✅ Build successful
```

### Phase 4: Debugging Commands

#### Test MongoDB Connection
```bash
# In backend directory
node -e "
const mongoose = require('mongoose');
mongoose.connect('YOUR_ATLAS_CONNECTION_STRING')
  .then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err.message));
"
```

#### Test API Endpoints
```bash
# Health check
curl -X GET https://YOUR-BACKEND.onrender.com/api/health

# Register test user
curl -X POST https://YOUR-BACKEND.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

### Phase 5: Quick Fix Strategies

#### If MongoDB Connection Fails:
1. Recreate connection string from Atlas dashboard
2. Ensure password is URL-encoded
3. Add `/veriscope` database name before the `?`
4. Check Network Access allows 0.0.0.0/0

#### If Render Build Fails:
1. Check Node.js version compatibility
2. Verify package.json has all dependencies
3. Ensure PORT is set to process.env.PORT || 5000

#### If Vercel Build Fails:
1. Check React build works locally: `npm run build`
2. Verify REACT_APP_API_URL is set correctly
3. Ensure no TypeScript errors

#### If CORS Errors Occur:
1. Update CLIENT_URL in Render environment variables
2. Redeploy backend service
3. Test with curl first, then browser

### Phase 6: Emergency Rollback Plan

If deployment fails completely:
```bash
# Option 1: Use alternative free services
# - Railway (backend)
# - Netlify (frontend)
# - PlanetScale (database)

# Option 2: Local tunneling for testing
# - Use ngrok for temporary public URLs
# - Test with real domain before final deployment
```

### Deployment Success Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Backend deployed to Render and responding to /api/health
- [ ] Frontend deployed to Vercel and loading correctly
- [ ] Authentication flow working end-to-end
- [ ] CORS configured correctly
- [ ] All environment variables set
- [ ] Demo accounts accessible

### Emergency Contacts & Resources

- Render Status: https://status.render.com/
- Vercel Status: https://www.vercel-status.com/
- MongoDB Atlas Support: https://docs.atlas.mongodb.com/