import { z } from "zod";

export const createBatchSchema = z.object({
    body: z.object({
        name: z.string().min(3, "Batch name must be at least 3 characters"),
        year: z
            .number()
            .int("Year must be an integer")
            .min(2020, "Year must be 2020 or later")
            .max(2100, "Invalid year"),
        departmentId: z.string().min(1, "Department ID is required"),
        curriculumId: z.string().min(1, "Curriculum ID is required"),
        maxCredits: z.number().int().min(1).max(30).optional(),
        admissionQuota: z.number().int().min(1).optional(),
    }),
});

export const updateBatchSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Batch ID is required"),
    }),
    body: z.object({
        name: z
            .string()
            .min(3, "Batch name must be at least 3 characters")
            .optional(),
        maxCredits: z.number().int().min(1).max(30).optional(),
    }),
});

export const getBatchSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Batch ID is required"),
    }),
});

export const deleteBatchSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Batch ID is required"),
    }),
});
