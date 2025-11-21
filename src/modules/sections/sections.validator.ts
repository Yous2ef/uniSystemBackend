import { z } from "zod";

const scheduleSchema = z
    .object({
        day: z
            .number()
            .int()
            .min(0)
            .max(6, "Day must be between 0 (Sunday) and 6 (Saturday)"),
        startTime: z
            .string()
            .regex(
                /^([01]\d|2[0-3]):([0-5]\d)$/,
                "Start time must be in HH:MM format"
            ),
        endTime: z
            .string()
            .regex(
                /^([01]\d|2[0-3]):([0-5]\d)$/,
                "End time must be in HH:MM format"
            ),
        room: z.string().optional(),
    })
    .refine((data) => data.startTime < data.endTime, {
        message: "Start time must be before end time",
        path: ["endTime"],
    });

export const createSectionSchema = z.object({
    body: z.object({
        courseId: z.string().min(1, "Course ID is required"),
        termId: z.string().min(1, "Term ID is required"),
        code: z.string().min(1, "Section code is required"),
        facultyId: z.string().min(1, "Faculty ID is required"),
        capacity: z.number().int().min(1, "Capacity must be at least 1"),
        schedules: z.array(scheduleSchema).optional(),
    }),
});

export const updateSectionSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Section ID is required"),
    }),
    body: z.object({
        code: z.string().min(1, "Section code is required").optional(),
        facultyId: z.string().min(1, "Faculty ID is required").optional(),
        capacity: z
            .number()
            .int()
            .min(1, "Capacity must be at least 1")
            .optional(),
    }),
});

export const getSectionSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Section ID is required"),
    }),
});

export const deleteSectionSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Section ID is required"),
    }),
});

export const addScheduleSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Section ID is required"),
    }),
    body: scheduleSchema,
});

export const deleteScheduleSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Section ID is required"),
        scheduleId: z.string().min(1, "Schedule ID is required"),
    }),
});
