import type { InvoiceRepository } from "../../../domain/repository/invoice.repository";
import { invoiceDisplayStatus } from "../../../domain/billing";

export async function listInvoicesUsecase(invoiceRepo: InvoiceRepository, userId: string) {
    const invoices = await invoiceRepo.findAllByUser(userId);
    return invoices.map((invoice) => ({
        id: invoice.id,
        referenceMonth: invoice.referenceMonth,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        invoiceUrl: invoice.asaasInvoiceUrl,
        displayStatus: invoiceDisplayStatus(invoice.status, invoice.dueDate),
    }));
}
