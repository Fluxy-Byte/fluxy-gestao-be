import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z.string().trim().min(1).optional(),
    phone: z.string().nullable().optional(),
    theme: z.enum(["light", "dark"]).optional(),
});

export const updateCompanySchema = z.object({
    companyName: z.string().nullable().optional(),
    cnpj: z.string().nullable().optional(),
    cpf: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    cep: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    addressNumber: z.string().nullable().optional(),
    complement: z.string().nullable().optional(),
    neighborhood: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    currentCash: z.number().min(0).optional(),
});

export const updateBrandSchema = z.object({
    primaryColor: z.string().optional(),
    pdfColor: z.string().optional(),
    includeLogoInPdf: z.boolean().optional(),
    logoUrl: z.string().url().optional(),
});
