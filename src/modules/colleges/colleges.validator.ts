import { z } from "zod";

/**
 * College Creation Schema
 */
export const createCollegeSchema = z.object({
    body: z.object({
        nameEn: z
            .string()
            .min(2, "College name (English) must be at least 2 characters")
            .max(200, "College name (English) too long"),
        nameAr: z
            .string()
            .min(2, "College name (Arabic) must be at least 2 characters")
            .max(200, "College name (Arabic) too long"),
        code: z
            .string()
            .min(2, "College code must be at least 2 characters")
            .max(20, "College code too long")
            .regex(
                /^[A-Z0-9]+$/,
                "College code must be uppercase letters and numbers only"
            ),
        description: z.string().optional(),
    }),
});

/**
 * College Update Schema
 */
export const updateCollegeSchema = z.object({
    params: z.object({
        id: z.string().min(1, "College ID is required"),
    }),
    body: z.object({
        nameEn: z
            .string()
            .min(2, "College name (English) must be at least 2 characters")
            .max(200, "College name (English) too long")
            .optional(),
        nameAr: z
            .string()
            .min(2, "College name (Arabic) must be at least 2 characters")
            .max(200, "College name (Arabic) too long")
            .optional(),
        code: z
            .string()
            .min(2, "College code must be at least 2 characters")
            .max(20, "College code too long")
            .regex(
                /^[A-Z0-9]+$/,
                "College code must be uppercase letters and numbers only"
            )
            .optional(),
        description: z.string().optional(),
    }),
});

/**
 * College ID Param Schema
 */
export const collegeIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, "College ID is required"),
    }),
});

/**
 * College Query Schema (for filtering and pagination)
 */
export const collegeQuerySchema = z.object({
    query: z.object({
        search: z.string().optional(),
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        sortBy: z.enum(["nameEn", "nameAr", "code", "createdAt"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
});
