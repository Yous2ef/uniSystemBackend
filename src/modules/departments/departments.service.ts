import prisma from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";

interface CreateDepartmentData {
    collegeId: string;
    nameEn: string;
    nameAr: string;
    code: string;
    headId?: string;
    minGpa?: number;
    capacity?: number;
    selectionYear?: number;
}

interface UpdateDepartmentData {
    collegeId?: string;
    nameEn?: string;
    nameAr?: string;
    code?: string;
    headId?: string | null;
    minGpa?: number;
    capacity?: number;
    selectionYear?: number;
}

interface GetAllParams {
    collegeId?: string;
    search?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
}

export class DepartmentsService {
    /**
     * Get all departments with pagination and filters
     */
    async getAll(params: GetAllParams) {
        const { collegeId, search, page, limit, sortBy, sortOrder } = params;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (collegeId) {
            where.collegeId = collegeId;
        }

        if (search) {
            where.OR = [
                { nameEn: { contains: search, mode: "insensitive" as const } },
                { nameAr: { contains: search } },
                { code: { contains: search, mode: "insensitive" as const } },
            ];
        }

        // Get total count
        const total = await prisma.department.count({ where });

        // Get departments
        const departments = await prisma.department.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                college: {
                    select: {
                        id: true,
                        nameEn: true,
                        nameAr: true,
                        code: true,
                    },
                },
                _count: {
                    select: {
                        curricula: true,
                        students: true,
                        batches: true,
                        courses: true,
                    },
                },
            },
        });

        return {
            departments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get department by ID
     */
    async getById(id: string) {
        const department = await prisma.department.findUnique({
            where: { id },
            include: {
                college: {
                    select: {
                        id: true,
                        nameEn: true,
                        nameAr: true,
                        code: true,
                    },
                },
                batches: {
                    select: {
                        id: true,
                        name: true,
                        year: true,
                    },
                },
                curricula: {
                    select: {
                        id: true,
                        name: true,
                        version: true,
                    },
                },
                students: {
                    select: {
                        id: true,
                    },
                },
                courses: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                    },
                },
                _count: {
                    select: {
                        curricula: true,
                        students: true,
                        batches: true,
                        courses: true,
                    },
                },
            },
        });

        if (!department) {
            throw new AppError("Department not found", 404);
        }

        return department;
    }

    /**
     * Create new department
     */
    async create(data: CreateDepartmentData) {
        // Check if college exists
        const college = await prisma.college.findUnique({
            where: { id: data.collegeId },
        });

        if (!college) {
            throw new AppError("College not found", 404);
        }

        // Check if code already exists
        const existingDepartment = await prisma.department.findUnique({
            where: { code: data.code },
        });

        if (existingDepartment) {
            throw new AppError("Department code already exists", 400);
        }

        // If headId provided, verify it exists and is a faculty member
        if (data.headId) {
            const faculty = await prisma.faculty.findUnique({
                where: { id: data.headId },
            });

            if (!faculty) {
                throw new AppError("Faculty member not found", 404);
            }
        }

        const department = await prisma.department.create({
            data: {
                collegeId: data.collegeId,
                nameEn: data.nameEn,
                nameAr: data.nameAr,
                code: data.code,
                headId: data.headId,
                minGpa: data.minGpa ?? 0.0,
                capacity: data.capacity ?? 100,
                selectionYear: data.selectionYear ?? 2,
            },
            include: {
                college: {
                    select: {
                        id: true,
                        nameEn: true,
                        nameAr: true,
                        code: true,
                    },
                },
            },
        });

        return department;
    }

    /**
     * Update department
     */
    async update(id: string, data: UpdateDepartmentData) {
        // Check if department exists
        const existingDepartment = await prisma.department.findUnique({
            where: { id },
        });

        if (!existingDepartment) {
            throw new AppError("Department not found", 404);
        }

        // If collegeId is being updated, check if college exists
        if (data.collegeId) {
            const college = await prisma.college.findUnique({
                where: { id: data.collegeId },
            });

            if (!college) {
                throw new AppError("College not found", 404);
            }
        }

        // Check if code is being changed and already exists
        if (data.code && data.code !== existingDepartment.code) {
            const codeExists = await prisma.department.findUnique({
                where: { code: data.code },
            });

            if (codeExists) {
                throw new AppError("Department code already exists", 400);
            }
        }

        // If headId is being updated, verify faculty exists
        if (data.headId) {
            const faculty = await prisma.faculty.findUnique({
                where: { id: data.headId },
            });

            if (!faculty) {
                throw new AppError("Faculty member not found", 404);
            }
        }

        const department = await prisma.department.update({
            where: { id },
            data,
            include: {
                college: {
                    select: {
                        id: true,
                        nameEn: true,
                        nameAr: true,
                        code: true,
                    },
                },
            },
        });

        return department;
    }

    /**
     * Delete department
     */
    async delete(id: string) {
        // Check if department exists
        const existingDepartment = await prisma.department.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        curricula: true,
                        students: true,
                        batches: true,
                        courses: true,
                    },
                },
            },
        });

        if (!existingDepartment) {
            throw new AppError("Department not found", 404);
        }

        // Check if department has related records
        if (existingDepartment._count.curricula > 0) {
            throw new AppError(
                "Cannot delete department with existing curricula. Please delete or reassign curricula first.",
                400
            );
        }

        if (existingDepartment._count.students > 0) {
            throw new AppError(
                "Cannot delete department with existing students. Please reassign students first.",
                400
            );
        }

        if (existingDepartment._count.batches > 0) {
            throw new AppError(
                "Cannot delete department with existing batches. Please delete or reassign batches first.",
                400
            );
        }

        await prisma.department.delete({
            where: { id },
        });

        return { message: "Department deleted successfully" };
    }

    /**
     * Get department specializations
     */
    async getSpecializations(id: string) {
        // Check if department exists
        const department = await prisma.department.findUnique({
            where: { id },
        });

        if (!department) {
            throw new AppError("Department not found", 404);
        }

        // Specialization model not implemented yet
        const specializations: any[] = [];
        /* const specializations = await prisma.specialization.findMany({
            where: { departmentId: id },
            include: {
                _count: {
                    select: {
                        students: true,
                        curricula: true,
                    },
                },
            },
        }); */

        return specializations;
    }
}

export const departmentsService = new DepartmentsService();
