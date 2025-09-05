@echo off
echo 🚀 Starting VeriScope Development Servers...
echo.

echo 📊 Starting Backend Server (Port 5000)...
start "VeriScope Backend" cmd /k "cd backend && npm start"

echo ⏳ Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo 🌐 Starting Frontend Server (Port 3000)...
start "VeriScope Frontend" cmd /k "cd frontend && npm start"

echo.
echo ✅ Both servers are starting!
echo 🌐 Frontend: http://localhost:3000
echo 📊 Backend API: http://localhost:5000/api
echo 🏥 Health Check: http://localhost:5000/api/health
echo.
echo Demo Accounts:
echo • Email: demo@veriscope.com, Password: demo123
echo • Email: test@veriscope.com, Password: test123
echo.
echo Press any key to close this window...
pause > nul