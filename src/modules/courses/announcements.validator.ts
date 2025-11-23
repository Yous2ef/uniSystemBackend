import { z } from "zod";

export const createAnnouncementSchema = z.object({
    body: z.object({
        sectionId: z.string().uuid(),
        title: z.string().min(1),
        content: z.string().min(1),
        priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
        sendEmail: z.boolean().default(false),
    }),
});

export const updateAnnouncementSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
    }),
});

export const getAnnouncementSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const deleteAnnouncementSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export type CreateAnnouncementDTO = z.infer<typeof createAnnouncementSchema>["body"];
export type UpdateAnnouncementDTO = z.infer<typeof updateAnnouncementSchema>["body"];
