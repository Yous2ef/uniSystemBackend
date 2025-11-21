import prisma from "../../config/database";
import {
    CreateBatchDTO,
    UpdateBatchDTO,
    BatchWithDetails,
} from "./batches.types";

export class BatchesService {
    /**
     * Get all batches
     */
    async getAllBatches(filters?: {
        departmentId?: string;
        year?: number;
    }): Promise<BatchWithDetails[]> {
        const where: any = {};

        if (filters?.departmentId) {
            where.departmentId = filters.departmentId;
        }

        if (filters?.year) {
            where.year = filters.year;
        }

        const batches = await prisma.batch.findMany({
            where,
            include: {
                department: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
                curriculum: {
                    select: {
                        id: true,
                        name: true,
                        version: true,
                        totalCredits: true,
                    },
                },
                students: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: [{ year: "desc" }, { name: "asc" }],
        });

        return batches.map((batch) => ({
            id: batch.id,
            name: batch.name,
            year: batch.year,
            maxCredits: batch.maxCredits,
            minCredits: batch.minCredits,
            studentsCount: batch.students.length,
            department: batch.department,
            curriculum: batch.curriculum,
            createdAt: batch.createdAt,
        }));
    }

    /**
     * Get batch by ID
     */
    async getBatchById(id: string): Promise<BatchWithDetails | null> {
        const batch = await prisma.batch.findUnique({
            where: { id },
            include: {
                department: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
                curriculum: {
                    select: {
                        id: true,
                        name: true,
                        version: true,
                        totalCredits: true,
                    },
                },
                students: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!batch) {
            return null;
        }

        return {
            id: batch.id,
            name: batch.name,
            year: batch.year,
            maxCredits: batch.maxCredits,
            minCredits: batch.minCredits,
            studentsCount: batch.students.length,
            department: batch.department,
            curriculum: batch.curriculum,
            createdAt: batch.createdAt,
        };
    }

    /**
     * Create new batch
     */
    async createBatch(data: CreateBatchDTO) {
        // Verify department exists
        const department = await prisma.department.findUnique({
            where: { id: data.departmentId },
        });

        if (!department) {
            throw new Error("Department not found");
        }

        // Verify curriculum exists
        const curriculum = await prisma.curriculum.findUnique({
            where: { id: data.curriculumId },
        });

        if (!curriculum) {
            throw new Error("Curriculum not found");
        }

        // Check if batch with same name and year exists
        const existing = await prisma.batch.findFirst({
            where: {
                name: data.name,
                year: data.year,
            },
        });

        if (existing) {
            throw new Error("Batch with this name and year already exists");
        }

        const batch = await prisma.batch.create({
            data: {
                name: data.name,
                year: data.year,
                departmentId: data.departmentId,
                curriculumId: data.curriculumId,
                maxCredits: data.maxCredits || 18,
                minCredits: data.minCredits || 12,
            },
            include: {
                department: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
                curriculum: {
                    select: {
                        id: true,
                        name: true,
                        version: true,
                        totalCredits: true,
                    },
                },
            },
        });

        return batch;
    }

    /**
     * Update batch
     */
    async updateBatch(id: string, data: UpdateBatchDTO) {
        const batch = await prisma.batch.findUnique({
            where: { id },
        });

        if (!batch) {
            throw new Error("Batch not found");
        }

        const updated = await prisma.batch.update({
            where: { id },
            data: {
                name: data.name,
                maxCredits: data.maxCredits,
                minCredits: data.minCredits,
            },
            include: {
                department: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
                curriculum: {
                    select: {
                        id: true,
                        name: true,
                        version: true,
                        totalCredits: true,
                    },
                },
            },
        });

        return updated;
    }

    /**
     * Delete batch
     */
    async deleteBatch(id: string) {
        const batch = await prisma.batch.findUnique({
            where: { id },
            include: {
                students: {
                    select: { id: true },
                },
            },
        });

        if (!batch) {
            throw new Error("Batch not found");
        }

        if (batch.students.length > 0) {
            throw new Error(
                "Cannot delete batch with enrolled students. Please remove students first."
            );
        }

        await prisma.batch.delete({
            where: { id },
        });

        return { message: "Batch deleted successfully" };
    }

    /**
     * Get batch statistics with comprehensive details
     */
    async getBatchStatistics(id: string) {
        const batch = await prisma.batch.findUnique({
            where: { id },
            include: {
                department: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
                curriculum: {
                    select: {
                        id: true,
                        name: true,
                        version: true,
                        totalCredits: true,
                    },
                },
                students: {
                    include: {
                        user: {
                            select: {
                                email: true,
                            },
                        },
                        department: {
                            select: {
                                nameAr: true,
                                nameEn: true,
                            },
                        },
                        cumulativeGpa: {
                            select: {
                                cgpa: true,
                                totalCredits: true,
                            },
                        },
                        enrollments: {
                            include: {
                                section: {
                                    include: {
                                        term: {
                                            select: {
                                                id: true,
                                                name: true,
                                                type: true,
                                            },
                                        },
                                    },
                                },
                                finalGrade: true,
                            },
                        },
                    },
                },
            },
        });

        if (!batch) {
            throw new Error("Batch not found");
        }

        // Calculate statistics
        const totalStudents = batch.students.length;
        const activeStudents = batch.students.filter(
            (s) => s.status === "ACTIVE"
        ).length;
        const graduatedStudents = batch.students.filter(
            (s) => s.status === "GRADUATED"
        ).length;
        const deferredStudents = batch.students.filter(
            (s) => s.status === "DEFERRED"
        ).length;
        const dismissedStudents = batch.students.filter(
            (s) => s.status === "DISMISSED"
        ).length;

        // Calculate GPA statistics
        const studentsWithGpa = batch.students.filter(
            (s) => s.cumulativeGpa?.cgpa
        );
        const averageGpa =
            studentsWithGpa.length > 0
                ? studentsWithGpa.reduce(
                      (sum, s) => sum + (s.cumulativeGpa?.cgpa || 0),
                      0
                  ) / studentsWithGpa.length
                : 0;

        // Calculate academic performance distribution
        const performance = {
            excellent: studentsWithGpa.filter(
                (s) => (s.cumulativeGpa?.cgpa || 0) >= 3.7
            ).length,
            veryGood: studentsWithGpa.filter(
                (s) =>
                    (s.cumulativeGpa?.cgpa || 0) >= 3.0 &&
                    (s.cumulativeGpa?.cgpa || 0) < 3.7
            ).length,
            good: studentsWithGpa.filter(
                (s) =>
                    (s.cumulativeGpa?.cgpa || 0) >= 2.5 &&
                    (s.cumulativeGpa?.cgpa || 0) < 3.0
            ).length,
            pass: studentsWithGpa.filter(
                (s) =>
                    (s.cumulativeGpa?.cgpa || 0) >= 2.0 &&
                    (s.cumulativeGpa?.cgpa || 0) < 2.5
            ).length,
            fail: studentsWithGpa.filter(
                (s) => (s.cumulativeGpa?.cgpa || 0) < 2.0
            ).length,
        };

        // Calculate total credits earned
        const totalCreditsEarned = batch.students.reduce(
            (sum, s) => sum + (s.cumulativeGpa?.totalCredits || 0),
            0
        );

        // Term enrollment statistics
        const termEnrollments = batch.students.reduce((acc: any, student) => {
            student.enrollments.forEach((enrollment) => {
                const termId = enrollment.section.term.id;
                const termName = enrollment.section.term.name;
                if (!acc[termId]) {
                    acc[termId] = {
                        termId,
                        termName,
                        termType: enrollment.section.term.type,
                        enrolledCount: 0,
                        passedCount: 0,
                        failedCount: 0,
                    };
                }
                acc[termId].enrolledCount++;

                if (enrollment.finalGrade) {
                    if (
                        enrollment.finalGrade.letterGrade &&
                        !["F", "WF"].includes(enrollment.finalGrade.letterGrade)
                    ) {
                        acc[termId].passedCount++;
                    } else if (
                        enrollment.finalGrade.letterGrade &&
                        ["F", "WF"].includes(enrollment.finalGrade.letterGrade)
                    ) {
                        acc[termId].failedCount++;
                    }
                }
            });
            return acc;
        }, {});

        // Prepare student list
        const students = batch.students.map((student) => ({
            id: student.id,
            studentCode: student.studentCode,
            nameAr: student.nameAr,
            nameEn: student.nameEn,
            email: student.user.email,
            status: student.status,
            gpa: student.cumulativeGpa?.cgpa || 0,
            creditsEarned: student.cumulativeGpa?.totalCredits || 0,
            department: student.department?.nameAr || "غير محدد",
            phone: student.phone,
        }));

        return {
            batch: {
                id: batch.id,
                name: batch.name,
                year: batch.year,
                maxCredits: batch.maxCredits,
                minCredits: batch.minCredits,
                department: batch.department,
                curriculum: batch.curriculum,
            },
            statistics: {
                totalStudents,
                activeStudents,
                graduatedStudents,
                deferredStudents,
                dismissedStudents,
                averageGpa: Math.round(averageGpa * 100) / 100,
                totalCreditsEarned,
                performance,
            },
            termEnrollments: Object.values(termEnrollments),
            students,
        };
    }
}

export default new BatchesService();
