import prisma from "../../config/database";
import { CreateTermDTO, UpdateTermDTO, TermWithDetails } from "./terms.types";

export class TermsService {
    /**
     * Get all terms with optional filtering
     */
    async getAllTerms(filters?: {
        type?: "FALL" | "SPRING" | "SUMMER";
    }): Promise<TermWithDetails[]> {
        const where: any = {};

        if (filters?.type) {
            where.type = filters.type;
        }

        const terms = await prisma.academicTerm.findMany({
            where,
            include: {
                sections: {
                    select: { id: true },
                },
            },
            orderBy: [{ startDate: "desc" }],
        });

        return terms.map((term) => ({
            id: term.id,
            batchId: term.batchId,
            name: term.name,
            type: term.type,
            status: term.status,
            startDate: term.startDate,
            endDate: term.endDate,
            registrationStart: term.registrationStart,
            registrationEnd: term.registrationEnd,
            sectionsCount: term.sections.length,
            createdAt: term.createdAt,
        }));
    }

    /**
     * Get a specific term by ID
     */
    async getTermById(id: string): Promise<TermWithDetails | null> {
        const term = await prisma.academicTerm.findUnique({
            where: { id },
            include: {
                sections: {
                    select: { id: true },
                },
            },
        });

        if (!term) {
            return null;
        }

        return {
            id: term.id,
            batchId: term.batchId,
            name: term.name,
            type: term.type,
            status: term.status,
            startDate: term.startDate,
            endDate: term.endDate,
            registrationStart: term.registrationStart,
            registrationEnd: term.registrationEnd,
            sectionsCount: term.sections.length,
            createdAt: term.createdAt,
        };
    }

    /**
     * Create a new term
     */
    async createTerm(data: CreateTermDTO) {
        // Check if batch exists
        const batch = await prisma.batch.findUnique({
            where: { id: data.batchId },
        });

        if (!batch) {
            throw new Error("Batch not found");
        }

        // If creating an active term, deactivate other active terms for this batch
        if (data.status === "ACTIVE") {
            await prisma.academicTerm.updateMany({
                where: {
                    batchId: data.batchId,
                    status: "ACTIVE",
                },
                data: {
                    status: "INACTIVE",
                },
            });
        }

        // Check for overlapping terms in the same batch
        const overlappingTerm = await prisma.academicTerm.findFirst({
            where: {
                batchId: data.batchId,
                OR: [
                    {
                        AND: [
                            { startDate: { lte: data.endDate } },
                            { endDate: { gte: data.startDate } },
                        ],
                    },
                ],
            },
        });

        if (overlappingTerm) {
            throw new Error(
                "A term with overlapping dates already exists for this batch"
            );
        }

        const term = await prisma.academicTerm.create({
            data: {
                batchId: data.batchId,
                name: data.name,
                type: data.type,
                status: data.status || "INACTIVE",
                startDate: data.startDate,
                endDate: data.endDate,
                registrationStart: data.registrationStart,
                registrationEnd: data.registrationEnd,
            },
        });

        return term;
    }

    /**
     * Update an existing term
     */
    async updateTerm(id: string, data: UpdateTermDTO) {
        const existing = await prisma.academicTerm.findUnique({
            where: { id },
            include: {
                sections: { select: { id: true } },
            },
        });

        if (!existing) {
            return null;
        }

        const targetBatchId = data.batchId || existing.batchId;

        // If setting status to ACTIVE, deactivate other active terms for this batch
        if (data.status === "ACTIVE") {
            await prisma.academicTerm.updateMany({
                where: {
                    id: { not: id },
                    batchId: targetBatchId,
                    status: "ACTIVE",
                },
                data: {
                    status: "INACTIVE",
                },
            });
        }

        // If updating dates or batch, check for overlaps
        if (data.startDate || data.endDate || data.batchId) {
            const newStartDate = data.startDate || existing.startDate;
            const newEndDate = data.endDate || existing.endDate;

            const overlappingTerm = await prisma.academicTerm.findFirst({
                where: {
                    id: { not: id },
                    batchId: targetBatchId,
                    OR: [
                        {
                            AND: [
                                { startDate: { lte: newEndDate } },
                                { endDate: { gte: newStartDate } },
                            ],
                        },
                    ],
                },
            });

            if (overlappingTerm) {
                throw new Error(
                    "Cannot update term: dates would overlap with another term in this batch"
                );
            }
        }

        const updated = await prisma.academicTerm.update({
            where: { id },
            data: {
                batchId: data.batchId,
                name: data.name,
                status: data.status,
                startDate: data.startDate,
                endDate: data.endDate,
                registrationStart: data.registrationStart,
                registrationEnd: data.registrationEnd,
            },
        });

        return updated;
    }

    /**
     * Delete a term
     */
    async deleteTerm(id: string) {
        const term = await prisma.academicTerm.findUnique({
            where: { id },
            include: {
                sections: {
                    select: { id: true },
                },
            },
        });

        if (!term) {
            throw new Error("Term not found");
        }

        if (term.sections.length > 0) {
            throw new Error(
                "Cannot delete term with existing sections. Please remove sections first."
            );
        }

        await prisma.academicTerm.delete({
            where: { id },
        });

        return { message: "Term deleted successfully" };
    }

    /**
     * Get term statistics
     */
    async getTermStatistics(id: string) {
        const term = await prisma.academicTerm.findUnique({
            where: { id },
            include: {
                sections: {
                    include: {
                        enrollments: {
                            select: {
                                status: true,
                            },
                        },
                        course: {
                            select: {
                                credits: true,
                            },
                        },
                    },
                },
            },
        });

        if (!term) {
            return null;
        }

        const totalSections = term.sections.length;
        const totalRegistrations = term.sections.reduce(
            (sum: number, section) => sum + section.enrollments.length,
            0
        );
        const enrolledRegistrations = term.sections.reduce(
            (sum: number, section) =>
                sum +
                section.enrollments.filter((r) => r.status === "ENROLLED")
                    .length,
            0
        );
        const waitlistedRegistrations = term.sections.reduce(
            (sum: number, section) =>
                sum +
                section.enrollments.filter((r) => r.status === "WAITLISTED")
                    .length,
            0
        );
        const totalCredits = term.sections.reduce(
            (sum: number, section) => sum + (section.course.credits || 0),
            0
        );

        return {
            termId: term.id,
            name: term.name,
            type: term.type,
            totalSections,
            totalRegistrations,
            enrolledRegistrations,
            waitlistedRegistrations,
            droppedRegistrations:
                totalRegistrations -
                enrolledRegistrations -
                waitlistedRegistrations,
            totalCredits,
            averageCreditsPerSection:
                totalSections > 0 ? totalCredits / totalSections : 0,
        };
    }
}

export default new TermsService();
