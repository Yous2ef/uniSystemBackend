import { z } from "zod";

export const createAppealSchema = z.object({
    body: z.object({
        gradeId: z.string().uuid(),
        reason: z.string().min(10),
        requestedGrade: z.number().optional(),
    }),
});

export const reviewAppealSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        status: z.enum(["APPROVED", "REJECTED"]),
        response: z.string().min(1),
        newGrade: z.number().optional(),
    }),
});

export const getAppealSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export type CreateAppealDTO = z.infer<typeof createAppealSchema>["body"];
export type ReviewAppealDTO = z.infer<typeof reviewAppealSchema>["body"];
