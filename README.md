# University Management System - Backend

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+ installed
-   PostgreSQL database running
-   npm or yarn package manager

### Installation Steps

1. **Install Dependencies**

```bash
npm install
```

2. **Setup Environment Variables**

```bash
cp .env.example .env
```

Then edit `.env` and update the DATABASE_URL with your PostgreSQL credentials.

3. **Generate Prisma Client**

```bash
npm run prisma:generate
```

4. **Run Database Migrations**

```bash
npm run prisma:migrate
```

5. **Seed the Database**

```bash
npm run prisma:seed
```

6. **Start Development Server**

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📋 Default Accounts (After Seeding)

| Role        | Email                  | Password    |
| ----------- | ---------------------- | ----------- |
| Super Admin | admin@university.edu   | Admin@123   |
| Faculty     | faculty@university.edu | Faculty@123 |
| Student     | student@university.edu | Student@123 |

## 🛠️ Available Scripts

-   `npm run dev` - Start development server with hot reload
-   `npm run build` - Build for production
-   `npm start` - Start production server
-   `npm run prisma:generate` - Generate Prisma Client
-   `npm run prisma:migrate` - Run database migrations
-   `npm run prisma:seed` - Seed database with initial data
-   `npm run prisma:studio` - Open Prisma Studio (DB GUI)

## 📡 API Endpoints

### Authentication

-   `POST /api/auth/register` - Register new user
-   `POST /api/auth/login` - Login user
-   `POST /api/auth/refresh` - Refresh access token
-   `POST /api/auth/logout` - Logout user
-   `GET /api/auth/me` - Get current user (Protected)
-   `PUT /api/auth/change-password` - Change password (Protected)

### Health Check

-   `GET /health` - Server health check

## 🗄️ Database Schema

The database includes the following main entities:

-   Users & Authentication
-   Colleges & Departments
-   Specializations & Curricula
-   Courses & Prerequisites
-   Students & Faculty
-   Academic Terms & Sections
-   Enrollments & Grades
-   Attendance & GPA
-   Requests & Approvals
-   Notifications

## 🔒 Security Features

-   JWT-based authentication
-   Password hashing with bcrypt
-   Role-based access control (RBAC)
-   Permission-based authorization
-   Request validation with Zod
-   Rate limiting
-   CORS protection
-   Helmet security headers
-   HTTP-only cookies for refresh tokens

## 🏗️ Project Structure

```
Backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts           # Database seeding
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Prisma client
│   │   ├── env.ts        # Environment config
│   │   └── constants.ts  # Permissions & constants
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── permission.middleware.ts
│   │   └── validation.middleware.ts
│   ├── modules/          # Feature modules
│   │   └── auth/         # Authentication module
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       ├── auth.routes.ts
│   │       └── auth.validator.ts
│   ├── utils/            # Utility functions
│   │   └── auth.ts       # Auth helpers
│   └── index.ts          # Entry point
├── .env                  # Environment variables
├── .env.example          # Example environment file
├── package.json
└── tsconfig.json
```

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 📝 Notes

-   Make sure PostgreSQL is running before starting the server
-   Update the DATABASE_URL in .env with your database credentials
-   The default port is 5000, change it in .env if needed
-   For production, update JWT secrets and other sensitive data

## 🐛 Common Issues

### Issue: Prisma Client not generated

**Solution:** Run `npm run prisma:generate`

### Issue: Database connection failed

**Solution:** Check your DATABASE_URL in .env file

### Issue: Port already in use

**Solution:** Change PORT in .env or kill the process using port 5000

## 📚 Next Steps

After setting up the backend:

1. Test authentication endpoints
2. Set up the Frontend
3. Integrate Frontend with Backend
4. Add more modules (Students, Faculty, Courses, etc.)
