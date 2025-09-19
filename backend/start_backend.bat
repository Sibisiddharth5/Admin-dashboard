@echo off
echo Starting Admin Dashboard Backend...
echo.
echo Testing database connection...
python test_db.py
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Database connection failed!
    echo Please ensure MySQL/XAMPP is running and database exists.
    pause
    exit /b 1
)
echo.
echo Database connection verified!
echo.
echo Backend API: https://app.kambaa.ai
echo API Documentation: https://app.kambaa.ai/docs
echo.
python main.py