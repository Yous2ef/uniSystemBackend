import prisma from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";

interface CreateCollegeData {
    nameEn: string;
    nameAr: string;
    code: string;
    description?: string;
}

interface UpdateCollegeData {
    nameEn?: string;
    nameAr?: string;
    code?: string;
    description?: string;
}

interface GetAllParams {
    search?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
}

export class CollegesService {
    /**
     * Get all colleges with pagination and search
     */
    async getAll(params: GetAllParams) {
        const { search, page, limit, sortBy, sortOrder } = params;

        const skip = (page - 1) * limit;

        // Build where clause for search
        const where = search
            ? {
                  OR: [
                      {
                          nameEn: {
                              contains: search,
                              mode: "insensitive" as const,
                          },
                      },
                      { nameAr: { contains: search } },
                      {
                          code: {
                              contains: search,
                              mode: "insensitive" as const,
                          },
                      },
                  ],
              }
            : {};

        // Get total count
        const total = await prisma.college.count({ where });

        // Get colleges
        const colleges = await prisma.college.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                _count: {
                    select: {
                        departments: true,
                    },
                },
            },
        });

        return {
            colleges,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get college by ID
     */
    async getById(id: string) {
        const college = await prisma.college.findUnique({
            where: { id },
            include: {
                departments: {
                    select: {
                        id: true,
                        nameEn: true,
                        nameAr: true,
                        code: true,
                    },
                },
                _count: {
                    select: {
                        departments: true,
                    },
                },
            },
        });

        if (!college) {
            throw new AppError("College not found", 404);
        }

        return college;
    }

    /**
     * Create new college
     */
    async create(data: CreateCollegeData) {
        // Check if code already exists
        const existingCollege = await prisma.college.findUnique({
            where: { code: data.code },
        });

        if (existingCollege) {
            throw new AppError("College code already exists", 400);
        }

        const college = await prisma.college.create({
            data: {
                nameEn: data.nameEn,
                nameAr: data.nameAr,
                code: data.code,
                description: data.description,
            },
        });

        return college;
    }

    /**
     * Update college
     */
    async update(id: string, data: UpdateCollegeData) {
        // Check if college exists
        const existingCollege = await prisma.college.findUnique({
            where: { id },
        });

        if (!existingCollege) {
            throw new AppError("College not found", 404);
        }

        // Check if code is being changed and already exists
        if (data.code && data.code !== existingCollege.code) {
            const codeExists = await prisma.college.findUnique({
                where: { code: data.code },
            });

            if (codeExists) {
                throw new AppError("College code already exists", 400);
            }
        }

        const college = await prisma.college.update({
            where: { id },
            data,
        });

        return college;
    }

    /**
     * Delete college
     */
    async delete(id: string) {
        // Check if college exists
        const existingCollege = await prisma.college.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        departments: true,
                    },
                },
            },
        });

        if (!existingCollege) {
            throw new AppError("College not found", 404);
        }

        // Check if college has departments
        if (existingCollege._count.departments > 0) {
            throw new AppError(
                "Cannot delete college with existing departments. Please delete or reassign departments first.",
                400
            );
        }

        await prisma.college.delete({
            where: { id },
        });

        return { message: "College deleted successfully" };
    }

    /**
     * Get college departments
     */
    async getDepartments(id: string) {
        // Check if college exists
        const college = await prisma.college.findUnique({
            where: { id },
        });

        if (!college) {
            throw new AppError("College not found", 404);
        }

        const departments = await prisma.department.findMany({
            where: { collegeId: id },
            select: {
                id: true,
                nameEn: true,
                nameAr: true,
                code: true,
                headId: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        specializations: true,
                        batches: true,
                    },
                },
            },
        });

        return departments;
    }
}

export const collegesService = new CollegesService();
