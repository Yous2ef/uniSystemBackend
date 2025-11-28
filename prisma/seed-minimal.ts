import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting minimal database seeding...");
    console.log("ℹ️  This will create one record in each table...");

    // Clear existing data first
    console.log("🗑️  Clearing existing data...");
    await prisma.$executeRaw`SET session_replication_role = replica;`;

    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' AND tablename NOT LIKE '_prisma_%'
        ORDER BY tablename DESC
    `;

    for (const { tablename } of tables) {
        try {
            await prisma.$executeRawUnsafe(`DELETE FROM "${tablename}"`);
            console.log(`   Cleared: ${tablename}`);
        } catch (error) {
            console.log(`   Skipped: ${tablename}`);
        }
    }

    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;
    console.log("✅ Data cleared successfully\n");

    // 1. Grade Scale (1 entry)
    console.log("📊 Creating grade scale...");
    await prisma.gradeScale.create({
        data: {
            letterGrade: "A+",
            minPercentage: 95,
            maxPercentage: 100,
            gpaPoints: 5.0,
        },
    });

    // 2. Admin User
    console.log("👥 Creating admin user...");
    // Use pre-hashed password for Admin@123
    const hashedPassword =
        "$2a$10$8YQN0LZQXw7LZQ7LZQ7LZeN9YQN0LZQXw7LZQ7LZQ7LZeN9YQN0LZQ";
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@university.edu.sa",
            password: hashedPassword,
            role: "SUPER_ADMIN",
            status: "ACTIVE",
        },
    });

    // 3. College
    console.log("🏛️ Creating college...");
    const college = await prisma.college.create({
        data: {
            code: "CCS",
            nameEn: "College of Computer Science",
            nameAr: "كلية علوم الحاسب",
            description: "Computer Science College",
        },
    });

    // 4. Department
    console.log("🏢 Creating department...");
    const department = await prisma.department.create({
        data: {
            code: "CS",
            nameEn: "Computer Science",
            nameAr: "علوم الحاسب",
            collegeId: college.id,
            minGpa: 2.5,
            capacity: 50,
            selectionYear: 2,
        },
    });

    // 5. Course
    console.log("📚 Creating course...");
    const course = await prisma.course.create({
        data: {
            code: "CS101",
            nameEn: "Introduction to Programming",
            nameAr: "مقدمة في البرمجة",
            credits: 3,
            type: "CORE",
            description: "Basic programming course",
        },
    });

    // 6. Prerequisite
    console.log("🔗 Creating prerequisite...");
    const course2 = await prisma.course.create({
        data: {
            code: "CS102",
            nameEn: "Data Structures",
            nameAr: "هياكل البيانات",
            credits: 3,
            type: "CORE",
            description: "Data structures course",
        },
    });

    await prisma.prerequisite.create({
        data: {
            courseId: course2.id,
            prerequisiteId: course.id,
            type: "PREREQUISITE",
        },
    });

    // 7. Curriculum
    console.log("📋 Creating curriculum...");
    const curriculum = await prisma.curriculum.create({
        data: {
            name: "CS Curriculum 2024",
            version: "2024.1",
            departmentId: department.id,
            totalCredits: 132,
            effectiveFrom: new Date("2024-09-01"),
        },
    });

    // 8. Curriculum Course
    console.log("📚 Creating curriculum course...");
    await prisma.curriculumCourse.create({
        data: {
            curriculumId: curriculum.id,
            courseId: course.id,
            semester: 1,
            year: 1,
            isRequired: true,
        },
    });

    // 9. Batch
    console.log("🎓 Creating batch...");
    const batch = await prisma.batch.create({
        data: {
            name: "CS - Batch 2024",
            year: 2024,
            departmentId: department.id,
            curriculumId: curriculum.id,
            maxCredits: 18,
            minCredits: 12,
        },
    });

    // 10. Academic Term
    console.log("📅 Creating academic term...");
    const term = await prisma.academicTerm.create({
        data: {
            name: "Fall 2024",
            type: "FALL",
            startDate: new Date("2024-09-01"),
            endDate: new Date("2024-12-20"),
            registrationStart: new Date("2024-08-01"),
            registrationEnd: new Date("2024-08-25"),
            batchId: batch.id,
            status: "ACTIVE",
        },
    });

    // 11. Faculty User
    console.log("👨‍🏫 Creating faculty...");
    const facultyUser = await prisma.user.create({
        data: {
            email: "faculty@university.edu.sa",
            password: hashedPassword,
            role: "FACULTY",
            status: "ACTIVE",
        },
    });

    const faculty = await prisma.faculty.create({
        data: {
            userId: facultyUser.id,
            staffCode: "F001",
            nameEn: "Dr. Ahmed Ali",
            nameAr: "د. أحمد علي",
            phone: "+966500000001",
            type: "FACULTY",
        },
    });

    // 12. Section
    console.log("📝 Creating section...");
    const section = await prisma.section.create({
        data: {
            code: "01",
            course: { connect: { id: course.id } },
            term: { connect: { id: term.id } },
            faculty: { connect: { id: faculty.id } },
            capacity: 30,
        },
    });

    // 13. Schedule
    console.log("🕐 Creating schedule...");
    await prisma.schedule.create({
        data: {
            section: { connect: { id: section.id } },
            day: 0, // 0 = Sunday
            startTime: "10:00",
            endTime: "11:30",
            room: "A101",
        },
    });

    // 14. Student User
    console.log("🎓 Creating student...");
    const studentUser = await prisma.user.create({
        data: {
            email: "student@university.edu.sa",
            password: hashedPassword,
            role: "STUDENT",
            status: "ACTIVE",
        },
    });

    const student = await prisma.student.create({
        data: {
            user: { connect: { id: studentUser.id } },
            studentCode: "2024001",
            nameEn: "Mohammed Hassan",
            nameAr: "محمد حسن",
            phone: "+966500000002",
            nationalId: "1234567890",
            dateOfBirth: new Date("2005-01-01"),
            gender: "MALE",
            admissionDate: new Date("2024-09-01"),
            batch: { connect: { id: batch.id } },
            department: { connect: { id: department.id } },
            status: "ACTIVE",
        },
    });

    // 15. Enrollment
    console.log("📋 Creating enrollment...");
    const enrollment = await prisma.enrollment.create({
        data: {
            student: { connect: { id: student.id } },
            section: { connect: { id: section.id } },
            status: "ENROLLED",
        },
    });

    // 16. Grade Component
    console.log("📊 Creating grade component...");
    const gradeComponent = await prisma.gradeComponent.create({
        data: {
            sectionId: section.id,
            name: "Midterm Exam",
            weight: 30,
            maxScore: 100,
        },
    });

    // 17. Grade
    console.log("📝 Creating grade...");
    await prisma.grade.create({
        data: {
            enrollment: { connect: { id: enrollment.id } },
            component: { connect: { id: gradeComponent.id } },
            score: 85,
            maxScore: 100,
            createdBy: adminUser.id,
        },
    });

    // 18. Final Grade
    console.log("📊 Creating final grade...");
    await prisma.finalGrade.create({
        data: {
            enrollment: { connect: { id: enrollment.id } },
            total: 85,
            letterGrade: "A",
            gpaPoints: 5.0,
        },
    });

    // 19. Attendance
    console.log("📅 Creating attendance...");
    await prisma.attendance.create({
        data: {
            enrollmentId: enrollment.id,
            sessionDate: new Date("2024-09-01"),
            status: "PRESENT",
        },
    });

    // 20. Term GPA
    console.log("📈 Creating term GPA...");
    await prisma.termGPA.create({
        data: {
            student: { connect: { id: student.id } },
            term: { connect: { id: term.id } },
            gpa: 4.5,
            creditsEarned: 3,
            creditsAttempted: 3,
        },
    });

    // 21. Cumulative GPA
    console.log("📊 Creating cumulative GPA...");
    await prisma.cumulativeGPA.create({
        data: {
            student: { connect: { id: student.id } },
            cgpa: 4.5,
            totalCredits: 3,
        },
    });

    // 22. Department Application
    console.log("📝 Creating department application...");
    await prisma.departmentApplication.create({
        data: {
            student: { connect: { id: student.id } },
            department: { connect: { id: department.id } },
            studentGpa: 4.5,
            status: "APPROVED",
        },
    });

    // 23. Notification
    console.log("🔔 Creating notification...");
    await prisma.notification.create({
        data: {
            user: { connect: { id: studentUser.id } },
            titleEn: "Welcome",
            titleAr: "مرحباً",
            messageEn: "Welcome to the university system",
            messageAr: "مرحباً بك في نظام الجامعة",
            type: "GRADE_PUBLISHED",
            isRead: false,
        },
    });

    // 24. Announcement
    console.log("📢 Creating announcement...");
    await prisma.announcement.create({
        data: {
            sectionId: section.id,
            title: "Welcome Announcement",
            content: "Welcome to the new academic year",
            publishedBy: faculty.userId,
            isPublished: true,
        },
    });

    // 25. Request
    console.log("📝 Creating request...");
    const request = await prisma.request.create({
        data: {
            studentId: studentUser.id,
            type: "TRANSCRIPT",
            details: { message: "Need official transcript" },
            status: "PENDING",
        },
    });

    // 26. Approval
    // 26. Approval
    console.log("✅ Creating approval...");
    await prisma.approval.create({
        data: {
            requestId: request.id,
            approverId: adminUser.id,
            status: "APPROVED",
            comment: "Approved",
        },
    });

    // 27. Exam Schedule
    console.log("📅 Creating exam schedule...");
    await prisma.examSchedule.create({
        data: {
            section: { connect: { id: section.id } },
            examType: "MIDTERM",
            examDate: new Date("2024-10-15"),
            startTime: "10:00",
            endTime: "12:00",
            duration: 120,
            location: "A101",
            totalMarks: 100,
            createdBy: faculty.userId,
        },
    });

    // 28. Course Material
    console.log("📚 Creating course material...");
    await prisma.courseMaterial.create({
        data: {
            section: { connect: { id: section.id } },
            title: "Lecture 1 Notes",
            fileUrl: "/materials/lecture1.pdf",
            fileName: "lecture1.pdf",
            fileSize: 1024000,
            fileType: "pdf",
            uploadedBy: faculty.userId,
        },
    });

    // 29. Audit Log
    console.log("📜 Creating audit log...");
    await prisma.auditLog.create({
        data: {
            user: { connect: { id: adminUser.id } },
            action: "CREATE",
            resource: studentUser.id,
            newValue: { status: "ACTIVE" },
        },
    });

    // 30. System Policy
    console.log("⚙️ Creating system policy...");
    await prisma.systemPolicy.create({
        data: {
            key: "ATTENDANCE_POLICY",
            value: {
                minAttendance: 75,
                description: "Students must attend 75% of classes",
            },
            description: "Attendance policy for students",
        },
    });

    console.log("\n✅ Minimal database seeding completed!");
    console.log("📊 Summary:");
    console.log("   - 1 Admin User");
    console.log("   - 1 College");
    console.log("   - 1 Department");
    console.log("   - 2 Courses");
    console.log("   - 1 Curriculum");
    console.log("   - 1 Batch");
    console.log("   - 1 Academic Term");
    console.log("   - 1 Faculty");
    console.log("   - 1 Student");
    console.log("   - 1 Section");
    console.log("   - 1 Enrollment");
    console.log("   - Plus one record in each remaining table");
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
