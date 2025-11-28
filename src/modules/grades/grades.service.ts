import prisma from "../../config/database";
import {
    CreateGradeComponentDTO,
    UpdateGradeComponentDTO,
    RecordGradeDTO,
    UpdateGradeDTO,
    StudentGradesReport,
    GPACalculation,
} from "./grades.types";

export class GradesService {
    // Grade Components Management
    async createGradeComponent(data: CreateGradeComponentDTO) {
        const section = await prisma.section.findUnique({
            where: { id: data.sectionId },
        });

        if (!section) {
            throw new Error("Section not found");
        }

        const component = await prisma.gradeComponent.create({
            data: {
                sectionId: data.sectionId,
                name: data.name,
                weight: data.weight,
                maxScore: data.maxScore,
            },
        });

        return component;
    }

    async updateGradeComponent(id: string, data: UpdateGradeComponentDTO) {
        const existing = await prisma.gradeComponent.findUnique({
            where: { id },
        });
        if (!existing) return null;

        const updated = await prisma.gradeComponent.update({
            where: { id },
            data: {
                name: data.name,
                weight: data.weight,
                maxScore: data.maxScore,
            },
        });

        return updated;
    }

    async deleteGradeComponent(id: string) {
        const component = await prisma.gradeComponent.findUnique({
            where: { id },
        });
        if (!component) throw new Error("Grade component not found");

        await prisma.gradeComponent.delete({ where: { id } });
        return { message: "Grade component deleted successfully" };
    }

    async getSectionComponents(sectionId: string) {
        const components = await prisma.gradeComponent.findMany({
            where: { sectionId },
            orderBy: { createdAt: "asc" },
        });

        return components;
    }

    // Grades Recording
    async recordGrade(data: RecordGradeDTO) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: data.enrollmentId },
        });

        if (!enrollment || enrollment.status !== "ENROLLED") {
            throw new Error("Invalid enrollment");
        }

        const component = await prisma.gradeComponent.findUnique({
            where: { id: data.componentId },
        });

        if (!component) {
            throw new Error("Grade component not found");
        }

        if (data.score > component.maxScore) {
            throw new Error(
                `Score cannot exceed max score of ${component.maxScore}`
            );
        }

        const existing = await prisma.grade.findFirst({
            where: {
                enrollmentId: data.enrollmentId,
                componentId: data.componentId,
            },
        });

        if (existing) {
            const updated = await prisma.grade.update({
                where: { id: existing.id },
                data: { score: data.score },
            });
            return updated;
        }

        const grade = await prisma.grade.create({
            data: {
                enrollmentId: data.enrollmentId,
                componentId: data.componentId,
                score: data.score,
            },
        });

        return grade;
    }

    async updateGrade(id: string, data: UpdateGradeDTO) {
        const existing = await prisma.grade.findUnique({
            where: { id },
            include: { component: true },
        });

        if (!existing) return null;

        if (data.score && data.score > existing.component.maxScore) {
            throw new Error(
                `Score cannot exceed max score of ${existing.component.maxScore}`
            );
        }

        const updated = await prisma.grade.update({
            where: { id },
            data: { score: data.score },
        });

        return updated;
    }

    async getStudentGrades(
        enrollmentId: string
    ): Promise<StudentGradesReport | null> {
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                student: {
                    select: {
                        id: true,
                        studentCode: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
                section: {
                    include: {
                        course: {
                            select: {
                                code: true,
                                nameEn: true,
                                credits: true,
                            },
                        },
                        gradeComponents: {
                            include: {
                                grades: {
                                    where: { enrollmentId },
                                },
                            },
                        },
                    },
                },
                finalGrade: true,
            },
        });

        if (!enrollment) return null;

        const components = enrollment.section.gradeComponents.map((comp) => {
            const grade = comp.grades[0];
            return {
                id: comp.id,
                name: comp.name,
                weight: comp.weight,
                maxScore: comp.maxScore,
                score: grade?.score || null,
                percentage: grade
                    ? (grade.score / comp.maxScore) * comp.weight
                    : null,
            };
        });

        const totalScore = components.reduce(
            (sum, comp) => sum + (comp.percentage || 0),
            0
        );

        return {
            student: enrollment.student,
            course: enrollment.section.course,
            section: {
                code: enrollment.section.code,
            },
            components,
            totalScore,
            finalGrade: enrollment.finalGrade
                ? {
                      letterGrade: enrollment.finalGrade.letterGrade,
                      gradePoint: enrollment.finalGrade.gradePoint,
                      status: enrollment.finalGrade.status,
                  }
                : null,
        };
    }

    async getGradesByUserId(userId: string) {
        // Find student by userId
        const student = await prisma.student.findFirst({
            where: { userId },
        });

        if (!student) {
            return [];
        }

        // Get all enrollments with grades (both enrolled and completed)
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: { in: ["ENROLLED", "COMPLETED"] },
            },
            include: {
                section: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                code: true,
                                nameEn: true,
                                nameAr: true,
                                credits: true,
                            },
                        },
                        term: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                                status: true,
                            },
                        },
                        faculty: {
                            select: {
                                nameAr: true,
                                nameEn: true,
                            },
                        },
                        gradeComponents: {
                            include: {
                                grades: true, // Fetch all grades, will filter per enrollment in processing
                            },
                        },
                    },
                },
                finalGrade: true,
            },
        });

        // Process each enrollment
        const gradesData = enrollments.map((enrollment) => {
            const components = enrollment.section.gradeComponents.map(
                (comp) => {
                    const grade = comp.grades.find(
                        (g) => g.enrollmentId === enrollment.id
                    );
                    return {
                        id: comp.id,
                        name: comp.name,
                        weight: comp.weight,
                        maxScore: comp.maxScore,
                        score: grade?.score || 0,
                    };
                }
            );

            const totalScore = components.reduce(
                (sum, comp) => sum + comp.score,
                0
            );
            const maxTotalScore = components.reduce(
                (sum, comp) => sum + comp.maxScore,
                0
            );
            const percentage =
                maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;

            return {
                enrollmentId: enrollment.id,
                sectionId: enrollment.section.id,
                courseCode: enrollment.section.course.code,
                courseNameAr: enrollment.section.course.nameAr,
                courseNameEn: enrollment.section.course.nameEn,
                credits: enrollment.section.course.credits,
                termId: enrollment.section.term.id,
                termName: enrollment.section.term.name,
                termStatus: enrollment.section.term.status,
                facultyName: enrollment.section.faculty.nameAr,
                grades: components,
                totalScore,
                percentage,
                letterGrade:
                    enrollment.finalGrade?.letterGrade ||
                    this.calculateLetterGrade(percentage).letter,
                gradePoint:
                    enrollment.finalGrade?.gradePoint ||
                    this.calculateLetterGrade(percentage).point,
                isPublished: enrollment.finalGrade?.status === "PUBLISHED",
            };
        });

        return gradesData;
    }

    // Final Grades & GPA
    private calculateLetterGrade(percentage: number): {
        letter: string;
        point: number;
    } {
        if (percentage >= 95) return { letter: "A+", point: 4.0 };
        if (percentage >= 90) return { letter: "A", point: 4.0 };
        if (percentage >= 85) return { letter: "B+", point: 3.5 };
        if (percentage >= 80) return { letter: "B", point: 3.0 };
        if (percentage >= 75) return { letter: "C+", point: 2.5 };
        if (percentage >= 70) return { letter: "C", point: 2.0 };
        if (percentage >= 65) return { letter: "D+", point: 1.5 };
        if (percentage >= 60) return { letter: "D", point: 1.0 };
        return { letter: "F", point: 0.0 };
    }

    async publishFinalGrades(sectionId: string) {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                sectionId,
                status: "ENROLLED",
            },
            include: {
                section: {
                    include: {
                        course: true,
                        gradeComponents: {
                            include: {
                                grades: true,
                            },
                        },
                    },
                },
                grades: {
                    include: {
                        component: true,
                    },
                },
            },
        });

        for (const enrollment of enrollments) {
            let totalPercentage = 0;

            for (const grade of enrollment.grades) {
                const percentage =
                    (grade.score / grade.component.maxScore) *
                    grade.component.weight;
                totalPercentage += percentage;
            }

            const { letter, point } =
                this.calculateLetterGrade(totalPercentage);

            await prisma.finalGrade.upsert({
                where: { enrollmentId: enrollment.id },
                create: {
                    enrollmentId: enrollment.id,
                    letterGrade: letter,
                    gradePoint: point,
                    totalScore: totalPercentage,
                    status: "PUBLISHED",
                    publishedAt: new Date(),
                },
                update: {
                    letterGrade: letter,
                    gradePoint: point,
                    totalScore: totalPercentage,
                    status: "PUBLISHED",
                    publishedAt: new Date(),
                },
            });

            await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { status: "COMPLETED" },
            });
        }

        return { message: "Final grades published successfully" };
    }

    async calculateStudentGPA(
        studentId: string,
        termId: string
    ): Promise<GPACalculation> {
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId,
                status: "COMPLETED",
                section: { termId },
            },
            include: {
                section: {
                    include: {
                        course: true,
                    },
                },
                finalGrade: true,
            },
        });

        let termCreditsEarned = 0;
        let termCreditsAttempted = 0;
        let termGradePoints = 0;

        for (const enrollment of enrollments) {
            const credits = enrollment.section.course.credits;
            termCreditsAttempted += credits;

            if (enrollment.finalGrade && enrollment.finalGrade.gradePoint > 0) {
                termCreditsEarned += credits;
                termGradePoints += enrollment.finalGrade.gradePoint * credits;
            }
        }

        const termGPA =
            termCreditsAttempted > 0
                ? termGradePoints / termCreditsAttempted
                : 0;

        await prisma.termGPA.upsert({
            where: {
                studentId_termId: {
                    studentId,
                    termId,
                },
            },
            create: {
                studentId,
                termId,
                gpa: termGPA,
                creditsEarned: termCreditsEarned,
                creditsAttempted: termCreditsAttempted,
            },
            update: {
                gpa: termGPA,
                creditsEarned: termCreditsEarned,
                creditsAttempted: termCreditsAttempted,
            },
        });

        const allEnrollments = await prisma.enrollment.findMany({
            where: {
                studentId,
                status: "COMPLETED",
            },
            include: {
                section: {
                    include: {
                        course: true,
                    },
                },
                finalGrade: true,
            },
        });

        let totalCredits = 0;
        let totalGradePoints = 0;

        for (const enrollment of allEnrollments) {
            const credits = enrollment.section.course.credits;
            totalCredits += credits;

            if (enrollment.finalGrade) {
                totalGradePoints += enrollment.finalGrade.gradePoint * credits;
            }
        }

        const cumulativeGPA =
            totalCredits > 0 ? totalGradePoints / totalCredits : 0;

        let academicStanding = "GOOD_STANDING";
        if (cumulativeGPA < 2.0) academicStanding = "ACADEMIC_PROBATION";
        else if (cumulativeGPA < 2.5) academicStanding = "ACADEMIC_WARNING";

        await prisma.cumulativeGPA.upsert({
            where: { studentId },
            create: {
                studentId,
                cgpa: cumulativeGPA,
                totalCredits,
                academicStanding: academicStanding as any,
            },
            update: {
                cgpa: cumulativeGPA,
                totalCredits,
                academicStanding: academicStanding as any,
            },
        });

        return {
            termGPA,
            cumulativeGPA,
            creditsEarned: termCreditsEarned,
            creditsAttempted: termCreditsAttempted,
            totalCredits,
            academicStanding,
        };
    }

    async getStudentTranscript(studentId: string) {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                batch: true,
                department: true,
                cumulativeGpa: true,
            },
        });

        if (!student) throw new Error("Student not found");

        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId,
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

        const termGPAs = await prisma.termGPA.findMany({
            where: { studentId },
            include: { term: true },
            orderBy: { term: { startDate: "asc" } },
        });

        return {
            student: {
                ...student,
                cumulativeGPA: student.cumulativeGpa,
            },
            courses: enrollments.map((e) => ({
                term: e.section.term.name,
                courseCode: e.section.course.code,
                courseName: e.section.course.nameEn,
                credits: e.section.course.credits,
                grade: e.finalGrade?.letterGrade || "N/A",
                gradePoint: e.finalGrade?.gradePoint || 0,
            })),
            termGPAs: termGPAs.map((t) => ({
                term: t.term.name,
                gpa: t.gpa,
                creditsEarned: t.creditsEarned,
                creditsAttempted: t.creditsAttempted,
            })),
        };
    }
}

export default new GradesService();
