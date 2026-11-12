@echo off
title EmotiLearn Launcher
cd /d "%~dp0"

echo ===================================================
echo     Starting EmotiLearn Full Stack Platform
echo ===================================================
echo.

echo [1/2] Launching Backend Server (Flask on :5000)...
start "EmotiLearn Backend (Flask :5000)" cmd /k "backend\venv\Scripts\python.exe backend\app.py"

echo [2/2] Launching Frontend Server (React on :3000)...
start "EmotiLearn Frontend (React :3000)" cmd /k "cd /d "%~dp0frontend\client" && npm.cmd start"

echo.
echo Both servers initiated!
echo Waiting a moment before opening your browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ===================================================
echo  System running! Keep the terminal windows open.
echo  To stop everything, run stop.bat
echo ===================================================
