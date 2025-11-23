import { z } from "zod";

export const createMaterialSchema = z.object({
    body: z.object({
        sectionId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(["LECTURE", "ASSIGNMENT", "REFERENCE", "VIDEO", "OTHER"]),
        url: z.string().url().optional(),
        weekNumber: z.number().int().min(1).max(20).optional(),
    }),
});

export const updateMaterialSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        type: z.enum(["LECTURE", "ASSIGNMENT", "REFERENCE", "VIDEO", "OTHER"]).optional(),
        url: z.string().url().optional(),
        weekNumber: z.number().int().min(1).max(20).optional(),
    }),
});

export const getMaterialSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const deleteMaterialSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export type CreateMaterialDTO = z.infer<typeof createMaterialSchema>["body"];
export type UpdateMaterialDTO = z.infer<typeof updateMaterialSchema>["body"];
