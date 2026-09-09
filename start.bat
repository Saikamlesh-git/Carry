@echo off
echo ===================================================
echo Starting Carry B2B Ordering Platform
echo ===================================================

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Carry Backend" cmd /k "cd backend && python run.py"

echo [2/2] Starting Vite React Frontend on http://127.0.0.1:5173 ...
start "Carry Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Carry is launching!
echo Public Storefront: http://127.0.0.1:5173/
echo Admin Console:     http://127.0.0.1:5173/admin
echo Admin User:        MOHAN
echo ===================================================
