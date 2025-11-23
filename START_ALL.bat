@echo off
echo ========================================
echo   FOODFAST - Starting All Services
echo ========================================
echo.

echo [1/3] Seeding Database...
cd backend
call node scripts/seedDatabase.js
echo.

echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
echo.

echo [3/4] Starting Customer Web...
cd ..\customer-web
start "Customer Web" cmd /k "npm run dev"
timeout /t 2 /nobreak > nul
echo.

echo [4/4] Starting Restaurant Web...
cd ..\restaurant-web
start "Restaurant Web" cmd /k "npm run dev"
echo.

echo ========================================
echo   All services started!
echo   Backend: http://localhost:5000
echo   Customer: http://localhost:5173
echo   Restaurant: http://localhost:3001
echo ========================================
echo.
echo Test Accounts:
echo   Customer: customer1@gmail.com / 123456
echo   Restaurant: phoviet@restaurant.com / 123456
echo   Admin: admin@foodfast.com / 123456
pause
