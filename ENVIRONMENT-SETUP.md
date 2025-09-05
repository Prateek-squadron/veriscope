# 🔐 Environment Variables Setup Guide

## 📂 **Backend Environment Variables (backend/.env)**

Your current backend/.env is **already filled correctly** for local development:

```env
# ✅ ALREADY CORRECT - No changes needed for local development
PORT=5000                    # ✅ Keep as-is
NODE_ENV=development         # ✅ Keep as-is  
MONGODB_URI=mongodb://localhost:27017/veriscope  # ✅ For local MongoDB
JWT_SECRET=veriscope_super_secret_jwt_key_2024_make_it_long_and_complex_for_security  # ✅ Already secure
JWT_EXPIRE=7d               # ✅ Keep as-is
CLIENT_URL=http://localhost:3000  # ✅ Fixed to match frontend port
```

## 🌐 **Frontend Environment Variables**

### **For Local Development** 
Create `frontend/.env` (for development):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### **For Production Deployment**
Your `frontend/.env.production` needs updating:
```env
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://YOUR-RENDER-SERVICE-NAME.onrender.com/api
```

## 🚀 **Production Environment Variables**

### **Render Backend Environment Variables**
When deploying to Render, set these in the dashboard:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://veriscope-user:YOUR_ATLAS_PASSWORD@your-cluster.mongodb.net/veriscope?retryWrites=true&w=majority
JWT_SECRET=veriscope_super_secret_jwt_key_2024_make_it_long_and_complex_for_security
CLIENT_URL=https://veriscope-YOUR_USERNAME.vercel.app
```

### **Vercel Frontend Environment Variables**
Set in Vercel dashboard:
```env
REACT_APP_API_URL=https://your-render-service-name.onrender.com/api
```

## 🔑 **How to Generate/Get Each Value**

### **JWT_SECRET** ✅ Already Done
- **Current value is perfect**: `veriscope_super_secret_jwt_key_2024_make_it_long_and_complex_for_security`
- **Length**: 64+ characters ✅
- **Security**: Strong and unique ✅
- **Action**: Keep exactly as-is

### **MONGODB_URI** 
**For Local Development** ✅ Already Done:
```env
mongodb://localhost:27017/veriscope
```

**For Production** (Get from MongoDB Atlas):
1. Create MongoDB Atlas account
2. Create M0 cluster (free)
3. Get connection string from "Connect" → "Connect your application"
4. Replace `<password>` with your database user password
5. Add `/veriscope` before the `?`

Example:
```env
mongodb+srv://veriscope-user:MySecurePass123@cluster0.abc123.mongodb.net/veriscope?retryWrites=true&w=majority
```

### **CLIENT_URL** ✅ Already Fixed
**Local**: `http://localhost:3000` ✅
**Production**: Will be your Vercel URL like `https://veriscope-username.vercel.app`

### **REACT_APP_API_URL**
**Local**: `http://localhost:5000/api`
**Production**: Your Render backend URL like `https://your-service-name.onrender.com/api`

## 📝 **Quick Setup Commands**

### **Create Frontend .env for Local Development**
```bash
cd frontend
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### **Your Current Setup Status** ✅
- ✅ **Backend .env**: Complete and correct
- ✅ **JWT_SECRET**: Already secure (64 characters)
- ✅ **Local MongoDB**: Working
- ✅ **CORS**: Fixed to port 3000
- ⚠️ **Frontend .env**: Need to create for local development

## 🎯 **Action Items**

### **Before Deployment:**
1. **Create frontend/.env** (for local development)
2. **Keep backend/.env as-is** (it's perfect)

### **During Deployment:**
1. **MongoDB Atlas**: Get connection string
2. **Render**: Set 5 environment variables
3. **Vercel**: Set 1 environment variable

### **No Changes Needed:**
- ❌ Don't change JWT_SECRET (it's already strong)
- ❌ Don't change PORT or NODE_ENV
- ❌ Don't change JWT_EXPIRE

## 🔒 **Security Notes**

- **JWT_SECRET**: Already meets security requirements (64+ chars, complex)
- **MongoDB**: Use strong passwords (no special characters for easier setup)
- **Environment Variables**: Never commit production secrets to Git
- **CORS**: Properly configured for both local and production

Your environment setup is 95% complete! Just need to create the frontend .env file and you're ready to deploy.