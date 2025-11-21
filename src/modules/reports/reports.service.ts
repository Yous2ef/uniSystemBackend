import prisma from "../../config/database";
import {
    SystemStatistics,
    StudentTranscript,
    TranscriptTerm,
    TranscriptCourse,
} from "./reports.types";

export class ReportsService {
    /**
     * Get system-wide statistics
     */
    async getSystemStatistics(): Promise<SystemStatistics> {
        // Get total and active students
        const [totalStudents, activeStudents, graduatedStudents] =
            await Promise.all([
                prisma.student.count(),
                prisma.student.count({
                    where: { status: "ACTIVE" },
                }),
                prisma.student.count({
                    where: { status: "GRADUATED" },
                }),
            ]);

        // Get average GPA from cumulative GPAs
        const cumulativeGpas = await prisma.cumulativeGPA.findMany({
            select: {
                cgpa: true,
            },
        });

        const totalGPA = cumulativeGpas.reduce(
            (sum: number, g) => sum + g.cgpa,
            0
        );
        const averageGPA =
            cumulativeGpas.length > 0 ? totalGPA / cumulativeGpas.length : 0;

        // Get enrollment rate (active enrollments vs total possible)
        const activeEnrollments = await prisma.enrollment.count({
            where: { status: "ENROLLED" },
        });

        // Calculate enrollment rate (enrolled / total students * 100)
        const enrollmentRate =
            totalStudents > 0 ? (activeEnrollments / totalStudents) * 100 : 0;

        // Get attendance rate
        const attendanceRecords = await prisma.attendance.findMany({
            select: {
                status: true,
            },
        });

        const presentCount = attendanceRecords.filter(
            (a) => a.status === "PRESENT"
        ).length;
        const attendanceRate =
            attendanceRecords.length > 0
                ? (presentCount / attendanceRecords.length) * 100
                : 0;

        // Get top specializations
        const specializationCounts = await prisma.student.groupBy({
            by: ["departmentId"],
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: "desc",
                },
            },
            take: 3,
            where: {
                departmentId: {
                    not: null,
                },
            },
        });

        const topSpecializations = await Promise.all(
            specializationCounts.map(async (spec: any) => {
                const department = await prisma.department.findUnique({
                    where: { id: spec.departmentId! },
                    select: { nameAr: true },
                });
                return {
                    name: department?.nameAr || "غير محدد",
                    count: spec._count.id,
                };
            })
        );

        // Get grade distribution from final grades
        const finalGrades = await prisma.finalGrade.findMany({
            select: {
                letterGrade: true,
            },
            where: {
                status: "PUBLISHED",
            },
        });

        const gradeGroups = finalGrades.reduce(
            (acc: Record<string, number>, g) => {
                const grade = g.letterGrade || "F";
                acc[grade] = (acc[grade] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const totalGrades = finalGrades.length;
        const gradeDistribution = Object.entries(gradeGroups).map(
            ([grade, count]) => ({
                grade,
                count: count as number,
                percentage: totalGrades > 0 ? (count / totalGrades) * 100 : 0,
            })
        );

        // Sort by grade order (A, B, C, D, F)
        const gradeOrder = ["A", "B", "C", "D", "F"];
        gradeDistribution.sort((a, b) => {
            const orderA = gradeOrder.indexOf(a.grade);
            const orderB = gradeOrder.indexOf(b.grade);
            return (
                (orderA !== -1 ? orderA : 999) - (orderB !== -1 ? orderB : 999)
            );
        });

        return {
            totalStudents,
            activeStudents,
            graduatedStudents,
            averageGPA: Math.round(averageGPA * 100) / 100,
            enrollmentRate: Math.round(enrollmentRate * 10) / 10,
            attendanceRate: Math.round(attendanceRate * 10) / 10,
            topSpecializations,
            gradeDistribution,
        };
    }

    /**
     * Get student transcript by student ID
     */
    async getStudentTranscript(studentId: string): Promise<StudentTranscript> {
        // Get student details
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                batch: {
                    include: {
                        curriculum: true,
                    },
                },
                department: true,
                cumulativeGpa: true,
            },
        });

        if (!student) {
            throw new Error("Student not found");
        }

        // Get all completed enrollments grouped by term
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: studentId,
                status: "COMPLETED",
            },
            include: {
                section: {
                    include: {
                        course: true,
                        term: true,
                    },
                },
                finalGrade: true,
            },
            orderBy: {
                section: {
                    term: {
                        startDate: "asc",
                    },
                },
            },
        });

        // Group enrollments by term
        const termMap = new Map<string, any>();
        let calculatedCredits = 0;

        for (const enrollment of enrollments) {
            const termId = enrollment.section.term.id;
            const termName = enrollment.section.term.name;

            if (!termMap.has(termId)) {
                termMap.set(termId, {
                    id: termId,
                    name: termName,
                    courses: [],
                    totalPoints: 0,
                    totalCredits: 0,
                });
            }

            const term = termMap.get(termId);
            const course: TranscriptCourse = {
                code: enrollment.section.course.code,
                name: enrollment.section.course.nameAr,
                credits: enrollment.section.course.credits,
                grade: enrollment.finalGrade?.letterGrade || "N/A",
                points: enrollment.finalGrade?.gpaPoints || 0,
            };

            term.courses.push(course);
            term.totalPoints += course.points * course.credits;
            term.totalCredits += course.credits;
            calculatedCredits += course.credits;
        }

        // Calculate GPA for each term
        const terms: TranscriptTerm[] = Array.from(termMap.values()).map(
            (term) => ({
                name: term.name,
                gpa:
                    term.totalCredits > 0
                        ? term.totalPoints / term.totalCredits
                        : 0,
                courses: term.courses,
            })
        );

        // Use totalCredits from cumulativeGpa if available, otherwise use calculated
        const totalCredits =
            student.cumulativeGpa?.totalCredits || calculatedCredits;

        return {
            studentCode: student.studentCode,
            nameAr: student.nameAr,
            specialization: student.department?.nameAr || "غير محدد",
            batch: student.batch.name,
            currentGPA: student.cumulativeGpa?.cgpa || 0,
            totalCredits: totalCredits,
            terms: terms,
        };
    }

    /**
     * Get grades report for a specific term
     */
    async getGradesReport(termId: string) {
        const term = await prisma.academicTerm.findUnique({
            where: { id: termId },
        });

        if (!term) {
            throw new Error("Term not found");
        }

        // Get all sections for this term with enrollments and final grades
        const sections = await prisma.section.findMany({
            where: {
                termId: termId,
            },
            include: {
                course: {
                    select: {
                        code: true,
                        nameAr: true,
                        credits: true,
                    },
                },
                enrollments: {
                    include: {
                        student: {
                            select: {
                                studentCode: true,
                                nameAr: true,
                            },
                        },
                        finalGrade: true,
                    },
                },
            },
        });

        // Group by student
        const studentMap = new Map();

        for (const section of sections) {
            for (const enrollment of section.enrollments) {
                const studentCode = enrollment.student.studentCode;

                if (!studentMap.has(studentCode)) {
                    studentMap.set(studentCode, {
                        studentCode: studentCode,
                        nameAr: enrollment.student.nameAr,
                        courses: [],
                        totalPoints: 0,
                        totalCredits: 0,
                    });
                }

                const student = studentMap.get(studentCode);
                const finalGrade = enrollment.finalGrade;

                student.courses.push({
                    code: section.course.code,
                    name: section.course.nameAr,
                    midterm: null,
                    final: finalGrade?.total || null,
                    total: finalGrade?.total || null,
                    grade: finalGrade?.letterGrade || null,
                });

                if (finalGrade?.gpaPoints && section.course.credits) {
                    student.totalPoints +=
                        finalGrade.gpaPoints * section.course.credits;
                    student.totalCredits += section.course.credits;
                }
            }
        }

        // Calculate term GPA for each student
        const students = Array.from(studentMap.values()).map((student) => ({
            ...student,
            termGPA:
                student.totalCredits > 0
                    ? student.totalPoints / student.totalCredits
                    : null,
        }));

        // Calculate average GPA
        const validGPAs = students
            .filter((s) => s.termGPA !== null)
            .map((s) => s.termGPA as number);
        const averageGPA =
            validGPAs.length > 0
                ? validGPAs.reduce((sum, gpa) => sum + gpa, 0) /
                  validGPAs.length
                : 0;

        return {
            termName: term.name,
            students: students,
            averageGPA: averageGPA,
        };
    }

    /**
     * Get attendance report for a specific term
     */
    async getAttendanceReport(termId: string) {
        const term = await prisma.academicTerm.findUnique({
            where: { id: termId },
        });

        if (!term) {
            throw new Error("Term not found");
        }

        // Get all enrollments for sections in this term
        const enrollments = await prisma.enrollment.findMany({
            where: {
                section: {
                    termId: termId,
                },
            },
            include: {
                student: {
                    select: {
                        studentCode: true,
                        nameAr: true,
                    },
                },
                attendances: true,
            },
        });

        // Group by student
        const studentMap = new Map();

        for (const enrollment of enrollments) {
            const studentCode = enrollment.student.studentCode;

            if (!studentMap.has(studentCode)) {
                studentMap.set(studentCode, {
                    studentCode: studentCode,
                    nameAr: enrollment.student.nameAr,
                    totalSessions: 0,
                    presentCount: 0,
                    absentCount: 0,
                    lateCount: 0,
                });
            }

            const student = studentMap.get(studentCode);

            for (const attendance of enrollment.attendances) {
                student.totalSessions++;

                if (attendance.status === "PRESENT") {
                    student.presentCount++;
                } else if (attendance.status === "ABSENT") {
                    student.absentCount++;
                } else if (attendance.status === "EXCUSED") {
                    student.lateCount++;
                }
            }
        }

        // Calculate attendance rate for each student
        const students = Array.from(studentMap.values()).map((student) => ({
            ...student,
            attendanceRate:
                student.totalSessions > 0
                    ? (student.presentCount / student.totalSessions) * 100
                    : 0,
        }));

        // Calculate overall statistics
        const totalSessions = students.reduce(
            (sum, s) => sum + s.totalSessions,
            0
        );
        const totalPresent = students.reduce(
            (sum, s) => sum + s.presentCount,
            0
        );
        const overallAttendanceRate =
            totalSessions > 0 ? (totalPresent / totalSessions) * 100 : 0;

        const regularStudents = students.filter(
            (s) => s.attendanceRate >= 75
        ).length;
        const poorStudents = students.filter(
            (s) => s.attendanceRate < 75
        ).length;

        return {
            termName: term.name,
            students: students,
            overallAttendanceRate: overallAttendanceRate,
            regularStudents: regularStudents,
            poorStudents: poorStudents,
        };
    }
}

export default new ReportsService();
