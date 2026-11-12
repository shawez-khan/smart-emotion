@echo off
title EmotiLearn Stopper
cd /d "%~dp0"

echo ===================================================
echo     Stopping EmotiLearn Servers
echo ===================================================
echo.

echo Terminating processes on Port 5000 (Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Terminating processes on Port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All EmotiLearn servers stopped cleanly!
timeout /t 2 >nul
