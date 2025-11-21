import { z } from "zod";

/**
 * Course Creation Schema
 */
export const createCourseSchema = z.object({
    body: z.object({
        code: z
            .string()
            .min(2, "Course code must be at least 2 characters")
            .max(20, "Course code too long")
            .regex(
                /^[A-Z0-9]+$/,
                "Course code must be uppercase letters and numbers only"
            ),
        nameEn: z
            .string()
            .min(2, "Course name (English) must be at least 2 characters")
            .max(200, "Course name (English) too long"),
        nameAr: z
            .string()
            .min(2, "Course name (Arabic) must be at least 2 characters")
            .max(200, "Course name (Arabic) too long"),
        credits: z
            .number()
            .int("Credits must be an integer")
            .min(1, "Credits must be at least 1")
            .max(12, "Credits cannot exceed 12"),
        type: z.enum(["CORE", "ELECTIVE", "GENERAL"]),
        description: z.string().optional(),
        departmentId: z.string().nullable().optional(),
    }),
});

/**
 * Course Update Schema
 */
export const updateCourseSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Course ID is required"),
    }),
    body: z.object({
        code: z
            .string()
            .min(2, "Course code must be at least 2 characters")
            .max(20, "Course code too long")
            .regex(
                /^[A-Z0-9]+$/,
                "Course code must be uppercase letters and numbers only"
            )
            .optional(),
        nameEn: z
            .string()
            .min(2, "Course name (English) must be at least 2 characters")
            .max(200, "Course name (English) too long")
            .optional(),
        nameAr: z
            .string()
            .min(2, "Course name (Arabic) must be at least 2 characters")
            .max(200, "Course name (Arabic) too long")
            .optional(),
        credits: z
            .number()
            .int("Credits must be an integer")
            .min(1, "Credits must be at least 1")
            .max(12, "Credits cannot exceed 12")
            .optional(),
        type: z.enum(["CORE", "ELECTIVE", "GENERAL"]).optional(),
        description: z.string().optional(),
        departmentId: z.string().nullable().optional(),
    }),
});

/**
 * Course ID Param Schema
 */
export const courseIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Course ID is required"),
    }),
});

/**
 * Course Query Schema
 */
export const courseQuerySchema = z.object({
    query: z.object({
        search: z.string().optional(),
        type: z.enum(["CORE", "ELECTIVE", "GENERAL"]).optional(),
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        sortBy: z
            .enum(["nameEn", "nameAr", "code", "credits", "createdAt"])
            .optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
});

/**
 * Prerequisite Creation Schema
 */
export const addPrerequisiteSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Course ID is required"),
    }),
    body: z.object({
        prerequisiteId: z.string().min(1, "Prerequisite course ID is required"),
        type: z.enum(["PREREQUISITE", "COREQUISITE"]).default("PREREQUISITE"),
    }),
});

/**
 * Prerequisite Deletion Schema
 */
export const removePrerequisiteSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Course ID is required"),
        prerequisiteId: z.string().min(1, "Prerequisite ID is required"),
    }),
});
