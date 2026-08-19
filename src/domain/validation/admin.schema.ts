import { z } from "zod";

export const dateRangeSchema = z.object({
    start: z.string().min(1, "Data inicial é obrigatória."),
    end: z.string().min(1, "Data final é obrigatória."),
});

export const auditLogFilterSchema = z.object({
    start: z.string().optional(),
    end: z.string().optional(),
    type: z.enum(["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "STATUS_CHANGE", "PAYMENT"]).optional(),
    userId: z.string().optional(),
});

export const setBillingExemptSchema = z.object({
    exempt: z.boolean(),
});
