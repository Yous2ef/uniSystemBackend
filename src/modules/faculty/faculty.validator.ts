import { z } from "zod";

export const createFacultySchema = z.object({
    body: z.object({
        staffCode: z
            .string()
            .min(3, "Staff code must be at least 3 characters"),
        nameEn: z.string().min(3, "English name must be at least 3 characters"),
        nameAr: z.string().min(3, "Arabic name must be at least 3 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        phone: z.string().optional(),
        type: z.enum(["FACULTY", "TA"]).optional(),
    }),
});

export const updateFacultySchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid faculty ID"),
    }),
    body: z.object({
        nameEn: z
            .string()
            .min(3, "English name must be at least 3 characters")
            .optional(),
        nameAr: z
            .string()
            .min(3, "Arabic name must be at least 3 characters")
            .optional(),
        phone: z.string().optional(),
        type: z.enum(["FACULTY", "TA"]).optional(),
    }),
});

export const getFacultySchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid faculty ID"),
    }),
});

export const deleteFacultySchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid faculty ID"),
    }),
});
