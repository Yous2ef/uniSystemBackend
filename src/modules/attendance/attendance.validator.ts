import { z } from "zod";

export const markAttendanceSchema = z.object({
    body: z.object({
        enrollmentId: z.string().uuid("Invalid enrollment ID"),
        sessionDate: z.coerce.date(),
        status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
        excuse: z.string().optional(),
    }),
});

export const updateAttendanceSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid attendance ID"),
    }),
    body: z.object({
        status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]).optional(),
        excuse: z.string().optional(),
    }),
});

export const getAttendanceSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid attendance ID"),
    }),
});

export const deleteAttendanceSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid attendance ID"),
    }),
});
