@echo off
title CAREONIX - Stop All Services
echo =========================================================================
echo       CAREONIX JOB PORTAL - STOPPING ALL RUNNING SERVICES
echo =========================================================================
echo.

echo 1. Stopping Docker Containers...
cd /d d:\job portal
docker compose down

echo 2. Terminating Java Spring Boot Microservices...
taskkill /F /FI "WINDOWTITLE eq Careonix*" 2>nul
taskkill /F /IM java.exe 2>nul

echo 3. Terminating Frontend Node.js / Vite process...
taskkill /F /IM node.exe 2>nul

echo.
echo =========================================================================
echo   ALL CAREONIX SERVICES, DATABASES, AND FRONTEND HAVE BEEN STOPPED!
echo =========================================================================
pause
