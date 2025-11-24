import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkData() {
    console.log("🔍 Checking database data...\n");

    // Check sections
    const sections = await prisma.section.findMany({
        include: {
            course: true,
            term: true,
            faculty: true,
            enrollments: {
                include: {
                    student: true,
                },
            },
        },
    });

    console.log(`📚 Total Sections: ${sections.length}`);
    sections.forEach((section, index) => {
        console.log(
            `\n${index + 1}. Section: ${section.code} - ${section.course.nameAr}`
        );
        console.log(`   Term: ${section.term.name}`);
        console.log(`   Faculty: ${section.faculty.nameAr}`);
        console.log(`   Capacity: ${section.capacity}`);
        console.log(`   Enrolled Students: ${section.enrollments.length}`);
        if (section.enrollments.length > 0) {
            console.log(`   Students:`);
            section.enrollments.forEach((enrollment, i) => {
                console.log(
                    `     ${i + 1}. ${enrollment.student.nameAr} (${enrollment.student.studentCode})`
                );
            });
        }
    });

    // Check enrollments
    const enrollments = await prisma.enrollment.findMany({
        include: {
            student: true,
            section: {
                include: {
                    course: true,
                },
            },
        },
    });

    console.log(`\n\n📋 Total Enrollments: ${enrollments.length}`);

    await prisma.$disconnect();
}

checkData().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
