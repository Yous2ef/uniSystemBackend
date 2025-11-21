import { z } from "zod";

export const enrollStudentSchema = z.object({
    body: z.object({
        studentId: z.string().min(1, "Invalid student ID"),
        sectionId: z.string().min(1, "Invalid section ID"),
    }),
});

export const dropEnrollmentSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Invalid enrollment ID"),
    }),
});

export const getEnrollmentSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Invalid enrollment ID"),
    }),
});

export const getEnrollmentsQuerySchema = z.object({
    query: z.object({
        studentId: z.string().min(1, "Invalid student ID").optional(),
        sectionId: z.string().min(1, "Invalid section ID").optional(),
        termId: z.string().min(1, "Invalid term ID").optional(),
        status: z
            .enum(["ENROLLED", "DROPPED", "WITHDRAWN", "COMPLETED"])
            .optional(),
    }),
});
