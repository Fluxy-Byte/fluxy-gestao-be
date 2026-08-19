import type { Request, Response } from "express";
import { invoiceRepository } from "../../infrastructure/repositories/invoice.repository";
import { userRepository } from "../../infrastructure/repositories/user.repository";
import { auditLogRepository } from "../../infrastructure/repositories/audit-log.repository";
import { listInvoicesUsecase } from "../../application/usecases/billing/list-invoices.usecase";
import { syncInvoiceStatusesUsecase } from "../../application/usecases/billing/sync-invoice-statuses.usecase";
import { regenerateInvoiceLinkUsecase } from "../../application/usecases/billing/regenerate-invoice-link.usecase";
import { setContractAcceptanceUsecase } from "../../application/usecases/billing/set-contract-acceptance.usecase";
import { serialize } from "../serialize";

export const billingController = {
    async list(req: Request, res: Response) {
        await syncInvoiceStatusesUsecase(invoiceRepository, userRepository, req.userId);
        const invoices = await listInvoicesUsecase(invoiceRepository, req.userId);
        res.json(serialize(invoices));
    },

    async regenerate(req: Request, res: Response) {
        const invoice = await regenerateInvoiceLinkUsecase(
            invoiceRepository,
            userRepository,
            req.userId,
            req.params.id as string,
        );
        res.json(serialize(invoice));
    },

    async setContractAcceptance(req: Request, res: Response) {
        const user = await setContractAcceptanceUsecase(userRepository, auditLogRepository, req.userId, req.body);
        res.json(serialize(user));
    },
};
