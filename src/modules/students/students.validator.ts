import { z } from "zod";

export const createStudentSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain uppercase, lowercase, and number"
            ),
        studentCode: z
            .string()
            .regex(/^[0-9]{8}$/, "Student code must be 8 digits"),
        nameEn: z.string().min(3, "English name must be at least 3 characters"),
        nameAr: z.string().min(3, "Arabic name must be at least 3 characters"),
        phone: z
            .string()
            .regex(/^\+?[0-9]{9,15}$/, "Invalid phone number format")
            .optional(),
        nationalId: z
            .string()
            .regex(/^[0-9]{10,14}$/, "Invalid national ID format")
            .optional(),
        dateOfBirth: z
            .string()
            .refine((date) => !isNaN(Date.parse(date)), {
                message: "Invalid date format",
            })
            .optional(),
        gender: z
            .enum(["MALE", "FEMALE"], {
                errorMap: () => ({ message: "Gender must be MALE or FEMALE" }),
            })
            .optional(),
        batchId: z.string().min(1, "Batch ID is required"),
        departmentId: z.string().min(1, "Department ID is required").optional(),
        admissionDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),
        status: z
            .enum(["ACTIVE", "DEFERRED", "DISMISSED", "GRADUATED"])
            .optional(),
    }),
});

export const updateStudentSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Student ID is required"),
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
        phone: z
            .string()
            .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
            .optional(),
        nationalId: z
            .string()
            .regex(/^[0-9]{10,14}$/, "Invalid national ID format")
            .optional(),
        dateOfBirth: z
            .string()
            .refine((date) => !isNaN(Date.parse(date)), {
                message: "Invalid date format",
            })
            .optional(),
        gender: z
            .enum(["MALE", "FEMALE"], {
                errorMap: () => ({ message: "Gender must be MALE or FEMALE" }),
            })
            .optional(),
        departmentId: z.string().min(1, "Department ID is required").optional(),
        status: z
            .enum(["ACTIVE", "DEFERRED", "DISMISSED", "GRADUATED"])
            .optional(),
    }),
});

export const getStudentSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Student ID is required"),
    }),
});

export const deleteStudentSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Student ID is required"),
    }),
});

export const importStudentsSchema = z.object({
    body: z.object({
        batchId: z.string().min(1, "Batch ID is required"),
    }),
});

export const getStudentsByBatchSchema = z.object({
    params: z.object({
        batchId: z.string().min(1, "Batch ID is required"),
    }),
});

export const assignDepartmentSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Student ID is required"),
    }),
    body: z.object({
        departmentId: z.string().min(1, "Department ID is required"),
    }),
});
