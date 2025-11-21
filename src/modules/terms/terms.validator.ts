import { z } from "zod";

export const createTermSchema = z.object({
    body: z
        .object({
            batchId: z.string().min(1, "Batch ID is required"),
            name: z.string().min(3, "Term name must be at least 3 characters"),
            type: z.enum(["FALL", "SPRING", "SUMMER"], {
                errorMap: () => ({
                    message: "Type must be FALL, SPRING, or SUMMER",
                }),
            }),
            status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED"]).optional(),
            startDate: z.coerce.date(),
            endDate: z.coerce.date(),
            registrationStart: z.coerce.date(),
            registrationEnd: z.coerce.date(),
        })
        .refine((data) => data.startDate < data.endDate, {
            message: "Start date must be before end date",
            path: ["endDate"],
        })
        .refine((data) => data.registrationStart < data.registrationEnd, {
            message:
                "Registration start date must be before registration end date",
            path: ["registrationEnd"],
        }),
});

export const updateTermSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Term ID is required"),
    }),
    body: z
        .object({
            batchId: z.string().min(1, "Batch ID is required").optional(),
            name: z
                .string()
                .min(3, "Term name must be at least 3 characters")
                .optional(),
            status: z.enum(["ACTIVE", "INACTIVE", "COMPLETED"]).optional(),
            startDate: z.coerce.date().optional(),
            endDate: z.coerce.date().optional(),
            registrationStart: z.coerce.date().optional(),
            registrationEnd: z.coerce.date().optional(),
        })
        .refine(
            (data) =>
                !data.startDate ||
                !data.endDate ||
                data.startDate < data.endDate,
            {
                message: "Start date must be before end date",
                path: ["endDate"],
            }
        )
        .refine(
            (data) =>
                !data.registrationStart ||
                !data.registrationEnd ||
                data.registrationStart < data.registrationEnd,
            {
                message:
                    "Registration start date must be before registration end date",
                path: ["registrationEnd"],
            }
        ),
});

export const getTermSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Term ID is required"),
    }),
});

export const deleteTermSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Term ID is required"),
    }),
});
