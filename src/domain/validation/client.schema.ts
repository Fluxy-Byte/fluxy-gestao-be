import { z } from "zod";

// Sempre grava o telefone do cliente com o DDI (55) na frente, já que os números
// são usados para contato via WhatsApp. Considera que o DDI já está presente quando
// há 12+ dígitos começando com 55 (mesmo critério usado em user.repository.ts),
// evitando duplicar o prefixo em números cujo DDD também seja 55 (ex: Santa Maria/RS).
const phoneSchema = z
    .string()
    .nullable()
    .optional()
    .transform((v) => {
        if (v == null) return v ?? null;
        const digits = v.replace(/\D/g, "");
        if (!digits) return null;
        return digits.length >= 12 && digits.startsWith("55") ? digits : `55${digits}`;
    });

export const createClientSchema = z.object({
    name: z.string().trim().min(1, "Nome é obrigatório."),
    email: z.string().trim().email().nullable().optional(),
    phone: phoneSchema,
    cep: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    addressNumber: z.string().nullable().optional(),
    complement: z.string().nullable().optional(),
    neighborhood: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    cpf: z.string().nullable().optional(),
    cnpj: z.string().nullable().optional(),
    laborRate: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    increase: z.number().min(0).optional(),
});

export const updateClientSchema = createClientSchema.partial();
