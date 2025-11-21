# 🐳 Docker Setup Guide

## 📋 المتطلبات

-   Docker Desktop مثبت على جهازك
-   إذا لم يكن مثبتاً: [تحميل Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## 🚀 الخطوات

### 1️⃣ شغل PostgreSQL في Docker

```bash
# شغل PostgreSQL فقط
docker-compose up -d postgres

# تأكد إن الـ container شغال
docker ps
```

يجب أن ترى:

```
CONTAINER ID   IMAGE                  STATUS         PORTS
xxxxx          postgres:17-alpine     Up 10 seconds  0.0.0.0:5432->5432/tcp
```

### 2️⃣ نفذ Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run Migrations
npm run prisma:migrate

# Seed Database
npm run prisma:seed
```

### 3️⃣ شغل Backend

```bash
# شغل Backend على جهازك (خارج Docker)
npm run dev
```

---

## 🛠️ أوامر مفيدة

### إدارة Containers:

```bash
# إيقاف PostgreSQL
docker-compose down

# إيقاف وحذف البيانات
docker-compose down -v

# شوف logs PostgreSQL
docker-compose logs -f postgres

# دخول داخل PostgreSQL container
docker exec -it university_postgres psql -U postgres -d university_db
```

### Prisma Studio:

```bash
# فتح واجهة إدارة Database
npm run prisma:studio
```

---

## 🔧 إعدادات Database

-   **Host:** localhost
-   **Port:** 5432
-   **User:** postgres
-   **Password:** postgres123
-   **Database:** university_db

---

## 🐛 حل المشاكل

### المشكلة: Port 5432 مستخدم

```bash
# أوقف PostgreSQL المحلي
Get-Service postgresql* | Stop-Service

# أو غير Port في docker-compose.yml
ports:
  - "5433:5432"  # استخدم 5433 بدلاً من 5432

# وعدل .env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/university_db"
```

### المشكلة: Docker مش شغال

-   تأكد إن Docker Desktop مفتوح وشغال
-   افتح Docker Desktop وانتظر لحد ما يقول "Running"

---

## ✅ التحقق من النجاح

```bash
# تأكد من الاتصال بـ Database
docker exec -it university_postgres psql -U postgres -c "SELECT version();"
```

---

## 🎯 الخطوة التالية

بعد ما PostgreSQL يشتغل في Docker، ارجع للخطوات العادية:

1. ✅ Docker PostgreSQL شغال
2. ✅ `npm run prisma:generate`
3. ✅ `npm run prisma:migrate`
4. ✅ `npm run prisma:seed`
5. ✅ `npm run dev`
