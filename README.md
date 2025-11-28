# 🎓 جامعتي (Gamaati) - Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Nodejs-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)

**Enterprise-grade University Management System Backend**

[Live Demo](https://gamaati.netlify.app/) | [Frontend Repo](https://github.com/Yous2ef/uniSystemFrontend) | [API Documentation](./API_ENDPOINTS.md)

</div>

---

## 📋 Table of Contents

-   [About](#-about)
-   [Features](#-features)
-   [Tech Stack](#-tech-stack)
-   [Prerequisites](#-prerequisites)
-   [Quick Start](#-quick-start)
-   [Environment Variables](#-environment-variables)
-   [Database Setup](#-database-setup)
-   [Seeding Data](#-seeding-data)
-   [Running the Application](#-running-the-application)
-   [Docker Setup](#-docker-setup)
-   [API Documentation](#-api-documentation)
-   [Project Structure](#-project-structure)
-   [Default Accounts](#-default-accounts)
-   [Security Features](#-security-features)
-   [Deployment](#-deployment)
-   [Troubleshooting](#-troubleshooting)
-   [Contributing](#-contributing)

---

## 🎯 About

**جامعتي (Gamaati)** is a comprehensive university management system built specifically for the **College of Computer Science**. This backend API provides a robust, scalable, and secure foundation for managing academic operations including student enrollment, course management, grading, attendance tracking, and more.

### 🌟 Key Highlights

-   ✅ **Bilingual Support**: Arabic & English (RTL/LTR)
-   ✅ **Role-Based Access Control**: 5 user roles with granular permissions
-   ✅ **Comprehensive API**: 50+ RESTful endpoints
-   ✅ **Type-Safe**: Full TypeScript implementation with Prisma ORM
-   ✅ **Production-Ready**: Enterprise-level security and error handling
-   ✅ **Backup & Restore**: Built-in database backup system

---

## ✨ Features

### 👥 User Management

-   Multi-role authentication (Super Admin, Admin, Faculty, TA, Student)
-   JWT-based authentication with refresh tokens
-   Secure password hashing with bcrypt
-   Session management
-   Password reset functionality

### 🏛️ Academic Structure

-   Department management (Software Engineering, Data Science, Information Systems, Cybersecurity)
-   Curriculum builder with course prerequisites
-   Course management with materials and announcements
-   Batch and academic term management
-   Section scheduling with conflict detection

### 🎓 Student Features

-   Student profile management
-   Course registration with validation
-   Prerequisite checking
-   Schedule conflict detection
-   Credit limit enforcement
-   Department selection system
-   GPA tracking and transcript generation

### 👨‍🏫 Faculty Features

-   Course section management
-   Grade entry with components (Quiz, Midterm, Final, etc.)
-   Attendance tracking
-   Course materials upload
-   Student performance reports

### 📊 Grading & GPA

-   Flexible grading components
-   Automated GPA calculation (Term & Cumulative)
-   Grade scale configuration (A+ to F)
-   Academic standing determination
-   Retake policy support
-   Grade appeals system

### 📈 Reports & Analytics

-   Student performance reports
-   Enrollment statistics
-   Faculty workload reports
-   At-risk student identification
-   Department analytics

### 💾 System Administration

-   Database backup and restore
-   Data export functionality
-   System statistics
-   Audit logging
-   Policy management

---

## 🛠️ Tech Stack

| Technology             | Purpose                   |
| ---------------------- | ------------------------- |
| **Node.js**            | Runtime environment       |
| **TypeScript**         | Type-safe programming     |
| **Express.js**         | Web framework             |
| **PostgreSQL**         | Relational database       |
| **Prisma ORM**         | Database ORM & migrations |
| **JWT**                | Authentication            |
| **Bcrypt**             | Password hashing          |
| **Zod**                | Input validation          |
| **Helmet**             | Security headers          |
| **CORS**               | Cross-origin requests     |
| **Express Rate Limit** | API rate limiting         |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
-   **PostgreSQL**: v14.0 or higher ([Download](https://www.postgresql.org/download/))
-   **npm** or **yarn**: Latest version
-   **Git**: For cloning the repository

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
# Clone the backend repository
git clone https://github.com/Yous2ef/uniSystemBackend.git
cd uniSystemBackend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Then edit `.env` with your configuration (see [Environment Variables](#-environment-variables) section).

### 4. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000` 🚀

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/university_db?schema=public"

# JWT Configuration
JWT_ACCESS_SECRET="your-super-secret-access-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Backup Directory (optional)
BACKUPS_DIR="./backups"
```

### 📝 Environment Variables Explanation

| Variable                  | Description                          | Default                 |
| ------------------------- | ------------------------------------ | ----------------------- |
| `PORT`                    | Server port number                   | `5000`                  |
| `NODE_ENV`                | Environment (development/production) | `development`           |
| `DATABASE_URL`            | PostgreSQL connection string         | Required                |
| `JWT_ACCESS_SECRET`       | Secret key for access tokens         | Required                |
| `JWT_REFRESH_SECRET`      | Secret key for refresh tokens        | Required                |
| `JWT_ACCESS_EXPIRY`       | Access token expiration time         | `15m`                   |
| `JWT_REFRESH_EXPIRY`      | Refresh token expiration time        | `7d`                    |
| `CORS_ORIGIN`             | Allowed frontend origin              | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit time window (ms)          | `900000` (15 min)       |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window              | `100`                   |
| `BACKUPS_DIR`             | Directory for database backups       | `./backups`             |

> ⚠️ **Security Warning**: Never commit your `.env` file to version control! Always use strong, unique secrets in production.

---

## 🗄️ Database Setup

### Prerequisites

-   PostgreSQL 14+ installed and running
-   Database created (e.g., `university_db`)

### Setup Steps

#### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE university_db;

# Exit psql
\q
```

#### 2. Update DATABASE_URL

Edit your `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/university_db?schema=public"
```

#### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma Client based on your `schema.prisma` file.

#### 4. Run Migrations

```bash
npm run prisma:migrate
```

This creates all database tables, relationships, and constraints.

### Database Management Tools

#### Prisma Studio (GUI)

```bash
npm run prisma:studio
```

Opens a web-based GUI at `http://localhost:5555` for browsing and editing your database.

#### Useful Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View database schema
npx prisma db pull

# Format schema file
npx prisma format
```

---

## 🌱 Seeding Data

The project includes three seeding options with different levels of data:

### 1. Standard Seed (Recommended)

```bash
npm run prisma:seed
```

**Creates:**

-   ✅ **Grade Scale**: A+ to F with GPA points (4.0 to 0.0)
-   ✅ **System Policies**: Credit limits, attendance rules, retake policies, academic standing rules
-   ✅ **Super Admin User**: `admin@university.edu` / `Admin@123`
-   ✅ **College**: College of Computer Science (Fixed single college)
-   ✅ **Departments**:
    -   Software Engineering (CSSE) - Min GPA: 2.5, Capacity: 120
    -   Data Science (CSDS) - Min GPA: 2.75, Capacity: 80
    -   Information Systems (CSIS) - Min GPA: 2.5, Capacity: 100
    -   Cybersecurity (CSCY) - Min GPA: 3.0, Capacity: 60
-   ✅ **Courses**: 20+ CS courses (CS101 to CS491) including:
    -   Year 1: Introduction to Programming, Computer Fundamentals, Calculus, etc.
    -   Year 2: Data Structures, OOP, Databases, Computer Organization
    -   Year 3: Algorithms, Operating Systems, Networks, Software Engineering
    -   Year 4: Machine Learning, Web Dev, Mobile Dev, Security, Cloud Computing
    -   Graduation Projects I & II
-   ✅ **Sample Faculty**: Dr. Ahmed Mohamed (`faculty@university.edu` / `Faculty@123`)
-   ✅ **Sample Student**: Ahmed Hassan (`student@university.edu` / `Student@123`)
-   ✅ **Curriculum**: Software Engineering Curriculum 2024 (132 credits)
-   ✅ **Batch**: Batch 2024

### 2. Enhanced Seed (More Sample Data)

```bash
npm run prisma:seed-enhanced
```

Includes everything from standard seed, plus:

-   Multiple students per batch
-   Multiple faculty members
-   Sample enrollments
-   Sample grades and attendance records
-   Multiple academic terms

### 3. Minimal Seed (Testing Only)

```bash
npm run prisma:seed-minimal
```

Minimal data for quick testing:

-   Admin user only
-   One college, one department
-   Basic courses
-   No sample students/faculty

### Seeded Data Details

#### **Grade Scale**

| Letter | Min % | Max % | GPA Points |
| ------ | ----- | ----- | ---------- |
| A+     | 97    | 100   | 4.0        |
| A      | 93    | 96    | 4.0        |
| A-     | 90    | 92    | 3.7        |
| B+     | 87    | 89    | 3.3        |
| B      | 83    | 86    | 3.0        |
| B-     | 80    | 82    | 2.7        |
| C+     | 77    | 79    | 2.3        |
| C      | 73    | 76    | 2.0        |
| C-     | 70    | 72    | 1.7        |
| D+     | 67    | 69    | 1.3        |
| D      | 63    | 66    | 1.0        |
| D-     | 60    | 62    | 0.7        |
| F      | 0     | 59    | 0.0        |

#### **System Policies**

-   **Max Credits/Term**: 18
-   **Min Credits/Term**: 12 (full-time)
-   **Min Attendance**: 75%
-   **Retake Policy**: Highest grade counts
-   **Academic Standing**:
    -   Good Standing: GPA ≥ 2.0
    -   Warning: 1.75 ≤ GPA < 2.0
    -   Probation: 1.5 ≤ GPA < 1.75
    -   Dismissal: GPA < 1.5

#### **Sample Courses**

| Code  | Name                        | Credits | Type     |
| ----- | --------------------------- | ------- | -------- |
| CS101 | Introduction to Programming | 3       | CORE     |
| CS201 | Data Structures             | 3       | CORE     |
| CS301 | Algorithms                  | 3       | CORE     |
| CS401 | Machine Learning            | 3       | ELECTIVE |
| CS490 | Graduation Project I        | 3       | CORE     |
| CS491 | Graduation Project II       | 3       | CORE     |

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

-   Runs with **hot reload** using `tsx watch`
-   Server restarts automatically on file changes
-   Detailed logging enabled
-   CORS allows all origins (localhost)

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Available Scripts

| Script                         | Description                              |
| ------------------------------ | ---------------------------------------- |
| `npm run dev`                  | Start development server with hot reload |
| `npm run build`                | Build TypeScript to JavaScript           |
| `npm start`                    | Start production server                  |
| `npm run prisma:generate`      | Generate Prisma Client                   |
| `npm run prisma:migrate`       | Run database migrations                  |
| `npm run prisma:seed`          | Seed database with initial data          |
| `npm run prisma:seed-enhanced` | Seed with enhanced sample data           |
| `npm run prisma:studio`        | Open Prisma Studio GUI                   |

---

## 🐳 Docker Setup

For containerized deployment, see the detailed [Docker Setup Guide](./DOCKER.md).

### Quick Docker Start

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

The Docker setup includes:

-   Node.js application container
-   PostgreSQL database container
-   Automatic migrations and seeding
-   Volume persistence for database

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Available Endpoints

For detailed API documentation with request/response examples, see [API_ENDPOINTS.md](./API_ENDPOINTS.md).

#### Quick Reference

| Category           | Endpoints            | Description                               |
| ------------------ | -------------------- | ----------------------------------------- |
| **Authentication** | `/api/auth/*`        | Login, logout, register, refresh token    |
| **Students**       | `/api/students/*`    | Student management, profiles, import      |
| **Faculty**        | `/api/faculty/*`     | Faculty management, sections              |
| **Courses**        | `/api/courses/*`     | Course CRUD, prerequisites, materials     |
| **Curriculum**     | `/api/curriculum/*`  | Curriculum builder, validation            |
| **Enrollments**    | `/api/enrollments/*` | Registration, schedule, validation        |
| **Grades**         | `/api/grades/*`      | Grade entry, GPA calculation, transcripts |
| **Attendance**     | `/api/attendance/*`  | Mark attendance, statistics               |
| **Departments**    | `/api/departments/*` | Department management                     |
| **Batches**        | `/api/batches/*`     | Batch management, statistics              |
| **Terms**          | `/api/terms/*`       | Academic term management                  |
| **Sections**       | `/api/sections/*`    | Section management, schedules             |
| **Reports**        | `/api/reports/*`     | Various reports and analytics             |
| **Backup**         | `/api/backup/*`      | Database backup and restore               |

### Health Check

```bash
curl http://localhost:5000/health
```

Response:

```json
{
    "success": true,
    "message": "Server is running",
    "timestamp": "2025-11-29T10:00:00.000Z"
}
```

---

## 📁 Project Structure

```
Backend/
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── migrations/             # Database migration files
│   ├── seed.ts                 # Database seeding script
│   ├── seed-enhanced.ts        # Enhanced seeding with more data
│   └── seed-minimal.ts         # Minimal seeding for testing
├── src/
│   ├── config/
│   │   ├── database.ts         # Prisma client configuration
│   │   ├── env.ts              # Environment variables config
│   │   └── constants.ts        # Permissions & constants
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # JWT authentication
│   │   ├── error.middleware.ts # Error handling
│   │   ├── permission.middleware.ts # Authorization
│   │   └── validation.middleware.ts # Input validation
│   ├── modules/
│   │   ├── auth/               # Authentication module
│   │   ├── students/           # Student management
│   │   ├── faculty/            # Faculty management
│   │   ├── courses/            # Course management
│   │   ├── enrollments/        # Registration & enrollment
│   │   ├── grades/             # Grading system
│   │   ├── attendance/         # Attendance tracking
│   │   ├── backup/             # Backup & restore
│   │   ├── batches/            # Batch management
│   │   ├── colleges/           # College management
│   │   ├── curriculum/         # Curriculum builder
│   │   ├── departments/        # Department management
│   │   ├── department-selection/ # Specialization selection
│   │   ├── reports/            # Reports & analytics
│   │   ├── sections/           # Section management
│   │   └── terms/              # Academic term management
│   ├── utils/
│   │   └── auth.ts             # JWT & password utilities
│   └── index.ts                # Application entry point
├── backups/                    # Database backups directory
├── uploads/                    # File uploads directory
├── netlify/                    # Netlify serverless functions
│   └── functions/
│       └── api.ts              # Netlify function handler
├── .env                        # Environment variables (not in git)
├── .env.example                # Example environment file
├── .gitignore                  # Git ignore rules
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Docker build instructions
├── netlify.toml                # Netlify configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── tsconfig.build.json         # TypeScript build config
├── API_ENDPOINTS.md            # Detailed API documentation
├── DOCKER.md                   # Docker setup guide
└── README.md                   # This file
```

---

## 👤 Default Accounts

After running `npm run prisma:seed`, the following accounts are created:

| Role            | Email                    | Password      | Description                |
| --------------- | ------------------------ | ------------- | -------------------------- |
| **Super Admin** | `admin@university.edu`   | `Admin@123`   | Full system access         |
| **Faculty**     | `faculty@university.edu` | `Faculty@123` | Dr. Ahmed Mohamed (FAC001) |
| **Student**     | `student@university.edu` | `Student@123` | Ahmed Hassan (20240001)    |

### Login Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "Admin@123"
  }'
```

**Response:**

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": "...",
            "email": "admin@university.edu",
            "role": "SUPER_ADMIN",
            "status": "ACTIVE"
        },
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

> ⚠️ **Important**: Change these default passwords in production!

---

## 🔒 Security Features

### Authentication & Authorization

-   ✅ JWT-based authentication with access & refresh tokens
-   ✅ HTTP-only cookies for refresh tokens
-   ✅ Password hashing with bcrypt (10 rounds)
-   ✅ Role-based access control (RBAC)
-   ✅ Permission-based authorization
-   ✅ Session management with token expiration

### Request Security

-   ✅ Input validation with Zod schemas
-   ✅ SQL injection prevention (Prisma ORM)
-   ✅ XSS protection
-   ✅ Rate limiting (100 requests per 15 minutes in production)
-   ✅ CORS configuration
-   ✅ Helmet.js security headers
-   ✅ Request size limits

### Data Protection

-   ✅ Environment variable encryption
-   ✅ Database constraints and validation
-   ✅ Audit logging for critical operations
-   ✅ Soft delete for data retention
-   ✅ Backup and restore capabilities

---

## 🚀 Deployment

### Deploying to Production

#### 1. Prepare Environment

```bash
# Set NODE_ENV to production
NODE_ENV=production

# Use strong JWT secrets (generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET="your-strong-secret-key-here"
JWT_REFRESH_SECRET="another-strong-secret-key"

# Update CORS origin to your frontend URL
CORS_ORIGIN="https://gamaati.netlify.app"

# Use production database
DATABASE_URL="postgresql://user:pass@your-db-host:5432/prod_db"
```

#### 2. Build and Deploy

```bash
# Install dependencies
npm install --production

# Build the application
npm run build

# Run migrations on production database
npx prisma migrate deploy

# Seed production database (optional)
npm run prisma:seed

# Start the server
npm start
```

### Deployment Platforms

#### **Netlify Functions** (Current Deployment)

```bash
# Deploy to Netlify
netlify deploy --prod
```

The live demo is hosted at: **https://gamaati.netlify.app/**

#### **Heroku**

```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set NODE_ENV=production
git push heroku main
```

#### **DigitalOcean / AWS / Azure**

1. Create a PostgreSQL database instance
2. Deploy using Docker or PM2
3. Configure reverse proxy (Nginx)
4. Setup SSL certificates (Let's Encrypt)

---

## 🐛 Troubleshooting

### Common Issues

#### **1. Database Connection Failed**

**Error**: `Can't reach database server`

**Solution**:

```bash
# Check if PostgreSQL is running
systemctl status postgresql  # Linux
brew services list  # macOS

# Verify DATABASE_URL in .env
```

#### **2. Prisma Client Not Generated**

**Error**: `@prisma/client did not initialize yet`

**Solution**:

```bash
npm run prisma:generate
```

#### **3. Port Already in Use**

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:5000 | xargs kill -9
```

#### **4. Migration Failed**

**Solution**:

```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

#### **5. Seeding Failed**

**Solution**:

```bash
# Clear database and reseed
npx prisma migrate reset
npm run prisma:seed
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔗 Links

-   🌐 **Live Demo**: [https://gamaati.netlify.app/](https://gamaati.netlify.app/)
-   💻 **Frontend Repository**: [https://github.com/Yous2ef/uniSystemFrontend](https://github.com/Yous2ef/uniSystemFrontend)
-   🔧 **Backend Repository**: [https://github.com/Yous2ef/uniSystemBackend](https://github.com/Yous2ef/uniSystemBackend)

---

## 🙏 Acknowledgments

Built with ❤️ for the College of Computer Science

-   **Node.js** and **Express.js** communities
-   **Prisma** for the amazing ORM
-   **PostgreSQL** for reliable data storage
-   All contributors and testers

---

<div align="center">

**Made with 💻 and ☕**

If you find this project helpful, please give it a ⭐️!

</div>
