import { z } from "zod";

/**
 * Department Creation Schema
 */
export const createDepartmentSchema = z.object({
    body: z.object({
        collegeId: z.string().min(1, "College ID is required"),
        nameEn: z
            .string()
            .min(2, "Department name (English) must be at least 2 characters")
            .max(200, "Department name (English) too long"),
        nameAr: z
            .string()
            .min(2, "Department name (Arabic) must be at least 2 characters")
            .max(200, "Department name (Arabic) too long"),
        code: z
            .string()
            .min(2, "Department code must be at least 2 characters")
            .max(20, "Department code too long")
            .regex(
                /^[A-Z0-9]+$/,
                "Department code must be uppercase letters and numbers only"
            ),
        headId: z.string().optional(),
        minGpa: z.number().min(0).max(4).optional(),
        capacity: z.number().int().positive().optional(),
        selectionYear: z.number().int().min(1).max(6).optional(),
    }),
});

/**
 * Department Update Schema
 */
export const updateDepartmentSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Department ID is required"),
    }),
    body: z.object({
        collegeId: z.string().min(1, "College ID is required").optional(),
        nameEn: z
            .string()
            .min(2, "Department name (English) must be at least 2 characters")
            .max(200, "Department name (English) too long")
            .optional(),
        nameAr: z
            .string()
            .min(2, "Department name (Arabic) must be at least 2 characters")
            .max(200, "Department name (Arabic) too long")
            .optional(),
        code: z
            .string()
            .min(2, "Department code must be at least 2 characters")
            .max(20, "Department code too long")
            .regex(
                /^[A-Z0-9]+$/,
                "Department code must be uppercase letters and numbers only"
            )
            .optional(),
        headId: z.string().nullable().optional(),
        minGpa: z.number().min(0).max(4).optional(),
        capacity: z.number().int().positive().optional(),
        selectionYear: z.number().int().min(1).max(6).optional(),
    }),
});

/**
 * Department ID Param Schema
 */
export const departmentIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Department ID is required"),
    }),
});

/**
 * Department Query Schema
 */
export const departmentQuerySchema = z.object({
    query: z.object({
        collegeId: z.string().optional(),
        search: z.string().optional(),
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        sortBy: z.enum(["nameEn", "nameAr", "code", "createdAt"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
});
