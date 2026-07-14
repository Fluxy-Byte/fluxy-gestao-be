import type { InvoiceRepository } from "../../../domain/repository/invoice.repository";
import type { UserRepository } from "../../../domain/repository/user.repository";
import { invoiceDisplayStatus, toAsaasDate } from "../../../domain/billing";
import { createAsaasPayment } from "../../../infrastructure/payment/asaas.client";
import { ensureAsaasCustomer } from "./ensure-asaas-customer";

const REGENERATE_GRACE_DAYS = 5;

// Gera um novo link de pagamento para uma fatura já vencida (o link antigo pode ter
// expirado). Mantém a mesma competência e valor, só troca o link/vencimento.
export async function regenerateInvoiceLinkUsecase(
    invoiceRepo: InvoiceRepository,
    userRepo: UserRepository,
    userId: string,
    invoiceId: string,
) {
    const invoice = await invoiceRepo.findById(invoiceId);
    if (!invoice || invoice.userId !== userId) {
        throw new Error("Fatura não encontrada.");
    }
    if (invoiceDisplayStatus(invoice.status, invoice.dueDate) !== "overdue") {
        throw new Error("Só é possível gerar novo link para faturas vencidas.");
    }

    const user = await userRepo.findById(userId);
    if (!user) throw new Error("Usuário não encontrado.");

    const customerId = await ensureAsaasCustomer(userRepo, user);
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + REGENERATE_GRACE_DAYS);

    const payment = await createAsaasPayment({
        customerId,
        value: Number(invoice.amount),
        dueDate: toAsaasDate(newDueDate),
        description: `Assinatura Fluxy Gestão — competência ${invoice.referenceMonth}`,
        externalReference: `${user.id}:${invoice.referenceMonth}:renew-${Date.now()}`,
    });

    return invoiceRepo.updatePaymentLink(invoice.id, {
        asaasPaymentId: payment.id,
        asaasInvoiceUrl: payment.invoiceUrl,
        dueDate: newDueDate,
        status: "PENDING",
    });
}
