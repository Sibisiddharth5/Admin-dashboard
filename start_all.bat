@echo off
echo ========================================
echo    Admin Dashboard - Full Stack
echo ========================================
echo.
echo Starting both Backend and Frontend...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000 (Vite)
echo.
echo Press Ctrl+C to stop all services
echo.

start "Backend Server" cmd /k "cd backend && python main.py"
timeout /t 3 /nobreak > nul
start "Frontend Server" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000 (Vite - Fast!)
echo API Docs: http://localhost:8000/docs
echo.
pause