import prisma from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";

interface CreateCourseData {
    code: string;
    nameEn: string;
    nameAr: string;
    credits: number;
    type: "CORE" | "ELECTIVE" | "GENERAL";
    description?: string;
    departmentId?: string | null;
}

interface UpdateCourseData {
    code?: string;
    nameEn?: string;
    nameAr?: string;
    credits?: number;
    type?: "CORE" | "ELECTIVE" | "GENERAL";
    description?: string;
    departmentId?: string | null;
}

interface GetAllParams {
    search?: string;
    type?: "CORE" | "ELECTIVE" | "GENERAL";
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
}

export class CoursesService {
    /**
     * Get all courses with pagination and filters
     */
    async getAll(params: GetAllParams) {
        const { search, type, page, limit, sortBy, sortOrder } = params;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (type) {
            where.type = type;
        }

        if (search) {
            where.OR = [
                { nameEn: { contains: search, mode: "insensitive" as const } },
                { nameAr: { contains: search } },
                { code: { contains: search, mode: "insensitive" as const } },
            ];
        }

        // Get total count
        const total = await prisma.course.count({ where });

        // Get courses
        const courses = await prisma.course.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                _count: {
                    select: {
                        prerequisites: true,
                        prerequisiteFor: true,
                        curriculumCourses: true,
                    },
                },
            },
        });

        return {
            courses,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get course by ID with prerequisites and dependent courses
     */
    async getById(id: string) {
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                prerequisites: {
                    include: {
                        prerequisite: {
                            select: {
                                id: true,
                                code: true,
                                nameEn: true,
                                nameAr: true,
                                credits: true,
                            },
                        },
                    },
                },
                prerequisiteFor: {
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
                    },
                },
                _count: {
                    select: {
                        prerequisites: true,
                        prerequisiteFor: true,
                        curriculumCourses: true,
                    },
                },
            },
        });

        if (!course) {
            throw new AppError("Course not found", 404);
        }

        return course;
    }

    /**
     * Create new course
     */
    async create(data: CreateCourseData) {
        // Check if code already exists
        const existingCourse = await prisma.course.findUnique({
            where: { code: data.code },
        });

        if (existingCourse) {
            throw new AppError("Course code already exists", 400);
        }

        const course = await prisma.course.create({
            data: {
                code: data.code,
                nameEn: data.nameEn,
                nameAr: data.nameAr,
                credits: data.credits,
                type: data.type,
                description: data.description,
            },
        });

        return course;
    }

    /**
     * Update course
     */
    async update(id: string, data: UpdateCourseData) {
        // Check if course exists
        const existingCourse = await prisma.course.findUnique({
            where: { id },
        });

        if (!existingCourse) {
            throw new AppError("Course not found", 404);
        }

        // Check if code is being changed and already exists
        if (data.code && data.code !== existingCourse.code) {
            const codeExists = await prisma.course.findUnique({
                where: { code: data.code },
            });

            if (codeExists) {
                throw new AppError("Course code already exists", 400);
            }
        }

        const course = await prisma.course.update({
            where: { id },
            data,
        });

        return course;
    }

    /**
     * Delete course
     */
    async delete(id: string) {
        // Check if course exists
        const existingCourse = await prisma.course.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        prerequisites: true,
                        prerequisiteFor: true,
                        curriculumCourses: true,
                    },
                },
            },
        });

        if (!existingCourse) {
            throw new AppError("Course not found", 404);
        }

        // Check if course has dependencies
        if (existingCourse._count.prerequisiteFor > 0) {
            throw new AppError(
                "Cannot delete course that is a prerequisite for other courses. Please remove prerequisite relationships first.",
                400
            );
        }

        if (existingCourse._count.curriculumCourses > 0) {
            throw new AppError(
                "Cannot delete course that is part of curriculum. Please remove from curriculum first.",
                400
            );
        }

        await prisma.course.delete({
            where: { id },
        });

        return { message: "Course deleted successfully" };
    }

    /**
     * Add prerequisite to course
     */
    async addPrerequisite(
        courseId: string,
        prerequisiteId: string,
        type: "PREREQUISITE" | "COREQUISITE" = "PREREQUISITE"
    ) {
        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            throw new AppError("Course not found", 404);
        }

        // Check if prerequisite course exists
        const prerequisite = await prisma.course.findUnique({
            where: { id: prerequisiteId },
        });

        if (!prerequisite) {
            throw new AppError("Prerequisite course not found", 404);
        }

        // Cannot add course as its own prerequisite
        if (courseId === prerequisiteId) {
            throw new AppError("A course cannot be its own prerequisite", 400);
        }

        // Check if prerequisite already exists
        const existingPrerequisite = await prisma.prerequisite.findUnique({
            where: {
                courseId_prerequisiteId: {
                    courseId,
                    prerequisiteId,
                },
            },
        });

        if (existingPrerequisite) {
            throw new AppError("This prerequisite already exists", 400);
        }

        // Check for circular dependency
        const hasCircularDependency = await this.checkCircularDependency(
            prerequisiteId,
            courseId
        );

        if (hasCircularDependency) {
            throw new AppError(
                "Adding this prerequisite would create a circular dependency",
                400
            );
        }

        // Create prerequisite
        const newPrerequisite = await prisma.prerequisite.create({
            data: {
                courseId,
                prerequisiteId,
                type,
            },
            include: {
                prerequisite: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                        credits: true,
                    },
                },
            },
        });

        return newPrerequisite;
    }

    /**
     * Remove prerequisite from course
     */
    async removePrerequisite(courseId: string, prerequisiteId: string) {
        // Check if prerequisite exists
        const existingPrerequisite = await prisma.prerequisite.findUnique({
            where: {
                courseId_prerequisiteId: {
                    courseId,
                    prerequisiteId,
                },
            },
        });

        if (!existingPrerequisite) {
            throw new AppError("Prerequisite not found", 404);
        }

        await prisma.prerequisite.delete({
            where: {
                courseId_prerequisiteId: {
                    courseId,
                    prerequisiteId,
                },
            },
        });

        return { message: "Prerequisite removed successfully" };
    }

    /**
     * Get course prerequisites
     */
    async getPrerequisites(id: string) {
        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id },
        });

        if (!course) {
            throw new AppError("Course not found", 404);
        }

        const prerequisites = await prisma.prerequisite.findMany({
            where: { courseId: id },
            include: {
                prerequisite: true,
            },
        });

        return prerequisites;
    }

    /**
     * Get prerequisite tree (recursive)
     */
    async getPrerequisiteTree(id: string): Promise<any> {
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                prerequisites: {
                    include: {
                        prerequisite: true,
                    },
                },
            },
        });

        if (!course) {
            throw new AppError("Course not found", 404);
        }

        const tree = {
            id: course.id,
            code: course.code,
            nameEn: course.nameEn,
            nameAr: course.nameAr,
            credits: course.credits,
            prerequisites: await Promise.all(
                course.prerequisites.map(async (prereq) => {
                    const subtree = await this.getPrerequisiteTree(
                        prereq.prerequisiteId
                    );
                    return {
                        ...subtree,
                        type: prereq.type,
                    };
                })
            ),
        };

        return tree;
    }

    /**
     * Check for circular dependency
     * Returns true if adding prerequisiteId as prerequisite to courseId would create a cycle
     */
    private async checkCircularDependency(
        courseId: string,
        targetId: string,
        visited: Set<string> = new Set()
    ): Promise<boolean> {
        if (courseId === targetId) {
            return true;
        }

        if (visited.has(courseId)) {
            return false;
        }

        visited.add(courseId);

        const prerequisites = await prisma.prerequisite.findMany({
            where: { courseId },
            select: { prerequisiteId: true },
        });

        for (const prereq of prerequisites) {
            if (
                await this.checkCircularDependency(
                    prereq.prerequisiteId,
                    targetId,
                    visited
                )
            ) {
                return true;
            }
        }

        return false;
    }
}

export const coursesService = new CoursesService();
