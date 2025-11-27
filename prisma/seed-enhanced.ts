import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/auth";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting comprehensive database seeding...");

    // ============================================
    // CLEAR EXISTING DATA
    // ============================================
    console.log("🗑️  Clearing existing data...");
    await prisma.attendance.deleteMany();
    await prisma.finalGrade.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.gradeComponent.deleteMany();
    await prisma.termGPA.deleteMany();
    await prisma.cumulativeGPA.deleteMany();
    await prisma.departmentApplication.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.section.deleteMany();
    await prisma.academicTerm.deleteMany();
    await prisma.curriculumCourse.deleteMany();
    await prisma.prerequisite.deleteMany();
    await prisma.student.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.batch.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.course.deleteMany();
    await prisma.department.deleteMany();
    await prisma.college.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.gradeScale.deleteMany();

    // ============================================
    // PART 1: FOUNDATION DATA
    // ============================================

    // 1. Grade Scale
    console.log("📊 Creating grade scale...");
    const gradeScales = [
        {
            minPercentage: 95,
            maxPercentage: 100,
            letterGrade: "A+",
            gpaPoints: 4.0,
        },
        {
            minPercentage: 90,
            maxPercentage: 94,
            letterGrade: "A",
            gpaPoints: 3.75,
        },
        {
            minPercentage: 85,
            maxPercentage: 89,
            letterGrade: "B+",
            gpaPoints: 3.5,
        },
        {
            minPercentage: 80,
            maxPercentage: 84,
            letterGrade: "B",
            gpaPoints: 3.0,
        },
        {
            minPercentage: 75,
            maxPercentage: 79,
            letterGrade: "C+",
            gpaPoints: 2.5,
        },
        {
            minPercentage: 70,
            maxPercentage: 74,
            letterGrade: "C",
            gpaPoints: 2.0,
        },
        {
            minPercentage: 65,
            maxPercentage: 69,
            letterGrade: "D+",
            gpaPoints: 1.5,
        },
        {
            minPercentage: 60,
            maxPercentage: 64,
            letterGrade: "D",
            gpaPoints: 1.0,
        },
        {
            minPercentage: 0,
            maxPercentage: 59,
            letterGrade: "F",
            gpaPoints: 0.0,
        },
    ];
    for (const scale of gradeScales) {
        await prisma.gradeScale.create({ data: scale });
    }

    // 2. Admin Accounts
    console.log("👥 Creating admin accounts...");
    const adminPassword = await hashPassword("Admin@123");
    const facultyPassword = await hashPassword("Faculty@123");

    const superAdmin = await prisma.user.create({
        data: {
            email: "admin@university.edu",
            password: adminPassword,
            role: "SUPER_ADMIN",
            status: "ACTIVE",
        },
    });

    const admin = await prisma.user.create({
        data: {
            email: "admin2@university.edu",
            password: adminPassword,
            role: "ADMIN",
            status: "ACTIVE",
        },
    });

    await prisma.user.create({
        data: {
            email: "faculty.admin@university.edu",
            password: facultyPassword,
            role: "ADMIN",
            status: "ACTIVE",
        },
    });

    // 3. College
    console.log("🏛️ Creating College...");
    const college = await prisma.college.create({
        data: {
            code: "CCS",
            nameEn: "College of Computer Science and Information",
            nameAr: "كلية علوم الحاسب والمعلومات",
            description:
                "Leading institution for computer science education in the Kingdom",
        },
    });

    // 4. Departments
    console.log("🏢 Creating 4 Departments...");
    const departments = await Promise.all([
        prisma.department.create({
            data: {
                code: "CSSE",
                nameEn: "Software Engineering",
                nameAr: "هندسة البرمجيات",
                collegeId: college.id,
                minGpa: 2.5,
                capacity: 40,
                selectionYear: 2,
            },
        }),
        prisma.department.create({
            data: {
                code: "CSDS",
                nameEn: "Data Science & Artificial Intelligence",
                nameAr: "علم البيانات والذكاء الاصطناعي",
                collegeId: college.id,
                minGpa: 2.75,
                capacity: 30,
                selectionYear: 2,
            },
        }),
        prisma.department.create({
            data: {
                code: "CSIS",
                nameEn: "Information Systems",
                nameAr: "نظم المعلومات",
                collegeId: college.id,
                minGpa: 2.5,
                capacity: 35,
                selectionYear: 2,
            },
        }),
        prisma.department.create({
            data: {
                code: "CSCY",
                nameEn: "Cybersecurity",
                nameAr: "الأمن السيبراني",
                collegeId: college.id,
                minGpa: 3.0,
                capacity: 25,
                selectionYear: 2,
            },
        }),
    ]);

    // 5. Courses (31 courses)
    console.log("📚 Creating 31 Courses...");
    const coursesData = [
        // Year 1 Semester 1 - General (6 courses)
        {
            code: "CS101",
            nameEn: "Introduction to Programming",
            nameAr: "مقدمة في البرمجة",
            credits: 3,
            type: "CORE" as const,
            description: "Learn programming fundamentals using Python",
            departmentId: null,
        },
        {
            code: "CS102",
            nameEn: "Computer Fundamentals",
            nameAr: "أساسيات الحاسب الآلي",
            credits: 3,
            type: "CORE" as const,
            description:
                "Introduction to computer architecture and organization",
            departmentId: null,
        },
        {
            code: "MATH101",
            nameEn: "Calculus I",
            nameAr: "حساب التفاضل والتكامل 1",
            credits: 4,
            type: "CORE" as const,
            description: "Limits, derivatives, and applications",
            departmentId: null,
        },
        {
            code: "ENG101",
            nameEn: "English Language I",
            nameAr: "اللغة الإنجليزية 1",
            credits: 2,
            type: "GENERAL" as const,
            description: "Academic English and technical writing",
            departmentId: null,
        },
        {
            code: "ARAB101",
            nameEn: "Arabic Language",
            nameAr: "اللغة العربية",
            credits: 2,
            type: "GENERAL" as const,
            description: "Arabic language and communication skills",
            departmentId: null,
        },
        {
            code: "ISLAM101",
            nameEn: "Islamic Culture",
            nameAr: "الثقافة الإسلامية",
            credits: 2,
            type: "GENERAL" as const,
            description: "Islamic values and culture",
            departmentId: null,
        },

        // Year 1 Semester 2 - General (6 courses)
        {
            code: "CS103",
            nameEn: "Object-Oriented Programming",
            nameAr: "البرمجة الكائنية",
            credits: 3,
            type: "CORE" as const,
            description: "OOP concepts using Java",
            departmentId: null,
        },
        {
            code: "CS104",
            nameEn: "Data Structures",
            nameAr: "هياكل البيانات",
            credits: 3,
            type: "CORE" as const,
            description: "Arrays, linked lists, stacks, queues, trees",
            departmentId: null,
        },
        {
            code: "MATH102",
            nameEn: "Discrete Mathematics",
            nameAr: "الرياضيات المتقطعة",
            credits: 3,
            type: "CORE" as const,
            description: "Logic, sets, relations, graphs, combinatorics",
            departmentId: null,
        },
        {
            code: "STAT101",
            nameEn: "Statistics & Probability",
            nameAr: "الإحصاء والاحتمالات",
            credits: 3,
            type: "CORE" as const,
            description: "Statistical analysis and probability theory",
            departmentId: null,
        },
        {
            code: "PHYS101",
            nameEn: "Physics I",
            nameAr: "الفيزياء 1",
            credits: 3,
            type: "GENERAL" as const,
            description: "Mechanics and thermodynamics",
            departmentId: null,
        },
        {
            code: "ENG102",
            nameEn: "English Language II",
            nameAr: "اللغة الإنجليزية 2",
            credits: 2,
            type: "GENERAL" as const,
            description: "Advanced technical English",
            departmentId: null,
        },

        // Year 2 Semester 1 - Core CS (4 courses)
        {
            code: "CS201",
            nameEn: "Algorithms & Complexity",
            nameAr: "الخوارزميات وتحليل التعقيد",
            credits: 3,
            type: "CORE" as const,
            description: "Algorithm design, analysis, and complexity theory",
            departmentId: null,
        },
        {
            code: "CS202",
            nameEn: "Database Systems",
            nameAr: "نظم قواعد البيانات",
            credits: 3,
            type: "CORE" as const,
            description:
                "Relational databases, SQL, normalization, transactions",
            departmentId: null,
        },
        {
            code: "CS203",
            nameEn: "Computer Architecture",
            nameAr: "تنظيم الحاسب",
            credits: 3,
            type: "CORE" as const,
            description: "CPU design, memory hierarchy, I/O systems",
            departmentId: null,
        },
        {
            code: "MATH201",
            nameEn: "Linear Algebra",
            nameAr: "الجبر الخطي",
            credits: 3,
            type: "CORE" as const,
            description: "Matrices, vectors, eigenvalues, transformations",
            departmentId: null,
        },

        // Year 2 Semester 2 - Core CS (3 courses)
        {
            code: "CS204",
            nameEn: "Operating Systems",
            nameAr: "نظم التشغيل",
            credits: 3,
            type: "CORE" as const,
            description:
                "Process management, memory, file systems, concurrency",
            departmentId: null,
        },
        {
            code: "CS205",
            nameEn: "Computer Networks",
            nameAr: "شبكات الحاسب",
            credits: 3,
            type: "CORE" as const,
            description: "OSI model, TCP/IP, routing, protocols",
            departmentId: null,
        },
        {
            code: "CS206",
            nameEn: "Software Engineering",
            nameAr: "هندسة البرمجيات",
            credits: 3,
            type: "CORE" as const,
            description: "SDLC, requirements, design patterns, testing",
            departmentId: null,
        },

        // Software Engineering Specialization (3 courses)
        {
            code: "SE301",
            nameEn: "Web Development",
            nameAr: "تطوير تطبيقات الويب",
            credits: 3,
            type: "CORE" as const,
            description: "HTML, CSS, JavaScript, React, Node.js",
            departmentId: departments[0].id,
        },
        {
            code: "SE302",
            nameEn: "Mobile App Development",
            nameAr: "تطوير تطبيقات الهاتف",
            credits: 3,
            type: "CORE" as const,
            description: "iOS and Android development",
            departmentId: departments[0].id,
        },
        {
            code: "SE401",
            nameEn: "DevOps & Cloud Computing",
            nameAr: "DevOps والحوسبة السحابية",
            credits: 3,
            type: "ELECTIVE" as const,
            description: "CI/CD, Docker, Kubernetes, AWS, Azure",
            departmentId: departments[0].id,
        },

        // Data Science & AI Specialization (3 courses)
        {
            code: "DS301",
            nameEn: "Machine Learning",
            nameAr: "تعلم الآلة",
            credits: 3,
            type: "CORE" as const,
            description: "Supervised and unsupervised learning algorithms",
            departmentId: departments[1].id,
        },
        {
            code: "DS302",
            nameEn: "Deep Learning",
            nameAr: "التعلم العميق",
            credits: 3,
            type: "CORE" as const,
            description: "Neural networks, CNN, RNN, transformers",
            departmentId: departments[1].id,
        },
        {
            code: "DS401",
            nameEn: "Natural Language Processing",
            nameAr: "معالجة اللغات الطبيعية",
            credits: 3,
            type: "ELECTIVE" as const,
            description: "Text processing, NLP models, transformers",
            departmentId: departments[1].id,
        },

        // Information Systems Specialization (2 courses)
        {
            code: "IS301",
            nameEn: "Enterprise Systems",
            nameAr: "نظم المعلومات المؤسسية",
            credits: 3,
            type: "CORE" as const,
            description: "ERP, CRM, business intelligence",
            departmentId: departments[2].id,
        },
        {
            code: "IS401",
            nameEn: "E-Commerce Systems",
            nameAr: "نظم التجارة الإلكترونية",
            credits: 3,
            type: "ELECTIVE" as const,
            description: "Online business models, payment systems, security",
            departmentId: departments[2].id,
        },

        // Cybersecurity Specialization (2 courses)
        {
            code: "CY301",
            nameEn: "Network Security",
            nameAr: "أمن الشبكات",
            credits: 3,
            type: "CORE" as const,
            description: "Firewalls, VPNs, intrusion detection",
            departmentId: departments[3].id,
        },
        {
            code: "CY401",
            nameEn: "Ethical Hacking & Penetration Testing",
            nameAr: "الاختراق الأخلاقي واختبار الاختراق",
            credits: 3,
            type: "ELECTIVE" as const,
            description: "Vulnerability assessment, exploitation techniques",
            departmentId: departments[3].id,
        },

        // Graduation Projects - General (2 courses)
        {
            code: "CS490",
            nameEn: "Graduation Project I",
            nameAr: "مشروع التخرج 1",
            credits: 3,
            type: "CORE" as const,
            description: "Project proposal, design, and initial implementation",
            departmentId: null,
        },
        {
            code: "CS491",
            nameEn: "Graduation Project II",
            nameAr: "مشروع التخرج 2",
            credits: 3,
            type: "CORE" as const,
            description:
                "Project completion, testing, documentation, presentation",
            departmentId: null,
        },
    ];

    const courses: any[] = [];
    for (const courseData of coursesData) {
        const course = await prisma.course.create({ data: courseData });
        courses.push(course);
    }

    // 6. Prerequisites
    console.log("🔗 Creating course prerequisites...");
    const prerequisitesData = [
        { courseCode: "CS104", prerequisiteCode: "CS101" },
        { courseCode: "ENG102", prerequisiteCode: "ENG101" },
        { courseCode: "CS201", prerequisiteCode: "CS104" },
        { courseCode: "CS204", prerequisiteCode: "CS203" },
        { courseCode: "DS301", prerequisiteCode: "STAT101" },
        { courseCode: "DS301", prerequisiteCode: "MATH201" },
        { courseCode: "DS302", prerequisiteCode: "DS301" },
        { courseCode: "CY301", prerequisiteCode: "CS205" },
        { courseCode: "CS491", prerequisiteCode: "CS490" },
    ];

    for (const prereq of prerequisitesData) {
        const course = courses.find((c) => c.code === prereq.courseCode);
        const prerequisite = courses.find(
            (c) => c.code === prereq.prerequisiteCode
        );
        if (course && prerequisite) {
            await prisma.prerequisite.create({
                data: {
                    courseId: course.id,
                    prerequisiteId: prerequisite.id,
                    type: "PREREQUISITE",
                },
            });
        }
    }

    // 7. Curricula (4 curricula - one per department)
    console.log("📋 Creating 4 Curricula...");
    const curricula: any[] = [];
    for (const dept of departments) {
        const curriculum = await prisma.curriculum.create({
            data: {
                departmentId: dept.id,
                name: `${dept.nameEn} Curriculum 2023-2027`,
                version: "2023.1",
                totalCredits: 132,
                effectiveFrom: new Date("2023-09-01"),
            },
        });
        curricula.push(curriculum);
    }

    // 8. Map courses to curricula
    console.log("📚 Mapping courses to curricula...");
    const year1Courses = [
        { code: "CS101", semester: 1, year: 1 },
        { code: "CS102", semester: 1, year: 1 },
        { code: "MATH101", semester: 1, year: 1 },
        { code: "ENG101", semester: 1, year: 1 },
        { code: "ARAB101", semester: 1, year: 1 },
        { code: "ISLAM101", semester: 1, year: 1 },
        { code: "CS103", semester: 2, year: 1 },
        { code: "CS104", semester: 2, year: 1 },
        { code: "MATH102", semester: 2, year: 1 },
        { code: "STAT101", semester: 2, year: 1 },
        { code: "PHYS101", semester: 2, year: 1 },
        { code: "ENG102", semester: 2, year: 1 },
    ];

    const year2Courses = [
        { code: "CS201", semester: 1, year: 2 },
        { code: "CS202", semester: 1, year: 2 },
        { code: "CS203", semester: 1, year: 2 },
        { code: "MATH201", semester: 1, year: 2 },
        { code: "CS204", semester: 2, year: 2 },
        { code: "CS205", semester: 2, year: 2 },
        { code: "CS206", semester: 2, year: 2 },
    ];

    const specializationMap: { [key: string]: any[] } = {
        CSSE: [
            { code: "SE301", semester: 1, year: 3 },
            { code: "SE302", semester: 2, year: 3 },
            { code: "SE401", semester: 1, year: 4 },
        ],
        CSDS: [
            { code: "DS301", semester: 1, year: 3 },
            { code: "DS302", semester: 2, year: 3 },
            { code: "DS401", semester: 1, year: 4 },
        ],
        CSIS: [
            { code: "IS301", semester: 1, year: 3 },
            { code: "IS401", semester: 1, year: 4 },
        ],
        CSCY: [
            { code: "CY301", semester: 1, year: 3 },
            { code: "CY401", semester: 1, year: 4 },
        ],
    };

    const gradProjects = [
        { code: "CS490", semester: 1, year: 4 },
        { code: "CS491", semester: 2, year: 4 },
    ];

    for (const curriculum of curricula) {
        const dept = departments.find((d) => d.id === curriculum.departmentId);
        if (!dept) continue;

        const commonCourses = [...year1Courses, ...year2Courses];
        for (const plan of commonCourses) {
            const course = courses.find((c) => c.code === plan.code);
            if (course) {
                await prisma.curriculumCourse.create({
                    data: {
                        curriculumId: curriculum.id,
                        courseId: course.id,
                        semester: plan.semester,
                        year: plan.year,
                        isRequired: true,
                    },
                });
            }
        }

        const specCourses = specializationMap[dept.code] || [];
        for (const plan of specCourses) {
            const course = courses.find((c) => c.code === plan.code);
            if (course) {
                await prisma.curriculumCourse.create({
                    data: {
                        curriculumId: curriculum.id,
                        courseId: course.id,
                        semester: plan.semester,
                        year: plan.year,
                        isRequired: plan.code.includes("401") ? false : true,
                    },
                });
            }
        }

        for (const plan of gradProjects) {
            const course = courses.find((c) => c.code === plan.code);
            if (course) {
                await prisma.curriculumCourse.create({
                    data: {
                        curriculumId: curriculum.id,
                        courseId: course.id,
                        semester: plan.semester,
                        year: plan.year,
                        isRequired: true,
                    },
                });
            }
        }
    }

    console.log("✅ Part 1 completed: Foundation data created");
    console.log(`   - Grade Scale: 9 levels`);
    console.log(`   - Admin Accounts: 3 users`);
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Prerequisites: ${prerequisitesData.length}`);
    console.log(`   - Curricula: ${curricula.length}`);

    // ============================================
    // PART 2: BATCHES, TERMS, FACULTY, STUDENTS
    // ============================================

    // 9. Create Batches (5 batches: 2021-2025)
    console.log("🎓 Creating 5 Batches (2021-2025)...");
    const batches: any[] = [];

    // Batch 2021 - Graduated students (mixed departments)
    for (let i = 0; i < 4; i++) {
        const dept = departments[i];
        const curriculum = curricula[i];
        const batch = await prisma.batch.create({
            data: {
                name: `${dept.code} - Batch 2021`,
                year: 2021,
                departmentId: dept.id,
                curriculumId: curriculum.id,
                maxCredits: 18,
                minCredits: 12,
            },
        });
        batches.push(batch);
    }

    // Batches 2022-2025 (one per department or general)
    for (const year of [2022, 2023, 2024, 2025]) {
        for (let i = 0; i < 4; i++) {
            const dept = departments[i];
            const curriculum = curricula[i];
            const batch = await prisma.batch.create({
                data: {
                    name: `${dept.code} - Batch ${year}`,
                    year: year,
                    departmentId: year >= 2024 ? null : dept.id, // 2024 & 2025 no department yet
                    curriculumId: curriculum.id,
                    maxCredits: 18,
                    minCredits: 12,
                },
            });
            batches.push(batch);
        }
    }

    // 10. Academic Terms (12 terms from Fall 2021 to Summer 2025)
    console.log("📅 Creating Academic Terms...");
    const mainBatch = batches.find(
        (b) => b.year === 2023 && b.name.includes("CSSE")
    );
    if (!mainBatch) throw new Error("Main batch not found");

    const termsData = [
        // 2021-2022 Academic Year
        {
            name: "Fall 2021",
            type: "FALL" as const,
            status: "COMPLETED" as const,
            startDate: new Date("2021-09-01"),
            endDate: new Date("2021-12-20"),
            registrationStart: new Date("2021-08-01"),
            registrationEnd: new Date("2021-08-25"),
        },
        {
            name: "Spring 2022",
            type: "SPRING" as const,
            status: "COMPLETED" as const,
            startDate: new Date("2022-02-01"),
            endDate: new Date("2022-05-25"),
            registrationStart: new Date("2022-01-01"),
            registrationEnd: new Date("2022-01-20"),
        },
        {
            name: "Summer 2022",
            type: "SUMMER" as const,
            status: "COMPLETED" as const,
            startDate: new Date("2022-06-15"),
            endDate: new Date("2022-08-10"),
            registrationStart: new Date("2022-05-26"),
            registrationEnd: new Date("2022-06-10"),
        },

        // 2022-2023 Academic Year
        {
            name: "Fall 2022",
            type: "FALL" as const,
            status: "COMPLETED" as const,
            startDate: new Date("2022-09-01"),
            endDate: new Date("2022-12-20"),
            registrationStart: new Date("2022-08-01"),
            registrationEnd: new Date("2022-08-25"),
        },
        {
            name: "Spring 2023",
            type: "SPRING" as const,
            status: "COMPLETED" as const,
            startDate: new Date("2023-02-01"),
            endDate: new Date("2023-05-25"),
            registrationStart: new Date("2023-01-01"),
            registrationEnd: new Date("2023-01-20"),
        },

        // 2023-2024 Academic Year
        {
            name: "Fall 2023",
            type: "FALL" as const,
            status: "COMPLETED" as const,
            startDate: new Date("2023-09-01"),
            endDate: new Date("2023-12-20"),
            registrationStart: new Date("2023-08-01"),
            registrationEnd: new Date("2023-08-25"),
        },
        {
            name: "Spring 2024",
            type: "SPRING" as const,
            status: "COMPLETED" as const,
            startDate: new Date("2024-02-01"),
            endDate: new Date("2024-05-25"),
            registrationStart: new Date("2024-01-01"),
            registrationEnd: new Date("2024-01-20"),
        },
        {
            name: "Summer 2024",
            type: "SUMMER" as const,
            status: "COMPLETED" as const,
            startDate: new Date("2024-06-15"),
            endDate: new Date("2024-08-10"),
            registrationStart: new Date("2024-05-26"),
            registrationEnd: new Date("2024-06-10"),
        },

        // 2024-2025 Academic Year
        {
            name: "Fall 2024",
            type: "FALL" as const,
            status: "COMPLETED" as const,
            startDate: new Date("2024-09-01"),
            endDate: new Date("2024-12-20"),
            registrationStart: new Date("2024-08-01"),
            registrationEnd: new Date("2024-08-25"),
        },
        {
            name: "Spring 2025",
            type: "SPRING" as const,
            status: "ACTIVE" as const,
            startDate: new Date("2025-02-01"),
            endDate: new Date("2025-05-25"),
            registrationStart: new Date("2025-01-01"),
            registrationEnd: new Date("2025-01-20"),
        },
        {
            name: "Summer 2025",
            type: "SUMMER" as const,
            status: "INACTIVE" as const,
            startDate: new Date("2025-06-15"),
            endDate: new Date("2025-08-10"),
            registrationStart: new Date("2025-05-26"),
            registrationEnd: new Date("2025-06-10"),
        },
        {
            name: "Fall 2025",
            type: "FALL" as const,
            status: "INACTIVE" as const,
            startDate: new Date("2025-09-01"),
            endDate: new Date("2025-12-20"),
            registrationStart: new Date("2025-08-01"),
            registrationEnd: new Date("2025-08-25"),
        },
    ];

    const terms: any[] = [];
    for (const termData of termsData) {
        const term = await prisma.academicTerm.create({
            data: {
                ...termData,
                batch: { connect: { id: mainBatch.id } },
            },
        });
        terms.push(term);
    }

    // 11. Faculty Members (8 faculty)
    console.log("👨‍🏫 Creating 8 Faculty Members...");
    const facultyData = [
        {
            en: "Dr. Ahmed Mohamed AlSaeed",
            ar: "د. أحمد محمد السعيد",
            type: "FACULTY" as const,
        },
        {
            en: "Dr. Fatima Ali Almutairi",
            ar: "د. فاطمة علي المطيري",
            type: "FACULTY" as const,
        },
        {
            en: "Dr. Mahmoud Hassan Alharbi",
            ar: "د. محمود حسن الحربي",
            type: "FACULTY" as const,
        },
        {
            en: "Dr. Sarah Abdullah Alzahrani",
            ar: "د. سارة عبدالله الزهراني",
            type: "FACULTY" as const,
        },
        {
            en: "Dr. Omar Ibrahim Alghamdi",
            ar: "د. عمر إبراهيم الغامدي",
            type: "FACULTY" as const,
        },
        {
            en: "Dr. Layla Khalid Alqahtani",
            ar: "د. ليلى خالد القحطاني",
            type: "FACULTY" as const,
        },
        {
            en: "Eng. Youssef Nasser Alshehri",
            ar: "م. يوسف ناصر الشهري",
            type: "TA" as const,
        },
        {
            en: "Eng. Mariam Saeed Aldosari",
            ar: "م. مريم سعيد الدوسري",
            type: "TA" as const,
        },
    ];

    const facultyMembers: any[] = [];
    for (let i = 0; i < facultyData.length; i++) {
        const facultyUser = await prisma.user.create({
            data: {
                email: `faculty${i + 1}@university.edu`,
                password: facultyPassword,
                role: facultyData[i].type === "TA" ? "TA" : "FACULTY",
                status: "ACTIVE",
            },
        });

        const staffCode =
            facultyData[i].type === "TA"
                ? `T${String(i + 1).padStart(4, "0")}`
                : `F${String(i + 1).padStart(4, "0")}`;
        const faculty = await prisma.faculty.create({
            data: {
                userId: facultyUser.id,
                staffCode: staffCode,
                nameEn: facultyData[i].en,
                nameAr: facultyData[i].ar,
                phone: `+966${String(501234567 + i)}`,
                type: facultyData[i].type,
            },
        });
        facultyMembers.push(faculty);
    }

    // 12. Students (35 students across 5 batches)
    console.log("🎓 Creating 35 Students...");
    const studentPassword = await hashPassword("Student@123");

    const firstNames = [
        { en: "Ahmed", ar: "أحمد" },
        { en: "Fatima", ar: "فاطمة" },
        { en: "Mohammed", ar: "محمد" },
        { en: "Aisha", ar: "عائشة" },
        { en: "Omar", ar: "عمر" },
        { en: "Mariam", ar: "مريم" },
        { en: "Khalid", ar: "خالد" },
        { en: "Layla", ar: "ليلى" },
        { en: "Abdullah", ar: "عبدالله" },
        { en: "Sarah", ar: "سارة" },
        { en: "Youssef", ar: "يوسف" },
        { en: "Noor", ar: "نور" },
        { en: "Hassan", ar: "حسن" },
        { en: "Huda", ar: "هدى" },
        { en: "Ali", ar: "علي" },
        { en: "Zahra", ar: "زهراء" },
        { en: "Ibrahim", ar: "إبراهيم" },
        { en: "Maha", ar: "مها" },
        { en: "Mansour", ar: "منصور" },
        { en: "Noura", ar: "نورة" },
    ];

    const lastNames = [
        { en: "Almutairi", ar: "المطيري" },
        { en: "Alharbi", ar: "الحربي" },
        { en: "Alzahrani", ar: "الزهراني" },
        { en: "Alghamdi", ar: "الغامدي" },
        { en: "Alqahtani", ar: "القحطاني" },
        { en: "Alshehri", ar: "الشهري" },
        { en: "Aldosari", ar: "الدوسري" },
        { en: "Alotaibi", ar: "العتيبي" },
        { en: "Albalawi", ar: "البلوي" },
        { en: "Aljuhani", ar: "الجهني" },
    ];

    const students: any[] = [];
    let studentCounter = 1;

    // Batch 2021 - 5 Graduated Students (mixed departments)
    const batch2021Distribution = [0, 0, 1, 1, 2]; // 2 CSSE, 1 CSDS, 1 CSIS, 1 CSCY
    for (let i = 0; i < 5; i++) {
        const deptIndex = batch2021Distribution[i];
        const batch = batches.find(
            (b) =>
                b.year === 2021 && b.departmentId === departments[deptIndex].id
        );
        if (!batch) continue;

        const firstName = firstNames[studentCounter % firstNames.length];
        const lastName =
            lastNames[Math.floor(studentCounter / 2) % lastNames.length];

        const studentUser = await prisma.user.create({
            data: {
                email: `student${studentCounter}@university.edu`,
                password: studentPassword,
                role: "STUDENT",
                status: "ACTIVE",
            },
        });

        const student = await prisma.student.create({
            data: {
                userId: studentUser.id,
                studentCode: `2021${String(studentCounter).padStart(4, "0")}`,
                nameEn: `${firstName.en} ${lastName.en}`,
                nameAr: `${firstName.ar} ${lastName.ar}`,
                dateOfBirth: new Date(
                    `200${1 + (studentCounter % 4)}-0${
                        (studentCounter % 9) + 1
                    }-${10 + (studentCounter % 15)}`
                ),
                gender: studentCounter % 2 === 0 ? "MALE" : "FEMALE",
                phone: `+966${String(550000000 + studentCounter)}`,
                nationalId: `1${String(100000000 + studentCounter)}`,
                batchId: batch.id,
                departmentId: batch.departmentId,
                admissionDate: new Date("2021-09-01"),
                status: "GRADUATED",
            },
        });
        students.push(student);
        studentCounter++;
    }

    // Batch 2022 - 6 Year 4 Students (mixed departments)
    const batch2022Distribution = [0, 0, 1, 1, 2, 3]; // 2 CSSE, 2 CSDS, 1 CSIS, 1 CSCY
    for (let i = 0; i < 6; i++) {
        const deptIndex = batch2022Distribution[i];
        const batch = batches.find(
            (b) =>
                b.year === 2022 && b.departmentId === departments[deptIndex].id
        );
        if (!batch) continue;

        const firstName = firstNames[studentCounter % firstNames.length];
        const lastName =
            lastNames[Math.floor(studentCounter / 2) % lastNames.length];

        const studentUser = await prisma.user.create({
            data: {
                email: `student${studentCounter}@university.edu`,
                password: studentPassword,
                role: "STUDENT",
                status: "ACTIVE",
            },
        });

        const student = await prisma.student.create({
            data: {
                userId: studentUser.id,
                studentCode: `2022${String(studentCounter).padStart(4, "0")}`,
                nameEn: `${firstName.en} ${lastName.en}`,
                nameAr: `${firstName.ar} ${lastName.ar}`,
                dateOfBirth: new Date(
                    `200${2 + (studentCounter % 3)}-0${
                        (studentCounter % 9) + 1
                    }-${10 + (studentCounter % 15)}`
                ),
                gender: studentCounter % 2 === 0 ? "MALE" : "FEMALE",
                phone: `+966${String(550000000 + studentCounter)}`,
                nationalId: `1${String(100000000 + studentCounter)}`,
                batchId: batch.id,
                departmentId: batch.departmentId,
                admissionDate: new Date("2022-09-01"),
                status: "ACTIVE",
            },
        });
        students.push(student);
        studentCounter++;
    }

    // Batch 2023 - 8 Year 3 Students (2 per department)
    for (let deptIdx = 0; deptIdx < 4; deptIdx++) {
        for (let i = 0; i < 2; i++) {
            const batch = batches.find(
                (b) =>
                    b.year === 2023 &&
                    b.departmentId === departments[deptIdx].id
            );
            if (!batch) continue;

            const firstName = firstNames[studentCounter % firstNames.length];
            const lastName =
                lastNames[Math.floor(studentCounter / 2) % lastNames.length];

            const studentUser = await prisma.user.create({
                data: {
                    email: `student${studentCounter}@university.edu`,
                    password: studentPassword,
                    role: "STUDENT",
                    status: "ACTIVE",
                },
            });

            const student = await prisma.student.create({
                data: {
                    userId: studentUser.id,
                    studentCode: `2023${String(studentCounter).padStart(
                        4,
                        "0"
                    )}`,
                    nameEn: `${firstName.en} ${lastName.en}`,
                    nameAr: `${firstName.ar} ${lastName.ar}`,
                    dateOfBirth: new Date(
                        `200${3 + (studentCounter % 2)}-0${
                            (studentCounter % 9) + 1
                        }-${10 + (studentCounter % 15)}`
                    ),
                    gender: studentCounter % 2 === 0 ? "MALE" : "FEMALE",
                    phone: `+966${String(550000000 + studentCounter)}`,
                    nationalId: `1${String(100000000 + studentCounter)}`,
                    batchId: batch.id,
                    departmentId: batch.departmentId,
                    admissionDate: new Date("2023-09-01"),
                    status: "ACTIVE",
                },
            });
            students.push(student);
            studentCounter++;
        }
    }

    // Batch 2024 - 8 Year 2 Students (NO department yet)
    for (let i = 0; i < 8; i++) {
        const deptIdx = i % 4;
        const batch = batches.find(
            (b) => b.year === 2024 && b.name.includes(departments[deptIdx].code)
        );
        if (!batch) continue;

        const firstName = firstNames[studentCounter % firstNames.length];
        const lastName =
            lastNames[Math.floor(studentCounter / 2) % lastNames.length];

        const studentUser = await prisma.user.create({
            data: {
                email: `student${studentCounter}@university.edu`,
                password: studentPassword,
                role: "STUDENT",
                status: "ACTIVE",
            },
        });

        const student = await prisma.student.create({
            data: {
                userId: studentUser.id,
                studentCode: `2024${String(studentCounter).padStart(4, "0")}`,
                nameEn: `${firstName.en} ${lastName.en}`,
                nameAr: `${firstName.ar} ${lastName.ar}`,
                dateOfBirth: new Date(
                    `200${4 + (studentCounter % 2)}-0${
                        (studentCounter % 9) + 1
                    }-${10 + (studentCounter % 15)}`
                ),
                gender: studentCounter % 2 === 0 ? "MALE" : "FEMALE",
                phone: `+966${String(550000000 + studentCounter)}`,
                nationalId: `1${String(100000000 + studentCounter)}`,
                batchId: batch.id,
                departmentId: null, // No department yet
                admissionDate: new Date("2024-09-01"),
                status: "ACTIVE",
            },
        });
        students.push(student);
        studentCounter++;
    }

    // Batch 2025 - 8 Year 1 Students (NO department)
    for (let i = 0; i < 8; i++) {
        const deptIdx = i % 4;
        const batch = batches.find(
            (b) => b.year === 2025 && b.name.includes(departments[deptIdx].code)
        );
        if (!batch) continue;

        const firstName = firstNames[studentCounter % firstNames.length];
        const lastName =
            lastNames[Math.floor(studentCounter / 2) % lastNames.length];

        const studentUser = await prisma.user.create({
            data: {
                email: `student${studentCounter}@university.edu`,
                password: studentPassword,
                role: "STUDENT",
                status: "ACTIVE",
            },
        });

        const student = await prisma.student.create({
            data: {
                userId: studentUser.id,
                studentCode: `2025${String(studentCounter).padStart(4, "0")}`,
                nameEn: `${firstName.en} ${lastName.en}`,
                nameAr: `${firstName.ar} ${lastName.ar}`,
                dateOfBirth: new Date(
                    `200${5 + (studentCounter % 2)}-0${
                        (studentCounter % 9) + 1
                    }-${10 + (studentCounter % 15)}`
                ),
                gender: studentCounter % 2 === 0 ? "MALE" : "FEMALE",
                phone: `+966${String(550000000 + studentCounter)}`,
                nationalId: `1${String(100000000 + studentCounter)}`,
                batchId: batch.id,
                departmentId: null, // No department yet
                admissionDate: new Date("2025-09-01"),
                status: "ACTIVE",
            },
        });
        students.push(student);
        studentCounter++;
    }

    console.log("✅ Part 2 completed: Batches and People created");
    console.log(`   - Batches: ${batches.length}`);
    console.log(`   - Academic Terms: ${terms.length}`);
    console.log(`   - Faculty: ${facultyMembers.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`     • Graduated (2021): 5`);
    console.log(`     • Year 4 (2022): 6`);
    console.log(`     • Year 3 (2023): 8`);
    console.log(`     • Year 2 (2024): 8`);
    console.log(`     • Year 1 (2025): 8`);

    // ============================================
    // PART 3: ACADEMIC ACTIVITIES
    // ============================================

    // 13. Course Sections for Spring 2025 (14 sections)
    console.log("📝 Creating 14 Course Sections for Spring 2025...");
    const activeTerm = terms.find((t) => t.status === "ACTIVE");
    if (!activeTerm) throw new Error("No active term found");

    const sectionsData = [
        // Year 1 Courses (for Batch 2025)
        { courseCode: "CS103", facultyIdx: 0, capacity: 35 },
        { courseCode: "CS104", facultyIdx: 1, capacity: 35 },
        { courseCode: "MATH102", facultyIdx: 2, capacity: 35 },
        { courseCode: "STAT101", facultyIdx: 3, capacity: 35 },

        // Year 2 Courses (for Batch 2024)
        { courseCode: "CS204", facultyIdx: 4, capacity: 30 },
        { courseCode: "CS205", facultyIdx: 5, capacity: 30 },
        { courseCode: "CS206", facultyIdx: 6, capacity: 30 },

        // Year 3 Courses (for Batch 2023)
        { courseCode: "SE301", facultyIdx: 0, capacity: 25 },
        { courseCode: "DS301", facultyIdx: 3, capacity: 25 },
        { courseCode: "IS301", facultyIdx: 5, capacity: 25 },
        { courseCode: "CY301", facultyIdx: 2, capacity: 20 },

        // Year 4 Courses (for Batch 2022)
        { courseCode: "CS491", facultyIdx: 1, capacity: 30 },
        { courseCode: "SE401", facultyIdx: 6, capacity: 20 },
        { courseCode: "DS401", facultyIdx: 4, capacity: 15 },
    ];

    const sections: any[] = [];
    for (let i = 0; i < sectionsData.length; i++) {
        const sectionData = sectionsData[i];
        const course = courses.find((c) => c.code === sectionData.courseCode);
        if (!course) continue;

        const section = await prisma.section.create({
            data: {
                code: `${sectionData.courseCode}-A`,
                courseId: course.id,
                termId: activeTerm.id,
                facultyId: facultyMembers[sectionData.facultyIdx].id,
                capacity: sectionData.capacity,
            },
        });
        sections.push(section);

        // Add schedules (2 sessions per week)
        await prisma.schedule.createMany({
            data: [
                {
                    sectionId: section.id,
                    day: (i % 3) * 2, // 0, 2, 4 (Sun, Tue, Thu)
                    startTime: "09:00",
                    endTime: "10:30",
                    room: `A${101 + i}`,
                },
                {
                    sectionId: section.id,
                    day: (i % 3) * 2 + 1, // 1, 3, 5 (Mon, Wed, Sat)
                    startTime: "11:00",
                    endTime: "12:30",
                    room: `A${101 + i}`,
                },
            ],
        });
    }

    // 14. Enrollments (~80 enrollments)
    console.log("📋 Creating Student Enrollments...");
    const enrollments: any[] = [];

    // Batch 2025 (Year 1) - 8 students × 3 courses = 24 enrollments
    const year1Students = students.filter((s) =>
        s.studentCode.startsWith("2025")
    );
    const year1Sections = sections.filter((s) =>
        ["CS103-A", "CS104-A", "MATH102-A", "STAT101-A"].includes(s.code)
    );
    for (const student of year1Students) {
        const studentSections = year1Sections.slice(0, 3);
        for (const section of studentSections) {
            const enrollment = await prisma.enrollment.create({
                data: {
                    studentId: student.id,
                    sectionId: section.id,
                    status: "ENROLLED",
                    enrolledAt: new Date("2025-01-15"),
                },
            });
            enrollments.push(enrollment);
        }
    }

    // Batch 2024 (Year 2) - 8 students × 3 courses = 24 enrollments
    const year2Students = students.filter((s) =>
        s.studentCode.startsWith("2024")
    );
    const year2Sections = sections.filter((s) =>
        ["CS204-A", "CS205-A", "CS206-A"].includes(s.code)
    );
    for (const student of year2Students) {
        for (const section of year2Sections) {
            const enrollment = await prisma.enrollment.create({
                data: {
                    studentId: student.id,
                    sectionId: section.id,
                    status: "ENROLLED",
                    enrolledAt: new Date("2025-01-15"),
                },
            });
            enrollments.push(enrollment);
        }
    }

    // Batch 2023 (Year 3) - 8 students × 2 courses = 16 enrollments
    const year3Students = students.filter((s) =>
        s.studentCode.startsWith("2023")
    );
    for (const student of year3Students) {
        const deptCode = departments.find(
            (d) => d.id === student.departmentId
        )?.code;
        let courseCode = "";
        if (deptCode === "CSSE") courseCode = "SE301-A";
        else if (deptCode === "CSDS") courseCode = "DS301-A";
        else if (deptCode === "CSIS") courseCode = "IS301-A";
        else if (deptCode === "CSCY") courseCode = "CY301-A";

        const section = sections.find((s) => s.code === courseCode);
        if (section) {
            const enrollment = await prisma.enrollment.create({
                data: {
                    studentId: student.id,
                    sectionId: section.id,
                    status: "ENROLLED",
                    enrolledAt: new Date("2025-01-15"),
                },
            });
            enrollments.push(enrollment);
        }
    }

    // Batch 2022 (Year 4) - 6 students × 2 courses = 12 enrollments
    const year4Students = students.filter((s) =>
        s.studentCode.startsWith("2022")
    );
    const gradSection = sections.find((s) => s.code === "CS491-A");
    for (const student of year4Students) {
        if (gradSection) {
            const enrollment = await prisma.enrollment.create({
                data: {
                    studentId: student.id,
                    sectionId: gradSection.id,
                    status: "ENROLLED",
                    enrolledAt: new Date("2025-01-15"),
                },
            });
            enrollments.push(enrollment);
        }

        // Add one elective based on department
        const deptCode = departments.find(
            (d) => d.id === student.departmentId
        )?.code;
        let electiveCode = "";
        if (deptCode === "CSSE") electiveCode = "SE401-A";
        else if (deptCode === "CSDS") electiveCode = "DS401-A";

        const electiveSection = sections.find((s) => s.code === electiveCode);
        if (electiveSection) {
            const enrollment = await prisma.enrollment.create({
                data: {
                    studentId: student.id,
                    sectionId: electiveSection.id,
                    status: "ENROLLED",
                    enrolledAt: new Date("2025-01-15"),
                },
            });
            enrollments.push(enrollment);
        }
    }

    // 15. Grade Components (4 per section)
    console.log("📊 Creating Grade Components...");
    const componentsData = [
        { name: "Assignments", weight: 20, maxScore: 20 },
        { name: "Midterm Exam", weight: 30, maxScore: 30 },
        { name: "Project", weight: 20, maxScore: 20 },
        { name: "Final Exam", weight: 30, maxScore: 30 },
    ];

    for (const section of sections) {
        for (const compData of componentsData) {
            await prisma.gradeComponent.create({
                data: {
                    sectionId: section.id,
                    name: compData.name,
                    weight: compData.weight,
                    maxScore: compData.maxScore,
                },
            });
        }
    }

    // 16. Complete Grades for ALL enrollments
    console.log("📝 Creating Complete Grades for all students...");
    const allComponents = await prisma.gradeComponent.findMany();
    const allGradeScales = await prisma.gradeScale.findMany({
        orderBy: { minPercentage: "desc" },
    });

    for (const enrollment of enrollments) {
        const sectionComponents = allComponents.filter(
            (c) => c.sectionId === enrollment.sectionId
        );

        let totalWeightedScore = 0;

        // Create grades for each component
        for (const component of sectionComponents) {
            const randomScore =
                component.maxScore * (0.65 + Math.random() * 0.35); // 65-100%
            const score = Math.round(randomScore * 10) / 10;

            await prisma.grade.create({
                data: {
                    enrollmentId: enrollment.id,
                    componentId: component.id,
                    score: score,
                    maxScore: component.maxScore,
                    createdBy: superAdmin.id,
                },
            });

            // Calculate weighted score
            totalWeightedScore +=
                (score / component.maxScore) * component.weight;
        }

        // Calculate final grade percentage (0-100)
        const finalPercentage = Math.round(totalWeightedScore * 10) / 10;

        // Find matching letter grade
        const gradeScale = allGradeScales.find(
            (scale) =>
                finalPercentage >= scale.minPercentage &&
                finalPercentage <= scale.maxPercentage
        );

        if (gradeScale) {
            // Create final grade record
            await prisma.finalGrade.create({
                data: {
                    enrollmentId: enrollment.id,
                    total: finalPercentage,
                    letterGrade: gradeScale.letterGrade,
                    gpaPoints: gradeScale.gpaPoints,
                    status: "PUBLISHED",
                    publishedAt: new Date(),
                },
            });
        }
    }

    // 17. Attendance Records (5-8 per enrollment)
    console.log("📅 Creating Attendance Records...");
    for (const enrollment of enrollments) {
        const numSessions = 5 + Math.floor(Math.random() * 4); // 5-8 sessions
        for (let i = 0; i < numSessions; i++) {
            const sessionDate = new Date(2025, 1, 5 + i * 3); // Starting Feb 5, every 3 days
            const random = Math.random();
            const status =
                random < 0.8 ? "PRESENT" : random < 0.95 ? "ABSENT" : "EXCUSED";

            await prisma.attendance.create({
                data: {
                    enrollmentId: enrollment.id,
                    sessionDate: sessionDate,
                    status: status as any,
                    excuse: status === "EXCUSED" ? "طلب رسمي" : null,
                },
            });
        }
    }

    // 18. Historical Term GPAs
    console.log("📈 Creating Historical Term GPAs...");

    // Batch 2021 (Graduated) - 8 terms
    const graduatedStudents = students.filter((s) =>
        s.studentCode.startsWith("2021")
    );
    for (const student of graduatedStudents) {
        const termHistory = [
            {
                termName: "Fall 2021",
                gpa: 2.8 + Math.random() * 1.2,
                credits: 15,
            },
            {
                termName: "Spring 2022",
                gpa: 2.9 + Math.random() * 1.1,
                credits: 18,
            },
            {
                termName: "Summer 2022",
                gpa: 3.0 + Math.random() * 0.9,
                credits: 6,
            },
            {
                termName: "Fall 2022",
                gpa: 3.1 + Math.random() * 0.8,
                credits: 15,
            },
            {
                termName: "Spring 2023",
                gpa: 3.2 + Math.random() * 0.7,
                credits: 18,
            },
            {
                termName: "Fall 2023",
                gpa: 3.3 + Math.random() * 0.6,
                credits: 15,
            },
            {
                termName: "Spring 2024",
                gpa: 3.4 + Math.random() * 0.5,
                credits: 18,
            },
            {
                termName: "Fall 2024",
                gpa: 3.5 + Math.random() * 0.4,
                credits: 15,
            },
        ];

        for (const termData of termHistory) {
            const term = terms.find((t) => t.name === termData.termName);
            if (term) {
                await prisma.termGPA.create({
                    data: {
                        studentId: student.id,
                        termId: term.id,
                        gpa: Math.round(termData.gpa * 100) / 100,
                        creditsEarned: termData.credits,
                        creditsAttempted: termData.credits,
                    },
                });
            }
        }
    }

    // Batch 2022 (Year 4) - 6 terms
    const year4Stu = students.filter((s) => s.studentCode.startsWith("2022"));
    for (const student of year4Stu) {
        const termHistory = [
            {
                termName: "Fall 2022",
                gpa: 2.5 + Math.random() * 1.3,
                credits: 15,
            },
            {
                termName: "Spring 2023",
                gpa: 2.6 + Math.random() * 1.2,
                credits: 18,
            },
            {
                termName: "Fall 2023",
                gpa: 2.7 + Math.random() * 1.1,
                credits: 15,
            },
            {
                termName: "Spring 2024",
                gpa: 2.8 + Math.random() * 1.0,
                credits: 18,
            },
            {
                termName: "Summer 2024",
                gpa: 2.9 + Math.random() * 0.9,
                credits: 6,
            },
            {
                termName: "Fall 2024",
                gpa: 3.0 + Math.random() * 0.8,
                credits: 15,
            },
        ];

        for (const termData of termHistory) {
            const term = terms.find((t) => t.name === termData.termName);
            if (term) {
                await prisma.termGPA.create({
                    data: {
                        studentId: student.id,
                        termId: term.id,
                        gpa: Math.round(termData.gpa * 100) / 100,
                        creditsEarned: termData.credits,
                        creditsAttempted: termData.credits,
                    },
                });
            }
        }
    }

    // Batch 2023 (Year 3) - 4 terms
    const year3Stu = students.filter((s) => s.studentCode.startsWith("2023"));
    for (const student of year3Stu) {
        const termHistory = [
            {
                termName: "Fall 2023",
                gpa: 2.3 + Math.random() * 1.4,
                credits: 15,
            },
            {
                termName: "Spring 2024",
                gpa: 2.5 + Math.random() * 1.2,
                credits: 18,
            },
            {
                termName: "Summer 2024",
                gpa: 2.7 + Math.random() * 1.0,
                credits: 6,
            },
            {
                termName: "Fall 2024",
                gpa: 2.8 + Math.random() * 0.9,
                credits: 15,
            },
        ];

        for (const termData of termHistory) {
            const term = terms.find((t) => t.name === termData.termName);
            if (term) {
                await prisma.termGPA.create({
                    data: {
                        studentId: student.id,
                        termId: term.id,
                        gpa: Math.round(termData.gpa * 100) / 100,
                        creditsEarned: termData.credits,
                        creditsAttempted: termData.credits,
                    },
                });
            }
        }
    }

    // Batch 2024 (Year 2) - 1 term
    const year2Stu = students.filter((s) => s.studentCode.startsWith("2024"));
    for (const student of year2Stu) {
        const term = terms.find((t) => t.name === "Fall 2024");
        if (term) {
            await prisma.termGPA.create({
                data: {
                    studentId: student.id,
                    termId: term.id,
                    gpa: Math.round((2.0 + Math.random() * 1.5) * 100) / 100,
                    creditsEarned: 15,
                    creditsAttempted: 15,
                },
            });
        }
    }

    // Batch 2025 (Year 1) - 1 term
    const year1Stu = students.filter((s) => s.studentCode.startsWith("2025"));
    for (const student of year1Stu) {
        const term = terms.find((t) => t.name === "Fall 2025");
        if (term) {
            await prisma.termGPA.create({
                data: {
                    studentId: student.id,
                    termId: term.id,
                    gpa: Math.round((2.5 + Math.random() * 1.5) * 100) / 100,
                    creditsEarned: 16,
                    creditsAttempted: 16,
                },
            });
        }
    }

    // 19. Cumulative GPAs
    console.log("📊 Creating Cumulative GPAs...");
    for (const student of students) {
        const termGPAs = await prisma.termGPA.findMany({
            where: { studentId: student.id },
        });

        if (termGPAs.length > 0) {
            const totalCredits = termGPAs.reduce(
                (sum, t) => sum + t.creditsEarned,
                0
            );
            const weightedGPA =
                termGPAs.reduce((sum, t) => sum + t.gpa * t.creditsEarned, 0) /
                totalCredits;
            const cgpa = Math.round(weightedGPA * 100) / 100;

            let standing: any = "GOOD_STANDING";
            if (cgpa < 2.0) standing = "ACADEMIC_PROBATION";
            else if (cgpa < 2.75) standing = "ACADEMIC_WARNING";

            await prisma.cumulativeGPA.create({
                data: {
                    studentId: student.id,
                    cgpa: cgpa,
                    totalCredits: totalCredits,
                    academicStanding: standing,
                },
            });
        }
    }

    // 20. Department Applications (8 applications from Year 2 students)
    console.log("📝 Creating Department Applications...");
    const year2StudentsForApps = students.filter((s) =>
        s.studentCode.startsWith("2024")
    );

    // 3 Approved applications
    for (let i = 0; i < 3; i++) {
        const student = year2StudentsForApps[i];
        const cgpa = await prisma.cumulativeGPA.findUnique({
            where: { studentId: student.id },
        });

        await prisma.departmentApplication.create({
            data: {
                studentId: student.id,
                departmentId: departments[i % 4].id,
                studentGpa: cgpa?.cgpa || 3.0,
                statement: `أرغب في الالتحاق بقسم ${
                    departments[i % 4].nameAr
                } لأنني مهتم بهذا التخصص وأطمح للتميز فيه. لدي شغف كبير في هذا المجال وأسعى لتطوير مهاراتي الأكاديمية والعملية.`,
                status: "APPROVED",
                submittedAt: new Date("2025-01-10"),
                processedBy: admin.id,
                processedAt: new Date("2025-01-20"),
            },
        });
    }

    // 3 Pending applications
    for (let i = 3; i < 6; i++) {
        const student = year2StudentsForApps[i];
        const cgpa = await prisma.cumulativeGPA.findUnique({
            where: { studentId: student.id },
        });

        await prisma.departmentApplication.create({
            data: {
                studentId: student.id,
                departmentId: departments[i % 4].id,
                studentGpa: cgpa?.cgpa || 2.7,
                statement: `أتقدم بطلب الالتحاق بقسم ${
                    departments[i % 4].nameAr
                } وأتطلع لتطوير مهاراتي في هذا المجال. أؤمن بأن هذا التخصص سيساعدني على تحقيق أهدافي المهنية.`,
                status: "PENDING",
                submittedAt: new Date("2025-01-15"),
            },
        });
    }

    // 2 Rejected applications
    for (let i = 6; i < 8; i++) {
        const student = year2StudentsForApps[i];
        const cgpa = await prisma.cumulativeGPA.findUnique({
            where: { studentId: student.id },
        });

        await prisma.departmentApplication.create({
            data: {
                studentId: student.id,
                departmentId: departments[1].id, // CSDS (high GPA requirement)
                studentGpa: cgpa?.cgpa || 2.3,
                statement: `أرغب في الانضمام إلى قسم ${departments[1].nameAr} لأنني شغوف بالذكاء الاصطناعي وتحليل البيانات. أسعى لأن أكون جزءاً من هذا المجال المتطور.`,
                status: "REJECTED",
                submittedAt: new Date("2025-01-12"),
                processedBy: admin.id,
                processedAt: new Date("2025-01-22"),
                rejectionReason:
                    "المعدل التراكمي أقل من الحد الأدنى المطلوب للقسم المختار (2.75). يرجى التقديم لقسم آخر أو تحسين المعدل التراكمي.",
            },
        });
    }

    console.log("✅ Part 3 completed: Academic Activities created");
    console.log(`   - Sections: ${sections.length}`);
    console.log(`   - Enrollments: ${enrollments.length}`);
    console.log(`   - Grade Components: ${sections.length * 4}`);
    console.log(`   - Attendance Records: ~${enrollments.length * 6}`);
    console.log(`   - Term GPAs: Created for all students`);
    console.log(`   - Cumulative GPAs: ${students.length}`);
    console.log(
        `   - Department Applications: 8 (3 approved, 3 pending, 2 rejected)`
    );

    return {
        departments,
        courses,
        batches,
        terms,
        facultyMembers,
        students,
        sections,
        enrollments,
    };
}

main()
    .then(() => {
        console.log("\n✅ Database seeding completed!");
    })
    .catch((e) => {
        console.error("❌ Error during seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
