# CAREONIX Job Portal - Manual Startup & Deployment Guide

This guide provides instructions to run, deploy, start, and stop the entire Careonix Job Portal application—including **Databases (MySQL / PostgreSQL / RabbitMQ)**, **Backend Microservices (Spring Boot)**, and the **Frontend (React Vite)**—using one-click launcher scripts, manual terminal commands, or Docker Compose.

---

## ⚡ Option 1: One-Click Launchers (Recommended for Local Dev)

The project root directory contains 3 convenient batch script launchers:

### 1. Start Databases & Queues (MySQL + PostgreSQL + RabbitMQ + phpMyAdmin)
Double-click: **`start-docker-environment.bat`**
> Automatically starts MySQL (Port 3306), PostgreSQL (Port 5432), RabbitMQ (Port 5672/15672), and phpMyAdmin (Port 8085).

### 2. Start Full Application (Frontend + All Microservices)
Double-click: **`start-all-manual.bat`**
> Automatically boots the Vite Frontend (Port 3000) and all backend microservices in separate Command Prompt windows:
> - **Frontend**: `http://localhost:3000`
> - **Eureka Discovery**: `http://localhost:8761`
> - **API Gateway**: `http://localhost:8080`
> - **Job Service**: `http://localhost:8081`
> - **Profile Service**: `http://localhost:8082`
> - **Application Service**: `http://localhost:8083`
> - **Auth Service**: `http://localhost:8085`
> - **Notification Service**: `http://localhost:8086`
> - **Subscription Service**: `http://localhost:8087`

### 3. Stop All Running Services
Double-click: **`stop-all-services.bat`**
> Gracefully stops all Java Spring Boot processes, Node.js frontend process, and Docker containers.

---

## 🛠️ Option 2: Step-by-Step Manual Command Line Execution

If you prefer starting services individually from your terminal:

### Step 1: Start Databases & Middleware
In a terminal (PowerShell / Command Prompt):
```bash
docker compose up -d postgres mysql rabbitmq mailhog phpmyadmin
```

### Step 2: Start Frontend (React + Vite)
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
👉 **URL**: `http://localhost:3000`

### Step 3: Start Eureka Discovery Server (Service #1)
In a new terminal window:
```bash
cd backend/eureka-server
mvn spring-boot:run
```
👉 **URL**: `http://localhost:8761`

### Step 4: Start API Gateway (Service #2)
In a new terminal window:
```bash
cd backend/api-gateway
mvn spring-boot:run
```
👉 **URL**: `http://localhost:8080`

### Step 5: Start Core Microservices (Services #3 - #8)
Run each microservice in its own terminal window:

- **Job Service** (Port 8081):
  ```bash
  cd backend/job-service
  mvn spring-boot:run
  ```

- **Profile Service** (Port 8082):
  ```bash
  cd backend/profile-service
  mvn spring-boot:run
  ```

- **Application Service** (Port 8083):
  ```bash
  cd backend/application-service
  mvn spring-boot:run
  ```

- **Auth Service** (Port 8085):
  ```bash
  cd backend/auth-service
  mvn spring-boot:run
  ```

- **Notification Service** (Port 8086):
  ```bash
  cd backend/notification-service
  mvn spring-boot:run
  ```

- **Subscription Service** (Port 8087):
  ```bash
  cd backend/subscription-service
  mvn spring-boot:run
  ```

---

## 🐳 Option 3: Full Docker Compose Containerized Deployment

To run the entire system (Frontend + Backend + Databases) containerized in Docker:

```bash
docker compose up --build -d
```
- **Frontend App**: `http://localhost:3007` or `http://localhost:3000`
- **phpMyAdmin DB Manager**: `http://localhost:8085`
- **RabbitMQ Dashboard**: `http://localhost:15672` (User: `guest`, Password: `guest`)

---

## 📊 Summary Table of Ports

| Service Name | Port | Type | Directory |
|---|---|---|---|
| **React Frontend** | `3000` | Web UI | `frontend/` |
| **API Gateway** | `8080` | Spring Gateway | `backend/api-gateway/` |
| **Eureka Server** | `8761` | Discovery | `backend/eureka-server/` |
| **Job Service** | `8081` | REST API | `backend/job-service/` |
| **Profile Service** | `8082` | REST API | `backend/profile-service/` |
| **Application Service** | `8083` | REST API | `backend/application-service/` |
| **Auth Service** | `8085` | REST API | `backend/auth-service/` |
| **Notification Service** | `8086` | REST API | `backend/notification-service/` |
| **Subscription Service** | `8087` | REST API | `backend/subscription-service/` |
| **MySQL Database** | `3306` | Database | Docker Container |
| **PostgreSQL Database** | `5432` | Database | Docker Container |
| **phpMyAdmin GUI** | `8085` | DB Manager | Docker Container |
| **RabbitMQ Console** | `15672` | Message Broker | Docker Container |
