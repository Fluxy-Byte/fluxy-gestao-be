import { z } from "zod";

export const publicCatalogQuerySchema = z.object({
    userId: z.string().min(1, "userId é obrigatório."),
    clientId: z.string().min(1, "clientId é obrigatório."),
});
