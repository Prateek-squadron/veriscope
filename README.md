# 🔍 VeriScope - AI-Powered Content Verification Platform

A full-stack MERN application that helps users verify the trustworthiness of digital content using AI technology.

## ✨ Features

- **🔐 User Authentication**: Secure registration and login with JWT tokens
- **🌙 Dark Mode**: Beautiful light/dark theme toggle with localStorage persistence  
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🛡️ Content Verification**: AI-powered content analysis (backend ready)
- **📊 User Dashboard**: Track verification history and account management
- **🚀 Production Ready**: Configured for zero-cost deployment

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client with interceptors
- **React Router** - Client-side routing

### Backend  
- **Node.js & Express** - Server and API framework
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Deployment
- **MongoDB Atlas** - Cloud database (Free tier)
- **Render** - Backend hosting (Free tier)
- **Vercel** - Frontend hosting (Free tier)

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 16+ 
- MongoDB (local) or MongoDB Atlas
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/veriscope.git
cd veriscope

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install

# Go back to root
cd ..
```

### Environment Setup

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/veriscope
JWT_SECRET=your-jwt-secret-key
CLIENT_URL=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

**Option 1 - Use the startup script:**
```bash
# Windows
double-click start-dev.bat

# Or run manually:
./start-dev.bat
```

**Option 2 - Manual start:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

**Option 3 - VS Code:**
1. Open project in VS Code
2. Split terminal (Ctrl + Shift + `)
3. Left terminal: `cd backend && npm start`  
4. Right terminal: `cd frontend && npm start`

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### Demo Accounts
```
• Email: demo@veriscope.com, Password: demo123
• Email: test@veriscope.com, Password: test123
```

## 🌐 Production Deployment

Deploy your application completely **FREE** using:
- **Database**: MongoDB Atlas (Free M0 cluster)
- **Backend**: Render (Free tier)
- **Frontend**: Vercel (Free tier)

### Quick Deploy
```bash
# Run deployment preparation
./deploy.bat   # Windows
./deploy.sh    # Linux/Mac
```

### Detailed Deployment Guide
See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete step-by-step instructions.

## 📁 Project Structure

```
veriscope/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database and JWT config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   ├── .env               # Environment variables
│   ├── server.js          # Entry point
│   └── package.json
│
├── frontend/               # React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # API utilities
│   │   ├── App.jsx        # Main app component
│   │   └── index.js       # Entry point
│   ├── .env.production    # Production environment
│   └── package.json
│
├── render.yaml            # Render deployment config
├── vercel.json           # Vercel deployment config  
├── DEPLOYMENT.md         # Deployment guide
└── README.md            # This file
```

## 🧪 Testing

### Backend API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@veriscope.com","password":"demo123"}'
```

### Frontend Testing
1. Navigate to http://localhost:3000
2. Test dark mode toggle (top-right corner)
3. Register new account or login with demo account
4. Verify all pages and features work

## 🔧 Development Scripts

### Backend Scripts
```bash
cd backend
npm start          # Start production server
npm run dev        # Start with nodemon (development)
npm run seed       # Seed database with demo users
npm test           # Run tests (placeholder)
```

### Frontend Scripts
```bash  
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## 🌟 Key Features Implemented

### Authentication System
- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Protected routes and middleware
- ✅ Password hashing with bcryptjs
- ✅ Automatic token refresh handling

### UI/UX Features  
- ✅ Dark/Light mode toggle with persistence
- ✅ Responsive design for all screen sizes
- ✅ Loading states and error handling
- ✅ Form validation and user feedback
- ✅ Smooth transitions and animations

### Backend Features
- ✅ RESTful API with Express.js
- ✅ MongoDB integration with Mongoose
- ✅ CORS configuration for production
- ✅ Error handling middleware
- ✅ Request logging and monitoring
- ✅ Environment-based configuration

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs with salt rounds
- **CORS Protection** - Configured allowed origins
- **Environment Variables** - Secrets stored securely
- **Input Validation** - Server-side validation
- **HTTPS Ready** - Production deployment with SSL

## 🚨 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running locally
# Or verify Atlas connection string
```

**CORS Error in Browser:**
```bash
# Check CLIENT_URL in backend .env
# Verify frontend URL matches CORS settings
```

**Build Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port Already in Use:**
```bash
# Kill process on port 3000 or 5000
npx kill-port 3000
npx kill-port 5000
```

## 📈 Performance

### Free Tier Limitations
- **Render**: 512MB RAM, sleeps after 15min inactivity
- **Vercel**: Unlimited static hosting, 100GB bandwidth
- **MongoDB Atlas**: 512MB storage, shared cluster

### Optimization Tips
- Enable compression in Express
- Optimize React bundle size
- Use MongoDB indexing
- Implement caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📜 License

This project is licensed under the ISC License.

## 🎉 Acknowledgments

- **Create React App** - React application foundation
- **Express.js** - Fast, minimalist web framework
- **MongoDB Atlas** - Cloud database platform
- **Render** - Cloud application hosting
- **Vercel** - Frontend deployment platform
- **Tailwind CSS** - Utility-first CSS framework

---

**🚀 Ready to deploy? Check out [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete zero-cost deployment guide!**