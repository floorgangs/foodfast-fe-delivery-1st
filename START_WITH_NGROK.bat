@echo off
echo ========================================
echo   FoodFast Backend + Ngrok Launcher
echo ========================================
echo.

REM Check if ngrok exists
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Ngrok chua duoc cai dat!
    echo.
    echo Tai ngrok tai: https://ngrok.com/download
    echo Hoac them ngrok.exe vao PATH
    echo.
    pause
    exit /b 1
)

echo [1/3] Starting Backend...
cd backend
start "FoodFast Backend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Ngrok...
start "FoodFast Ngrok" cmd /k "ngrok http 5000"

echo [3/3] Done!
echo.
echo ========================================
echo   Cac buoc tiep theo:
echo ========================================
echo 1. Doi 5-10s de backend khoi dong
echo 2. Vao cua so Ngrok, copy URL (VD: https://abc123.ngrok.io)
echo 3. Mo file: customer-mobile-app\src\services\api.ts
echo 4. Paste URL vao: const NGROK_URL = 'https://abc123.ngrok.io';
echo 5. Restart mobile app
echo.
echo Nhan Ctrl+C trong cac cua so de dung server
echo ========================================
pause
