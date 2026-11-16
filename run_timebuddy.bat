@echo off
title Launch TimeBuddy
echo ========================================================
echo         Starting TimeBuddy Android Application
echo ========================================================
echo.

set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools;%PATH%"

echo [1/2] Launching Pixel 7 Android Emulator...
start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd Pixel_7_API_34

echo Waiting 10 seconds for emulator to start...
timeout /t 10 /nobreak >nul

echo.
echo [2/2] Starting TimeBuddy Expo App...
cd /d "C:\Users\HP\OneDrive\Desktop\app_2"
call npx expo start --android

pause

