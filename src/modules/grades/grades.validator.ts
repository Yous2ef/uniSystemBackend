import { z } from "zod";

export const createGradeComponentSchema = z.object({
    body: z.object({
        sectionId: z.string().uuid("Invalid section ID"),
        name: z.string().min(1, "Component name is required"),
        weight: z.number().min(0).max(100, "Weight must be between 0 and 100"),
        maxScore: z.number().min(0, "Max score must be positive"),
    }),
});

export const updateGradeComponentSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid component ID"),
    }),
    body: z.object({
        name: z.string().min(1, "Component name is required").optional(),
        weight: z
            .number()
            .min(0)
            .max(100, "Weight must be between 0 and 100")
            .optional(),
        maxScore: z.number().min(0, "Max score must be positive").optional(),
    }),
});

export const recordGradeSchema = z.object({
    body: z.object({
        enrollmentId: z.string().uuid("Invalid enrollment ID"),
        componentId: z.string().uuid("Invalid component ID"),
        score: z.number().min(0, "Score must be positive"),
    }),
});

export const updateGradeSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid grade ID"),
    }),
    body: z.object({
        score: z.number().min(0, "Score must be positive").optional(),
    }),
});

export const publishFinalGradesSchema = z.object({
    body: z.object({
        sectionId: z.string().uuid("Invalid section ID"),
    }),
});
