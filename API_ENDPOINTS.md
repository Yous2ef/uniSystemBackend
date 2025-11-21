# API Endpoints Documentation

Base URL: `http://localhost:5000/api`

## 📋 Table of Contents

-   [Authentication](#authentication)
-   [Students](#students)
-   [Courses](#courses)
-   [Enrollments](#enrollments)
-   [Grades](#grades)
-   [Attendance](#attendance)
-   [Departments](#departments)
-   [Sections](#sections)
-   [Faculty](#faculty)

---

## 🔐 Authentication

### Register

```http
POST /auth/register
```

**Body:**

```json
{
    "email": "student@example.com",
    "password": "password123",
    "username": "student123",
    "role": "STUDENT"
}
```

### Login

```http
POST /auth/login
```

**Body:**

```json
{
    "email": "student@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
        "id": 1,
        "email": "student@example.com",
        "role": "STUDENT"
    }
}
```

### Refresh Token

```http
POST /auth/refresh
```

**Body:**

```json
{
    "refreshToken": "eyJhbGc..."
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer {accessToken}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

### Change Password

```http
PUT /auth/change-password
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword123"
}
```

---

## 👨‍🎓 Students

### Get Student Profile

```http
GET /students/profile
Authorization: Bearer {accessToken}
```

### Get All Students

```http
GET /students
Authorization: Bearer {accessToken}
```

### Get Student by ID

```http
GET /students/:id
Authorization: Bearer {accessToken}
```

### Get Student by User ID

```http
GET /students/user/:userId
Authorization: Bearer {accessToken}
```

### Create Student

```http
POST /students
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "userId": 1,
    "studentId": "20240001",
    "batchId": 1,
    "departmentId": 1,
    "gender": "MALE",
    "dateOfBirth": "2000-01-15"
}
```

### Update Student

```http
PUT /students/:id
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "departmentId": 2,
    "gender": "FEMALE"
}
```

### Delete Student

```http
DELETE /students/:id
Authorization: Bearer {accessToken}
```

### Get Students by Batch

```http
GET /students/batch/:batchId
Authorization: Bearer {accessToken}
```

---

## 📚 Courses

### Get All Courses

```http
GET /courses
```

**Query Params:**

-   `departmentId` (optional): Filter by department
-   `level` (optional): Filter by level (1-5)
-   `search` (optional): Search by code or name

### Get Course by ID

```http
GET /courses/:id
```

### Get Course Materials

```http
GET /courses/:id/materials
Authorization: Bearer {accessToken}
```

### Get Course Announcements

```http
GET /courses/:id/announcements
Authorization: Bearer {accessToken}
```

### Create Course (Admin/Faculty)

```http
POST /courses
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "code": "CS101",
    "name": "Introduction to Programming",
    "description": "Learn basic programming concepts",
    "credits": 3,
    "level": 1,
    "departmentId": 1,
    "type": "MANDATORY"
}
```

### Update Course

```http
PUT /courses/:id
Authorization: Bearer {accessToken}
```

### Delete Course

```http
DELETE /courses/:id
Authorization: Bearer {accessToken}
```

### Add Course Material

```http
POST /courses/:id/materials
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "title": "Lecture 1 - Variables",
    "description": "Introduction to variables",
    "type": "LECTURE_NOTES",
    "url": "https://example.com/lecture1.pdf"
}
```

### Add Course Announcement

```http
POST /courses/:id/announcements
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "title": "Midterm Exam Announcement",
    "content": "The midterm exam will be held on...",
    "priority": "HIGH"
}
```

---

## 📝 Enrollments

### Get My Enrollments

```http
GET /enrollments/my-enrollments
Authorization: Bearer {accessToken}
```

### Get All Enrollments

```http
GET /enrollments
Authorization: Bearer {accessToken}
```

### Get Enrollment by ID

```http
GET /enrollments/:id
Authorization: Bearer {accessToken}
```

### Enroll in Section

```http
POST /enrollments/enroll
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "sectionId": 1
}
```

### Drop Enrollment

```http
DELETE /enrollments/:id
Authorization: Bearer {accessToken}
```

### Validate Enrollment

```http
POST /enrollments/validate
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "sectionId": 1
}
```

### Get Student Schedule

```http
GET /enrollments/schedule
Authorization: Bearer {accessToken}
```

---

## 📊 Grades

### Get My Grades

```http
GET /grades/my-grades
Authorization: Bearer {accessToken}
```

### Get Student Grades

```http
GET /grades/student/:studentId
Authorization: Bearer {accessToken}
```

### Get Student Transcript

```http
GET /grades/transcript/:studentId
Authorization: Bearer {accessToken}
```

### Calculate GPA

```http
GET /grades/gpa/:studentId
Authorization: Bearer {accessToken}
```

### Get Section Grade Components

```http
GET /grades/components/section/:sectionId
Authorization: Bearer {accessToken}
```

### Create Grade Component (Faculty)

```http
POST /grades/components
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "sectionId": 1,
    "name": "Midterm Exam",
    "weight": 30,
    "maxScore": 100
}
```

### Record Grade (Faculty)

```http
POST /grades
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "enrollmentId": 1,
    "componentId": 1,
    "score": 85
}
```

### Update Grade

```http
PUT /grades/:id
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "score": 90
}
```

### Publish Final Grades (Faculty)

```http
POST /grades/publish/:sectionId
Authorization: Bearer {accessToken}
```

---

## 📅 Attendance

### Get All Attendance

```http
GET /attendance
Authorization: Bearer {accessToken}
```

### Get Attendance by ID

```http
GET /attendance/:id
Authorization: Bearer {accessToken}
```

### Get Section Attendance

```http
GET /attendance/section/:sectionId
Authorization: Bearer {accessToken}
```

### Get Attendance Statistics

```http
GET /attendance/stats/:enrollmentId
Authorization: Bearer {accessToken}
```

### Mark Attendance (Faculty)

```http
POST /attendance
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "enrollmentId": 1,
    "scheduleId": 1,
    "status": "PRESENT",
    "date": "2024-11-21"
}
```

### Update Attendance

```http
PUT /attendance/:id
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "status": "ABSENT"
}
```

### Delete Attendance

```http
DELETE /attendance/:id
Authorization: Bearer {accessToken}
```

---

## 🏛️ Departments

### Get All Departments

```http
GET /departments
```

**Query Params:**

-   `collegeId` (optional): Filter by college
-   `search` (optional): Search by name or code

### Get Department by ID

```http
GET /departments/:id
```

### Get Department Specializations

```http
GET /departments/:id/specializations
```

### Get Department Courses

```http
GET /departments/:id/courses
```

### Get Department Students

```http
GET /departments/:id/students
Authorization: Bearer {accessToken}
```

### Create Department (Admin)

```http
POST /departments
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "code": "CS",
    "name": "Computer Science",
    "description": "Department of Computer Science",
    "collegeId": 1
}
```

### Update Department

```http
PUT /departments/:id
Authorization: Bearer {accessToken}
```

### Delete Department

```http
DELETE /departments/:id
Authorization: Bearer {accessToken}
```

---

## 📖 Sections

### Get All Sections

```http
GET /sections
Authorization: Bearer {accessToken}
```

### Get Section by ID

```http
GET /sections/:id
Authorization: Bearer {accessToken}
```

### Create Section (Admin/Faculty)

```http
POST /sections
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "courseId": 1,
    "facultyId": 1,
    "termId": 1,
    "sectionNumber": "A",
    "capacity": 30,
    "location": "Room 101"
}
```

### Update Section

```http
PUT /sections/:id
Authorization: Bearer {accessToken}
```

### Delete Section

```http
DELETE /sections/:id
Authorization: Bearer {accessToken}
```

### Add Section Schedule

```http
POST /sections/:id/schedules
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "dayOfWeek": "MONDAY",
    "startTime": "09:00",
    "endTime": "10:30"
}
```

### Delete Section Schedule

```http
DELETE /sections/:sectionId/schedules/:scheduleId
Authorization: Bearer {accessToken}
```

---

## 👨‍🏫 Faculty

### Get All Faculty

```http
GET /faculty
Authorization: Bearer {accessToken}
```

### Get Faculty by ID

```http
GET /faculty/:id
Authorization: Bearer {accessToken}
```

### Get Faculty Sections

```http
GET /faculty/:id/sections
Authorization: Bearer {accessToken}
```

### Create Faculty (Admin)

```http
POST /faculty
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
    "userId": 2,
    "facultyId": "FAC001",
    "departmentId": 1,
    "title": "Professor",
    "officeLocation": "Building A, Room 201"
}
```

### Update Faculty

```http
PUT /faculty/:id
Authorization: Bearer {accessToken}
```

### Delete Faculty

```http
DELETE /faculty/:id
Authorization: Bearer {accessToken}
```

---

## 🔑 Authentication Headers

For all protected endpoints, include the access token in the header:

```
Authorization: Bearer {accessToken}
```

---

## 📝 Postman Collection Tips

1. **Create Environment Variables:**

    - `baseURL`: `http://localhost:5000/api`
    - `accessToken`: (will be set after login)
    - `refreshToken`: (will be set after login)

2. **Set Token Automatically After Login:**
   Add this script to the Login request's "Tests" tab:

    ```javascript
    const response = pm.response.json();
    pm.environment.set("accessToken", response.accessToken);
    pm.environment.set("refreshToken", response.refreshToken);
    ```

3. **Use Variables in Requests:**
    - URL: `{{baseURL}}/students/profile`
    - Authorization: `Bearer {{accessToken}}`

---

## ⚠️ Common Response Codes

-   `200` - Success
-   `201` - Created
-   `400` - Bad Request
-   `401` - Unauthorized
-   `403` - Forbidden
-   `404` - Not Found
-   `500` - Internal Server Error

---

## 💡 Testing Flow Example

1. **Register** → Get user created
2. **Login** → Get `accessToken` and `refreshToken`
3. **Get Profile** → Verify authentication works
4. **Get Courses** → Browse available courses
5. **Enroll in Section** → Register for a course
6. **Get My Enrollments** → View enrolled courses
7. **Get My Grades** → Check grades

---

**Last Updated:** November 21, 2025
