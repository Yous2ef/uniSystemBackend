import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/auth";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await prisma.enrollment.deleteMany();
    await prisma.section.deleteMany();
    await prisma.student.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.academicTerm.deleteMany();
    await prisma.curriculumCourse.deleteMany();
    await prisma.prerequisite.deleteMany();
    await prisma.batch.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.course.deleteMany();
    await prisma.department.deleteMany();
    await prisma.college.deleteMany();
    await prisma.user.deleteMany();
    await prisma.gradeScale.deleteMany();

    // 1. Create Grade Scale
    console.log("📊 Creating grade scale...");
    const gradeScales = [
        {
            minPercentage: 97,
            maxPercentage: 100,
            letterGrade: "A+",
            gpaPoints: 4.0,
        },
        {
            minPercentage: 93,
            maxPercentage: 96,
            letterGrade: "A",
            gpaPoints: 4.0,
        },
        {
            minPercentage: 90,
            maxPercentage: 92,
            letterGrade: "A-",
            gpaPoints: 3.7,
        },
        {
            minPercentage: 87,
            maxPercentage: 89,
            letterGrade: "B+",
            gpaPoints: 3.3,
        },
        {
            minPercentage: 83,
            maxPercentage: 86,
            letterGrade: "B",
            gpaPoints: 3.0,
        },
        {
            minPercentage: 80,
            maxPercentage: 82,
            letterGrade: "B-",
            gpaPoints: 2.7,
        },
        {
            minPercentage: 77,
            maxPercentage: 79,
            letterGrade: "C+",
            gpaPoints: 2.3,
        },
        {
            minPercentage: 73,
            maxPercentage: 76,
            letterGrade: "C",
            gpaPoints: 2.0,
        },
        {
            minPercentage: 70,
            maxPercentage: 72,
            letterGrade: "C-",
            gpaPoints: 1.7,
        },
        {
            minPercentage: 67,
            maxPercentage: 69,
            letterGrade: "D+",
            gpaPoints: 1.3,
        },
        {
            minPercentage: 63,
            maxPercentage: 66,
            letterGrade: "D",
            gpaPoints: 1.0,
        },
        {
            minPercentage: 60,
            maxPercentage: 62,
            letterGrade: "D-",
            gpaPoints: 0.7,
        },
        {
            minPercentage: 0,
            maxPercentage: 59,
            letterGrade: "F",
            gpaPoints: 0.0,
        },
    ];

    // Clear existing grade scales
    await prisma.gradeScale.deleteMany({});

    // Create grade scales
    for (const scale of gradeScales) {
        await prisma.gradeScale.create({
            data: scale,
        });
    }

    // 2. Create System Policies
    console.log("⚙️ Creating system policies...");
    const policies = [
        {
            key: "max_credits_per_term",
            value: { value: 18 },
            description: "Maximum credits a student can take per term",
        },
        {
            key: "min_credits_per_term",
            value: { value: 12 },
            description: "Minimum credits for full-time students",
        },
        {
            key: "min_attendance_percentage",
            value: { value: 75 },
            description: "Minimum attendance percentage to take final exam",
        },
        {
            key: "retake_policy",
            value: { type: "highest" },
            description: "Retake policy: highest, latest, or average",
        },
        {
            key: "academic_standing_rules",
            value: {
                good_standing: { min: 2.0 },
                warning: { min: 1.75, max: 1.99 },
                probation: { min: 1.5, max: 1.74 },
                dismissal: { max: 1.49 },
            },
            description: "Academic standing thresholds",
        },
    ];

    for (const policy of policies) {
        await prisma.systemPolicy.upsert({
            where: { key: policy.key },
            update: policy,
            create: policy,
        });
    }

    // 3. Create Super Admin
    console.log("👤 Creating super admin...");
    const superAdminPassword = await hashPassword("Admin@123");
    const superAdmin = await prisma.user.upsert({
        where: { email: "admin@university.edu" },
        update: {},
        create: {
            email: "admin@university.edu",
            password: superAdminPassword,
            role: "SUPER_ADMIN",
            status: "ACTIVE",
        },
    });

    // 4. Create College of Computer Science (Fixed)
    console.log("🏛️ Creating College of Computer Science...");
    const college = await prisma.college.upsert({
        where: { code: "CS" },
        update: {},
        create: {
            code: "CS",
            nameEn: "College of Computer Science",
            nameAr: "كلية علوم الحاسب",
            description:
                "College of Computer Science - The only college in the system",
        },
    });

    // 5. Create CS Departments (merged with specializations)
    console.log("🏢 Creating Computer Science Departments...");
    const departmentData = [
        {
            code: "CSSE",
            nameEn: "Software Engineering",
            nameAr: "هندسة البرمجيات",
            minGpa: 2.5,
            capacity: 120,
            selectionYear: 2,
        },
        {
            code: "CSDS",
            nameEn: "Data Science",
            nameAr: "علم البيانات",
            minGpa: 2.75,
            capacity: 80,
            selectionYear: 2,
        },
        {
            code: "CSIS",
            nameEn: "Information Systems",
            nameAr: "نظم المعلومات",
            minGpa: 2.5,
            capacity: 100,
            selectionYear: 2,
        },
        {
            code: "CSCY",
            nameEn: "Cybersecurity",
            nameAr: "الأمن السيبراني",
            minGpa: 3.0,
            capacity: 60,
            selectionYear: 2,
        },
    ];

    const departments: any[] = [];
    for (const dept of departmentData) {
        const department = await prisma.department.upsert({
            where: { code: dept.code },
            update: {},
            create: {
                ...dept,
                collegeId: college.id,
            },
        });
        departments.push(department);
    }

    const department = departments[0]; // Use first department (CSSE) for examples

    // 6. Create CS Courses (More comprehensive set)
    console.log("📚 Creating CS courses...");
    const courses = [
        // Year 1 - General Foundation Courses
        {
            code: "CS101",
            nameEn: "Introduction to Programming",
            nameAr: "مقدمة في البرمجة",
            credits: 3,
            type: "CORE",
        },
        {
            code: "CS102",
            nameEn: "Computer Fundamentals",
            nameAr: "أساسيات الحاسب",
            credits: 3,
            type: "CORE",
        },
        {
            code: "MATH101",
            nameEn: "Calculus I",
            nameAr: "التفاضل والتكامل 1",
            credits: 4,
            type: "CORE",
        },
        {
            code: "MATH102",
            nameEn: "Discrete Mathematics",
            nameAr: "الرياضيات المتقطعة",
            credits: 3,
            type: "CORE",
        },
        {
            code: "ENG101",
            nameEn: "English Language I",
            nameAr: "اللغة الإنجليزية 1",
            credits: 3,
            type: "GENERAL",
        },

        // Year 2 - Core CS Courses
        {
            code: "CS201",
            nameEn: "Data Structures",
            nameAr: "هياكل البيانات",
            credits: 3,
            type: "CORE",
        },
        {
            code: "CS202",
            nameEn: "Object-Oriented Programming",
            nameAr: "البرمجة الكائنية",
            credits: 3,
            type: "CORE",
        },
        {
            code: "CS210",
            nameEn: "Database Systems",
            nameAr: "نظم قواعد البيانات",
            credits: 3,
            type: "CORE",
        },
        {
            code: "CS220",
            nameEn: "Computer Organization",
            nameAr: "تنظيم الحاسب",
            credits: 3,
            type: "CORE",
        },

        // Year 3 - Advanced Core
        {
            code: "CS301",
            nameEn: "Algorithms",
            nameAr: "الخوارزميات",
            credits: 3,
            type: "CORE",
        },
        {
            code: "CS310",
            nameEn: "Operating Systems",
            nameAr: "نظم التشغيل",
            credits: 3,
            type: "CORE",
        },
        {
            code: "CS320",
            nameEn: "Computer Networks",
            nameAr: "شبكات الحاسب",
            credits: 3,
            type: "CORE",
        },
        {
            code: "CS330",
            nameEn: "Software Engineering",
            nameAr: "هندسة البرمجيات",
            credits: 3,
            type: "CORE",
        },

        // Year 4 - Specialization Electives
        {
            code: "CS401",
            nameEn: "Machine Learning",
            nameAr: "تعلم الآلة",
            credits: 3,
            type: "ELECTIVE",
        },
        {
            code: "CS402",
            nameEn: "Web Development",
            nameAr: "تطوير الويب",
            credits: 3,
            type: "ELECTIVE",
        },
        {
            code: "CS403",
            nameEn: "Mobile Application Development",
            nameAr: "تطوير تطبيقات الجوال",
            credits: 3,
            type: "ELECTIVE",
        },
        {
            code: "CS410",
            nameEn: "Information Security",
            nameAr: "أمن المعلومات",
            credits: 3,
            type: "ELECTIVE",
        },
        {
            code: "CS420",
            nameEn: "Cloud Computing",
            nameAr: "الحوسبة السحابية",
            credits: 3,
            type: "ELECTIVE",
        },
        {
            code: "CS490",
            nameEn: "Graduation Project I",
            nameAr: "مشروع التخرج 1",
            credits: 3,
            type: "CORE",
        },
        {
            code: "CS491",
            nameEn: "Graduation Project II",
            nameAr: "مشروع التخرج 2",
            credits: 3,
            type: "CORE",
        },
    ];

    for (const course of courses) {
        await prisma.course.upsert({
            where: { code: course.code },
            update: {},
            create: course,
        });
    }

    // 8. Create Sample Faculty
    console.log("👨‍🏫 Creating faculty...");
    const facultyPassword = await hashPassword("Faculty@123");
    const facultyUser = await prisma.user.upsert({
        where: { email: "faculty@university.edu" },
        update: {},
        create: {
            email: "faculty@university.edu",
            password: facultyPassword,
            role: "FACULTY",
            status: "ACTIVE",
        },
    });

    await prisma.faculty.upsert({
        where: { userId: facultyUser.id },
        update: {},
        create: {
            userId: facultyUser.id,
            staffCode: "FAC001",
            nameEn: "Dr. Ahmed Mohamed",
            nameAr: "د. أحمد محمد",
            phone: "+966501234567",
            type: "FACULTY",
        },
    });

    // 9. Create Sample Student
    console.log("🎓 Creating student...");
    const studentPassword = await hashPassword("Student@123");
    const studentUser = await prisma.user.upsert({
        where: { email: "student@university.edu" },
        update: {},
        create: {
            email: "student@university.edu",
            password: studentPassword,
            role: "STUDENT",
            status: "ACTIVE",
        },
    });

    // Create curriculum first
    const curriculum = await prisma.curriculum.create({
        data: {
            departmentId: department.id,
            name: "Software Engineering Curriculum 2024",
            version: "1.0",
            totalCredits: 132,
            effectiveFrom: new Date("2024-01-01"),
        },
    });

    // Create batch
    const batch = await prisma.batch.create({
        data: {
            name: "Batch 2024",
            year: 2024,
            departmentId: department.id,
            curriculumId: curriculum.id,
            maxCredits: 18,
            minCredits: 12,
        },
    });

    await prisma.student.upsert({
        where: { userId: studentUser.id },
        update: {},
        create: {
            userId: studentUser.id,
            studentCode: "20240001",
            batchId: batch.id,
            nameEn: "Ahmed Hassan",
            nameAr: "أحمد حسن",
            phone: "+966509876543",
            nationalId: "1234567890",
            status: "ACTIVE",
            admissionDate: new Date("2024-09-01"),
        },
    });

    console.log("✅ Database seeding completed!");
    console.log("\n📝 Default Accounts:");
    console.log("Super Admin: admin@university.edu / Admin@123");
    console.log("Faculty: faculty@university.edu / Faculty@123");
    console.log("Student: student@university.edu / Student@123");
}

main()
    .catch((e) => {
        console.error("❌ Seeding error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
