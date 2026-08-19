import { z } from "zod";

export const setContractAcceptanceSchema = z.object({
    accepted: z.boolean(),
});
