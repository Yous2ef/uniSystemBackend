# 🐳 Docker Setup Guide - University Management System

<div align="center">

![Docker](https://img.shields.io/badge/Docker-24.0+-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2.0+-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

**Complete Docker Setup for Development and Production**

</div>

---

## 📋 Table of Contents

-   [Prerequisites](#-prerequisites)
-   [Quick Start](#-quick-start)
-   [Development Setup](#-development-setup)
-   [Production Deployment](#-production-deployment)
-   [Database Management](#-database-management)
-   [Seeding Database](#-seeding-database)
-   [Docker Commands](#-docker-commands)
-   [Troubleshooting](#-troubleshooting)

---

## 📦 Prerequisites

### Required Software

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)

    - Download: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
    - Version: 24.0 or higher

2. **Docker Compose**
    - Included with Docker Desktop
    - Version: 2.0 or higher

### Verify Installation

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Verify Docker is running
docker ps
```

---

## 🚀 Quick Start

### Option 1: PostgreSQL Only (Recommended for Development)

```bash
# 1. Start PostgreSQL container
docker-compose up -d postgres

# 2. Install dependencies
npm install

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate

# 5. Seed the database
npm run prisma:seed

# 6. Start development server
npm run dev
```

### Option 2: Full Docker Setup

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 🛠️ Development Setup

### Starting Services

```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Check if running
docker ps

# View logs
docker-compose logs -f postgres
```

### Database Initialization

```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Run migrations (creates all tables)
npm run prisma:migrate

# 3. Seed the database with initial data
npm run prisma:seed
```

### Accessing Services

| Service       | URL                     | Description         |
| ------------- | ----------------------- | ------------------- |
| Backend API   | `http://localhost:5000` | REST API endpoints  |
| PostgreSQL    | `localhost:5432`        | Database connection |
| Prisma Studio | `http://localhost:5555` | Database GUI        |

---

## 💾 Database Management

### Accessing PostgreSQL

```bash
# Access PostgreSQL CLI
docker exec -it university_postgres psql -U postgres -d university_db

# Example queries
SELECT * FROM "users";
SELECT * FROM "students";
\dt  # List all tables
\q   # Exit
```

### Database Connection Settings

```
Host: localhost
Port: 5432
Database: university_db
Username: postgres
Password: postgres123
```

### Database Backup

```bash
# Manual backup to SQL file
docker exec university_postgres pg_dump -U postgres university_db > backup.sql

# Using application backup API
curl -X POST http://localhost:5000/api/backup/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Database Restore

```bash
# Restore from SQL file
docker exec -i university_postgres psql -U postgres -d university_db < backup.sql

# Using application restore API
curl -X POST http://localhost:5000/api/backup/restore \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename": "backup-2025-11-29.sql"}'
```

---

## 🌱 Seeding Database

The project includes three seeding options:

### 1. Standard Seed (Recommended)

```bash
npm run prisma:seed
```

**Creates:**

-   ✅ Grade Scale (A+ to F with GPA points)
-   ✅ System Policies (credit limits, attendance rules)
-   ✅ Super Admin (`admin@university.edu` / `Admin@123`)
-   ✅ College of Computer Science
-   ✅ 4 Departments (Software Engineering, Data Science, Information Systems, Cybersecurity)
-   ✅ 20+ CS Courses (CS101 to CS491)
-   ✅ Sample Faculty (`faculty@university.edu` / `Faculty@123`)
-   ✅ Sample Student (`student@university.edu` / `Student@123`)
-   ✅ Curriculum & Batch

### 2. Enhanced Seed

```bash
npm run prisma:seed-enhanced
```

Includes standard seed plus:

-   Multiple students per batch
-   Multiple faculty members
-   Sample enrollments and grades

### 3. Minimal Seed

```bash
npm run prisma:seed-minimal
```

Minimal data for quick testing.

---

## 🔧 Docker Commands

### Container Management

```bash
# List running containers
docker ps

# Start containers
docker-compose up -d

# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes data)
docker-compose down -v

# Restart containers
docker-compose restart
```

### Logs and Monitoring

```bash
# View logs (all services)
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for PostgreSQL
docker-compose logs -f postgres

# View container resource usage
docker stats
```

### Executing Commands

```bash
# Execute command in container
docker exec -it university_postgres bash

# Access PostgreSQL CLI
docker exec -it university_postgres psql -U postgres -d university_db
```

---

## 🐛 Troubleshooting

### Issue 1: Port 5432 Already in Use

**Solution:**

```bash
# Windows: Stop local PostgreSQL
Get-Service postgresql* | Stop-Service

# Linux: Stop local PostgreSQL
sudo systemctl stop postgresql

# Or change port in docker-compose.yml
ports:
  - "5433:5432"

# Update .env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/university_db"
```

### Issue 2: Container Won't Start

```bash
# Check logs for errors
docker-compose logs postgres

# Reset everything
docker-compose down -v
docker-compose up -d
```

### Issue 3: Cannot Connect to Database

```bash
# Check if container is running
docker ps

# Test connection
docker exec -it university_postgres psql -U postgres -c "SELECT 1;"
```

### Issue 4: Disk Space Issues

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

## ✅ Verification Checklist

```bash
# 1. Check containers are running
docker ps

# 2. Test database connection
docker exec -it university_postgres psql -U postgres -c "SELECT version();"

# 3. Check database tables
docker exec -it university_postgres psql -U postgres -d university_db -c "\dt"

# 4. Test API health
curl http://localhost:5000/health

# 5. Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"Admin@123"}'
```

---

## 🔗 Links

-   🐳 **Docker Documentation**: [https://docs.docker.com/](https://docs.docker.com/)
-   🐘 **PostgreSQL Docker**: [https://hub.docker.com/\_/postgres](https://hub.docker.com/_/postgres)
-   🏠 **Backend Repository**: [https://github.com/Yous2ef/uniSystemBackend](https://github.com/Yous2ef/uniSystemBackend)
-   🌐 **Live Demo**: [https://gamaati.netlify.app/](https://gamaati.netlify.app/)

---

<div align="center">

**Made with 🐳 and ❤️**

</div>
