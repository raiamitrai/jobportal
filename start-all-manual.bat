@echo off
title CAREONIX Job Portal - Master Manual Launcher
echo =========================================================================
echo                    CAREONIX JOB PORTAL - LAUNCHER
echo =========================================================================
echo  Launching all microservices, DB containers, and React frontend...
echo.

set MVN_CMD="d:\job portal\backend\maven\apache-maven-3.9.6\bin\mvn.cmd"

echo [1/9] Starting Frontend (React Vite - Port 3000)...
start "Careonix Frontend (Port 3000)" cmd /k "cd /d d:\job portal\frontend && npm run dev"

echo [2/9] Starting Eureka Service Discovery (Port 8761)...
start "Careonix Eureka Server (8761)" cmd /k "cd /d d:\job portal\backend\eureka-server && %MVN_CMD% spring-boot:run -DskipTests"

echo [3/9] Starting API Gateway (Port 8080)...
start "Careonix API Gateway (8080)" cmd /k "cd /d d:\job portal\backend\api-gateway && %MVN_CMD% spring-boot:run -DskipTests"

echo [4/9] Starting Job Service (Port 8081)...
start "Careonix Job Service (8081)" cmd /k "cd /d d:\job portal\backend\job-service && %MVN_CMD% spring-boot:run -DskipTests"

echo [5/9] Starting Profile Service (Port 8082)...
start "Careonix Profile Service (8082)" cmd /k "cd /d d:\job portal\backend\profile-service && %MVN_CMD% spring-boot:run -DskipTests"

echo [6/9] Starting Application Service (Port 8083)...
start "Careonix Application Service (8083)" cmd /k "cd /d d:\job portal\backend\application-service && %MVN_CMD% spring-boot:run -DskipTests"

echo [7/9] Starting Auth Service (Port 8085)...
start "Careonix Auth Service (8085)" cmd /k "cd /d d:\job portal\backend\auth-service && %MVN_CMD% spring-boot:run -DskipTests"

echo [8/9] Starting Notification Service (Port 8086)...
start "Careonix Notification Service (8086)" cmd /k "cd /d d:\job portal\backend\notification-service && %MVN_CMD% spring-boot:run -DskipTests"

echo [9/9] Starting Subscription Service (Port 8087)...
start "Careonix Subscription Service (8087)" cmd /k "cd /d d:\job portal\backend\subscription-service && %MVN_CMD% spring-boot:run -DskipTests"

echo.
echo =========================================================================
echo   ALL SERVICES DISPATCHED IN SEPARATE COMMAND PROMPT WINDOWS!
echo -------------------------------------------------------------------------
echo   - Frontend Portal : http://localhost:3000
echo   - Eureka Dashboard: http://localhost:8761
echo   - API Gateway     : http://localhost:8080
echo =========================================================================
pause
