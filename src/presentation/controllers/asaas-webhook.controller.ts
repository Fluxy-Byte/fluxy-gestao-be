import type { Request, Response } from "express";
import { invoiceRepository } from "../../infrastructure/repositories/invoice.repository";
import { userRepository } from "../../infrastructure/repositories/user.repository";
import { handleAsaasWebhookUsecase } from "../../application/usecases/billing/handle-asaas-webhook.usecase";

export const asaasWebhookController = {
    async receive(req: Request, res: Response) {
        const result = await handleAsaasWebhookUsecase(invoiceRepository, userRepository, req.body);
        // Sempre 200: a Asaas reenvia o webhook em loop se receber algo != 2xx,
        // inclusive para eventos que nós escolhemos ignorar de propósito.
        res.status(200).json({ received: true, ...result });
    },
};
