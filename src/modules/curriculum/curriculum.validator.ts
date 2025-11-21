import { z } from "zod";

/**
 * Curriculum Creation Schema
 */
export const createCurriculumSchema = z.object({
    body: z.object({
        departmentId: z.string().min(1, "Department ID is required"),
        name: z
            .string()
            .min(2, "Curriculum name must be at least 2 characters")
            .max(200, "Curriculum name too long"),
        version: z.string().min(1, "Version is required"),
        totalCredits: z
            .number()
            .int("Total credits must be an integer")
            .positive("Total credits must be positive"),
        effectiveFrom: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
            .transform((val) => new Date(val)),
        courses: z
            .array(
                z.object({
                    courseId: z.string().min(1, "Course ID is required"),
                    semester: z
                        .number()
                        .int("Semester must be an integer")
                        .min(1, "Semester must be at least 1")
                        .max(2, "Semester cannot exceed 2"),
                    year: z
                        .number()
                        .int("Year must be an integer")
                        .min(1, "Year must be at least 1")
                        .max(6, "Year cannot exceed 6"),
                    isRequired: z.boolean().default(true),
                })
            )
            .optional()
            .default([]),
    }),
});

/**
 * Curriculum Update Schema
 */
export const updateCurriculumSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Curriculum ID is required"),
    }),
    body: z.object({
        name: z
            .string()
            .min(2, "Curriculum name must be at least 2 characters")
            .max(200, "Curriculum name too long")
            .optional(),
        version: z.string().min(1, "Version is required").optional(),
        totalCredits: z
            .number()
            .int("Total credits must be an integer")
            .positive("Total credits must be positive")
            .optional(),
        effectiveFrom: z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
            .transform((val) => new Date(val))
            .optional(),
    }),
});

/**
 * Get Curriculum by ID Schema
 */
export const getCurriculumByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Curriculum ID is required"),
    }),
});

/**
 * Query Curricula Schema
 */
export const queryCurriculaSchema = z.object({
    query: z.object({
        departmentId: z.string().optional(),
        page: z
            .string()
            .transform(Number)
            .pipe(z.number().int().positive())
            .optional()
            .default("1"),
        limit: z
            .string()
            .transform(Number)
            .pipe(z.number().int().positive().max(100))
            .optional()
            .default("10"),
        search: z.string().optional(),
    }),
});

/**
 * Add Course to Curriculum Schema
 */
export const addCourseSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Curriculum ID is required"),
    }),
    body: z.object({
        courseId: z.string().min(1, "Course ID is required"),
        semester: z
            .number()
            .int("Semester must be an integer")
            .min(1, "Semester must be at least 1")
            .max(2, "Semester cannot exceed 2"),
        year: z
            .number()
            .int("Year must be an integer")
            .min(1, "Year must be at least 1")
            .max(6, "Year cannot exceed 6"),
        isRequired: z.boolean().default(true),
    }),
});

/**
 * Remove Course from Curriculum Schema
 */
export const removeCourseSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Curriculum ID is required"),
        courseId: z.string().min(1, "Course ID is required"),
    }),
});

/**
 * Update Course in Curriculum Schema
 */
export const updateCourseSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Curriculum ID is required"),
        courseId: z.string().min(1, "Course ID is required"),
    }),
    body: z.object({
        semester: z
            .number()
            .int("Semester must be an integer")
            .min(1, "Semester must be at least 1")
            .max(2, "Semester cannot exceed 2")
            .optional(),
        year: z
            .number()
            .int("Year must be an integer")
            .min(1, "Year must be at least 1")
            .max(6, "Year cannot exceed 6")
            .optional(),
        isRequired: z.boolean().optional(),
    }),
});

/**
 * Validate Curriculum Schema
 */
export const validateCurriculumSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Curriculum ID is required"),
    }),
});
