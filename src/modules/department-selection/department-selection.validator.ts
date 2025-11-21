import { z } from "zod";

export const applyDepartmentSchema = z.object({
    departmentId: z.string().cuid(),
    statement: z.string().max(1000).optional(),
});

export const processApplicationSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejectionReason: z.string().min(10).max(500).optional(),
});
