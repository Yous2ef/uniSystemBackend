import prisma from "../../config/database";
import { AppError } from "../../middlewares/error.middleware";

export interface CreateCurriculumInput {
    departmentId: string;
    name: string;
    version: string;
    totalCredits: number;
    effectiveFrom: Date;
    courses?: Array<{
        courseId: string;
        semester: number;
        year: number;
        isRequired?: boolean;
    }>;
}

export interface UpdateCurriculumInput {
    name?: string;
    version?: string;
    totalCredits?: number;
    effectiveFrom?: Date;
}

export interface QueryCurriculaInput {
    departmentId?: string;
    page?: number;
    limit?: number;
    search?: string;
}

export interface AddCourseInput {
    courseId: string;
    semester: number;
    year: number;
    isRequired?: boolean;
}

export interface UpdateCourseInput {
    semester?: number;
    year?: number;
    isRequired?: boolean;
}

class CurriculumService {
    /**
     * Get all curricula with pagination and filtering
     */
    async getAll(query: QueryCurriculaInput) {
        const { departmentId, page = 1, limit = 10, search } = query;

        const where: any = {};

        if (departmentId) {
            where.departmentId = departmentId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { version: { contains: search, mode: "insensitive" } },
            ];
        }

        const [curricula, total] = await Promise.all([
            prisma.curriculum.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    department: {
                        select: {
                            id: true,
                            code: true,
                            nameEn: true,
                            nameAr: true,
                        },
                    },
                    _count: {
                        select: {
                            curriculumCourses: true,
                            batches: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.curriculum.count({ where }),
        ]);

        return {
            curricula,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get curriculum by ID with all courses
     */
    async getById(id: string) {
        const curriculum = await prisma.curriculum.findUnique({
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
                curriculumCourses: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                code: true,
                                nameEn: true,
                                nameAr: true,
                                credits: true,
                                type: true,
                            },
                        },
                    },
                    orderBy: [{ year: "asc" }, { semester: "asc" }],
                },
                _count: {
                    select: {
                        batches: true,
                    },
                },
            },
        });

        if (!curriculum) {
            throw new AppError("Curriculum not found", 404);
        }

        return curriculum;
    }

    /**
     * Create a new curriculum
     */
    async create(data: CreateCurriculumInput) {
        // Check if department exists
        const department = await prisma.department.findUnique({
            where: { id: data.departmentId },
        });

        if (!department) {
            throw new AppError("Department not found", 404);
        }

        // Validate courses if provided
        if (data.courses && data.courses.length > 0) {
            const courseIds = data.courses.map((c) => c.courseId);
            const courses = await prisma.course.findMany({
                where: { id: { in: courseIds } },
            });

            if (courses.length !== courseIds.length) {
                throw new AppError("One or more courses not found", 404);
            }

            // Validate total credits
            const calculatedCredits = courses.reduce((sum, course) => {
                return sum + course.credits;
            }, 0);

            if (calculatedCredits !== data.totalCredits) {
                throw new AppError(
                    `Total credits mismatch: expected ${data.totalCredits}, but courses sum to ${calculatedCredits}`,
                    400
                );
            }

            // Validate prerequisites (courses must be in earlier semesters)
            await this.validatePrerequisiteSequencing(data.courses);
        }

        // Create curriculum
        const curriculum = await prisma.curriculum.create({
            data: {
                departmentId: data.departmentId,
                name: data.name,
                version: data.version,
                totalCredits: data.totalCredits,
                effectiveFrom: data.effectiveFrom,
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
            },
        });

        // Add courses if provided
        if (data.courses && data.courses.length > 0) {
            await prisma.curriculumCourse.createMany({
                data: data.courses.map((course) => ({
                    curriculumId: curriculum.id,
                    courseId: course.courseId,
                    semester: course.semester,
                    year: course.year,
                    isRequired: course.isRequired ?? true,
                })),
            });
        }

        return curriculum;
    }

    /**
     * Update curriculum
     */
    async update(id: string, data: UpdateCurriculumInput) {
        const curriculum = await prisma.curriculum.findUnique({
            where: { id },
        });

        if (!curriculum) {
            throw new AppError("Curriculum not found", 404);
        }

        const updated = await prisma.curriculum.update({
            where: { id },
            data,
            include: {
                department: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                    },
                },
            },
        });

        return updated;
    }

    /**
     * Delete curriculum
     */
    async delete(id: string) {
        const curriculum = await prisma.curriculum.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        batches: true,
                    },
                },
            },
        });

        if (!curriculum) {
            throw new AppError("Curriculum not found", 404);
        }

        // Check if curriculum has batches
        if (curriculum._count.batches > 0) {
            throw new AppError(
                "Cannot delete curriculum with active batches. Please remove batches first.",
                400
            );
        }

        await prisma.curriculum.delete({
            where: { id },
        });

        return { message: "Curriculum deleted successfully" };
    }

    /**
     * Add course to curriculum
     */
    async addCourse(curriculumId: string, data: AddCourseInput) {
        // Check if curriculum exists
        const curriculum = await prisma.curriculum.findUnique({
            where: { id: curriculumId },
            include: {
                curriculumCourses: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        if (!curriculum) {
            throw new AppError("Curriculum not found", 404);
        }

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: data.courseId },
        });

        if (!course) {
            throw new AppError("Course not found", 404);
        }

        // Check if course already in curriculum
        const existingCourse = await prisma.curriculumCourse.findFirst({
            where: {
                curriculumId,
                courseId: data.courseId,
            },
        });

        if (existingCourse) {
            throw new AppError("Course already exists in curriculum", 400);
        }

        // Validate prerequisites
        const allCourses = [
            ...curriculum.curriculumCourses.map((cc) => ({
                courseId: cc.courseId,
                semester: cc.semester,
                year: cc.year,
            })),
            {
                courseId: data.courseId,
                semester: data.semester,
                year: data.year,
            },
        ];

        await this.validatePrerequisiteSequencing(allCourses);

        // Add course to curriculum
        const curriculumCourse = await prisma.curriculumCourse.create({
            data: {
                curriculumId,
                courseId: data.courseId,
                semester: data.semester,
                year: data.year,
                isRequired: data.isRequired ?? true,
            },
            include: {
                course: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                        credits: true,
                        type: true,
                    },
                },
            },
        });

        return curriculumCourse;
    }

    /**
     * Remove course from curriculum
     */
    async removeCourse(curriculumId: string, courseId: string) {
        const curriculumCourse = await prisma.curriculumCourse.findFirst({
            where: {
                curriculumId,
                courseId,
            },
        });

        if (!curriculumCourse) {
            throw new AppError("Course not found in curriculum", 404);
        }

        await prisma.curriculumCourse.delete({
            where: { id: curriculumCourse.id },
        });

        return { message: "Course removed from curriculum successfully" };
    }

    /**
     * Update course in curriculum
     */
    async updateCourse(
        curriculumId: string,
        courseId: string,
        data: UpdateCourseInput
    ) {
        const curriculumCourse = await prisma.curriculumCourse.findFirst({
            where: {
                curriculumId,
                courseId,
            },
        });

        if (!curriculumCourse) {
            throw new AppError("Course not found in curriculum", 404);
        }

        // If updating year/semester, validate prerequisites
        if (data.year !== undefined || data.semester !== undefined) {
            const curriculum = await prisma.curriculum.findUnique({
                where: { id: curriculumId },
                include: {
                    curriculumCourses: true,
                },
            });

            if (curriculum) {
                const allCourses = curriculum.curriculumCourses.map((cc) => {
                    if (cc.courseId === courseId) {
                        return {
                            courseId: cc.courseId,
                            semester: data.semester ?? cc.semester,
                            year: data.year ?? cc.year,
                        };
                    }
                    return {
                        courseId: cc.courseId,
                        semester: cc.semester,
                        year: cc.year,
                    };
                });

                await this.validatePrerequisiteSequencing(allCourses);
            }
        }

        const updated = await prisma.curriculumCourse.update({
            where: { id: curriculumCourse.id },
            data,
            include: {
                course: {
                    select: {
                        id: true,
                        code: true,
                        nameEn: true,
                        nameAr: true,
                        credits: true,
                        type: true,
                    },
                },
            },
        });

        return updated;
    }

    /**
     * Validate curriculum (check prerequisites, credits, etc.)
     */
    async validate(id: string) {
        const curriculum = await this.getById(id);

        const errors: string[] = [];
        const warnings: string[] = [];

        // Check total credits
        const calculatedCredits = curriculum.curriculumCourses.reduce(
            (sum, cc) => sum + cc.course.credits,
            0
        );

        if (calculatedCredits !== curriculum.totalCredits) {
            errors.push(
                `Total credits mismatch: expected ${curriculum.totalCredits}, but courses sum to ${calculatedCredits}`
            );
        }

        // Check prerequisite sequencing
        const courses = curriculum.curriculumCourses.map((cc) => ({
            courseId: cc.courseId,
            semester: cc.semester,
            year: cc.year,
        }));

        try {
            await this.validatePrerequisiteSequencing(courses);
        } catch (error: any) {
            errors.push(error.message);
        }

        // Check if all required courses are present
        if (curriculum.curriculumCourses.length === 0) {
            warnings.push("Curriculum has no courses");
        }

        const isValid = errors.length === 0;

        return {
            isValid,
            errors,
            warnings,
            summary: {
                totalCourses: curriculum.curriculumCourses.length,
                totalCredits: calculatedCredits,
                expectedCredits: curriculum.totalCredits,
                requiredCourses: curriculum.curriculumCourses.filter(
                    (cc) => cc.isRequired
                ).length,
                electiveCourses: curriculum.curriculumCourses.filter(
                    (cc) => !cc.isRequired
                ).length,
            },
        };
    }

    /**
     * Validate prerequisite sequencing
     * Prerequisites must be in earlier semesters
     */
    private async validatePrerequisiteSequencing(
        courses: Array<{ courseId: string; semester: number; year: number }>
    ) {
        const courseIds = courses.map((c) => c.courseId);

        // Get all prerequisites for these courses
        const prerequisites = await prisma.prerequisite.findMany({
            where: {
                courseId: { in: courseIds },
                prerequisiteId: { in: courseIds },
            },
        });

        for (const prereq of prerequisites) {
            const course = courses.find((c) => c.courseId === prereq.courseId);
            const prerequisiteCourse = courses.find(
                (c) => c.courseId === prereq.prerequisiteId
            );

            if (course && prerequisiteCourse) {
                // Calculate semester number (year * 2 + semester - 2)
                const courseSemesterNum = course.year * 2 + course.semester - 2;
                const prereqSemesterNum =
                    prerequisiteCourse.year * 2 +
                    prerequisiteCourse.semester -
                    2;

                if (prereqSemesterNum >= courseSemesterNum) {
                    throw new AppError(
                        `Prerequisite sequencing error: Prerequisite course must be in an earlier semester`,
                        400
                    );
                }
            }
        }
    }
}

export default new CurriculumService();
