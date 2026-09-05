@echo off
title CAREONIX - Docker Containers Launcher (MySQL, Postgres, RabbitMQ)
echo =========================================================================
echo       CAREONIX JOB PORTAL - DOCKER CONTAINERS LAUNCHER
echo =========================================================================
echo.
echo Starting MySQL 8.0, PostgreSQL, RabbitMQ & MailHog via Docker Compose...
echo.

cd /d d:\job portal
docker compose up -d postgres mysql rabbitmq mailhog phpmyadmin

echo.
echo =========================================================================
echo   CONTAINERS STARTED SUCCESSFULLY!
echo -------------------------------------------------------------------------
echo   - MySQL Database     : localhost:3306 / localhost:3307
echo   - PostgreSQL DB      : localhost:5432
echo   - phpMyAdmin DB GUI  : http://localhost:8085
echo   - RabbitMQ Mgmt Console: http://localhost:15672 (guest/guest)
echo =========================================================================
echo.
docker compose ps
pause
