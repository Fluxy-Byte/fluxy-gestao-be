import type { InvoiceRepository } from "../../../domain/repository/invoice.repository";
import { invoiceDisplayStatus } from "../../../domain/billing";

// Boleto de pagamento da plataforma para o assistente Fly: a fatura pendente com
// vencimento mais próximo (aberta ou vencida); se não houver nenhuma pendente, a mais
// recente (para o caso "está tudo pago, sua última fatura foi X").
export async function getUserInvoiceUsecase(invoiceRepo: InvoiceRepository, userId: string) {
    const invoices = await invoiceRepo.findAllByUser(userId);
    if (invoices.length === 0) return null;

    const pending = invoices
        .filter((i) => i.status === "PENDING")
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    const invoice = pending[0] ?? [...invoices].sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())[0];

    return {
        id: invoice.id,
        referenceMonth: invoice.referenceMonth,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        invoiceUrl: invoice.asaasInvoiceUrl,
        displayStatus: invoiceDisplayStatus(invoice.status, invoice.dueDate),
    };
}
