import prisma from "../../config/database";
import { hashPassword } from "../../utils/auth";
import {
    CreateFacultyDTO,
    UpdateFacultyDTO,
    FacultyWithDetails,
} from "./faculty.types";

export class FacultyService {
    /**
     * Get all faculty members
     */
    async getAllFaculty(filters?: {
        type?: "FACULTY" | "TA";
        search?: string;
    }): Promise<FacultyWithDetails[]> {
        const where: any = {};

        if (filters?.type) {
            where.type = filters.type;
        }

        if (filters?.search) {
            where.OR = [
                {
                    staffCode: {
                        contains: filters.search,
                        mode: "insensitive",
                    },
                },
                { nameEn: { contains: filters.search, mode: "insensitive" } },
                { nameAr: { contains: filters.search } },
                {
                    user: {
                        email: {
                            contains: filters.search,
                            mode: "insensitive",
                        },
                    },
                },
            ];
        }

        const faculty = await prisma.faculty.findMany({
            where,
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return faculty;
    }

    /**
     * Get faculty by ID
     */
    async getFacultyById(id: string): Promise<FacultyWithDetails | null> {
        const faculty = await prisma.faculty.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
            },
        });

        return faculty;
    }

    /**
     * Create new faculty member
     */
    async createFaculty(data: CreateFacultyDTO) {
        // Check if staff code exists
        const existingFaculty = await prisma.faculty.findUnique({
            where: { staffCode: data.staffCode },
        });

        if (existingFaculty) {
            throw new Error("Staff code already exists");
        }

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error("Email already exists");
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Create user and faculty in a transaction
        const faculty = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    role: data.type === "TA" ? "TA" : "FACULTY",
                },
            });

            const newFaculty = await tx.faculty.create({
                data: {
                    userId: user.id,
                    staffCode: data.staffCode,
                    nameEn: data.nameEn,
                    nameAr: data.nameAr,
                    phone: data.phone,
                    type: data.type || "FACULTY",
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            status: true,
                        },
                    },
                },
            });

            return newFaculty;
        });

        return faculty;
    }

    /**
     * Update faculty member
     */
    async updateFaculty(id: string, data: UpdateFacultyDTO) {
        const existingFaculty = await prisma.faculty.findUnique({
            where: { id },
        });

        if (!existingFaculty) {
            return null;
        }

        const updatedFaculty = await prisma.faculty.update({
            where: { id },
            data: {
                nameEn: data.nameEn,
                nameAr: data.nameAr,
                phone: data.phone,
                type: data.type,
            },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
            },
        });

        return updatedFaculty;
    }

    /**
     * Delete faculty member
     */
    async deleteFaculty(id: string) {
        const faculty = await prisma.faculty.findUnique({
            where: { id },
            include: {
                sections: {
                    select: { id: true },
                },
            },
        });

        if (!faculty) {
            throw new Error("Faculty not found");
        }

        if (faculty.sections.length > 0) {
            throw new Error(
                "Cannot delete faculty member with assigned sections. Please reassign sections first."
            );
        }

        // Delete faculty and user in transaction
        await prisma.$transaction(async (tx) => {
            await tx.faculty.delete({ where: { id } });
            await tx.user.delete({ where: { id: faculty.userId } });
        });

        return { message: "Faculty member deleted successfully" };
    }

    /**
     * Get faculty sections
     */
    async getFacultySections(id: string, termId?: string) {
        const where: any = {
            facultyId: id,
        };

        if (termId) {
            where.termId = termId;
        }

        const sections = await prisma.section.findMany({
            where,
            include: {
                course: {
                    select: {
                        code: true,
                        nameEn: true,
                        nameAr: true,
                        credits: true,
                    },
                },
                term: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
                enrollments: {
                    select: { id: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return sections;
    }
}

export default new FacultyService();
