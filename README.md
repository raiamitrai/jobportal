# 🚀 CAREONIX - Enterprise Job Portal & Recruitment Platform

An enterprise-grade, microservices-driven Job Portal and Applicant Tracking System (ATS) connecting job seekers, recruiters, and platform administrators. Built with a modern **React (Vite)** frontend and high-performance **Spring Boot & Spring Cloud** microservices architecture.

---

## 🌟 Architecture Overview

The system is structured as a resilient distributed microservices ecosystem:

```text
                               ┌─────────────────────────┐
                               │     React Frontend      │
                               │      (Port: 3000)       │
                               └────────────┬────────────┘
                                            │ HTTP / REST / WS
                                            ▼
                               ┌─────────────────────────┐
                               │   Spring Cloud Gateway  │
                               │      (Port: 8080)       │
                               └────────────┬────────────┘
                                            │ Service Discovery
                    ┌───────────────────────┴───────────────────────┐
                    │          Netflix Eureka Service Discovery     │
                    │                   (Port: 8761)                │
                    └───────────────────────┬───────────────────────┘
                                            │
  ┌──────────────────┬──────────────────────┼──────────────────────┬──────────────────┐
  ▼                  ▼                      ▼                      ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐
│ Auth Service │   │ Job Service  │   │Profile Service│  │Application   │   │ Notification Service │
│ (Port: 8085) │   │ (Port: 8081) │   │ (Port: 8082) │   │ Service      │   │     (Port: 8086)     │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │ (Port: 8083) │   └──────────┬───────────┘
       │                  │                  │           └──────┬───────┘              │
       └──────────────────┴──────────────────┼──────────────────┘                      │
                                             ▼                                         │
                                       ┌───────────┐                             ┌─────┴─────┐
                                       │ MySQL DB  │                             │ RabbitMQ  │
                                       │ (Port 3306│                             │(Port 5672)│
                                       └───────────┘                             └───────────┘
```

---

## 📦 Services Breakdown

| Service | Port | Description | Tech Stack |
|---|---|---|---|
| **Frontend** | `3000` | Responsive Web Client (Candidate, Recruiter, Admin) | React, Vite, Lucide Icons, Vanilla CSS |
| **API Gateway** | `8080` | Unified API routing, load balancing, and rate limiting | Spring Cloud Gateway |
| **Eureka Server** | `8761` | Dynamic service registry and health tracking | Spring Cloud Netflix Eureka |
| **Auth Service** | `8085` | Authentication, RBAC (Candidate/Recruiter/Admin), JWT tokens | Spring Boot, Spring Security, JWT |
| **Job Service** | `8081` | Job posting, search, filtering, lifecycle management | Spring Boot, JPA, MySQL |
| **Profile Service** | `8082` | Candidate resumes, recruiter company profiles, branding | Spring Boot, JPA, MySQL |
| **Application Service** | `8083` | Application tracking, ATS candidate evaluation, interview pipeline | Spring Boot, PostgreSQL / MySQL |
| **Notification Service**| `8086` | Event-driven notifications and Gmail SMTP alerts | Spring Boot, RabbitMQ, JavaMail |
| **Subscription Service**| `8087` | Recruiter subscription plans, Razorpay payment processing | Spring Boot, Razorpay SDK, MySQL |
| **Interview Service** | `8089` | Video interview scheduling and assessment management | Spring Boot, REST |

---

## ✨ Key Features

- **Candidate Experience**:
  - Intuitive job discovery with search, category filters, and salary ranges.
  - One-click application submission with resume profile attachment.
  - Direct real-time messaging with recruiters.
  - Application status timeline (Applied, Reviewed, Shortlisted, Interview, Offered).

- **Recruiter & ATS Suite**:
  - Comprehensive Job Management: post, edit, pause, and close listings.
  - Applicant Pipeline: review candidate profiles, update stages, and provide direct feedback.
  - Integrated candidate messaging channel.
  - Company branding and team management.

- **Admin Portal**:
  - Live system health and microservice monitoring.
  - Platform analytics: user registrations, job postings, application metrics.
  - Subscription plan management and payment auditing.

- **Security & Infrastructure**:
  - Stateless JWT token-based authentication.
  - Role-Based Access Control (RBAC).
  - Docker Compose configuration for one-command orchestration.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **Java**: JDK 17 or higher
- **Maven**: 3.8+ (or use the provided scripts)
- **Docker & Docker Compose**: For containerized databases and message queues

### Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your local database credentials and email settings.

### Launching Option A: Docker Compose (All-in-One)
```bash
docker compose up --build -d
```
- Access the Frontend at: `http://localhost:3000` (or `http://localhost:3007`)
- Access Eureka Dashboard at: `http://localhost:8761`
- Access phpMyAdmin at: `http://localhost:8085`

### Launching Option B: Local Windows Batch Launchers
1. Start infrastructure: double-click **`start-docker-environment.bat`**
2. Start application: double-click **`start-all-manual.bat`**
3. Stop all services cleanly: double-click **`stop-all-services.bat`**

For more detailed manual steps, see [README-MANUAL-START.md](file:///README-MANUAL-START.md).

---

## 🛠️ Repository Structure

```text
├── backend/                  # Java Spring Boot Microservices
│   ├── analytics-service/
│   ├── api-gateway/
│   ├── application-service/
│   ├── auth-service/
│   ├── eureka-server/
│   ├── interview-service/
│   ├── job-service/
│   ├── notification-service/
│   ├── profile-service/
│   └── subscription-service/
├── frontend/                 # React Vite Client Application
│   ├── src/
│   ├── public/
│   └── package.json
├── docker-compose.yml        # Multi-container orchestration
├── .gitignore                # Production git ignore definitions
└── README.md                 # Project documentation
```

---

## 🔒 Security Best Practices

- All secrets and credentials are loaded via environment variables (`.env`).
- Never commit active API keys, JWT secrets, or production passwords to version control.
- Build outputs (`dist/`, `target/`, `node_modules/`) are strictly ignored by `.gitignore`.

---

## 📄 License
This project is licensed under the MIT License.
