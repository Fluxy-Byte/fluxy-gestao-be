import type { InvoiceRepository } from "../../../domain/repository/invoice.repository";
import type { UserRepository } from "../../../domain/repository/user.repository";
import { ASAAS_PAID_STATUSES, getAsaasPayment } from "../../../infrastructure/payment/asaas.client";

// Consulta a Asaas para toda fatura ainda PENDING e marca como paga quando o
// pagamento já foi confirmado. Se o usuário estava bloqueado por atraso e não
// resta nenhuma outra fatura vencida em aberto, libera o acesso de volta.
export async function syncInvoiceStatusesUsecase(
    invoiceRepo: InvoiceRepository,
    userRepo: UserRepository,
    userId?: string,
): Promise<{ paid: number }> {
    const pending = await invoiceRepo.findPendingWithPaymentId(userId);
    let paid = 0;

    for (const invoice of pending) {
        try {
            const payment = await getAsaasPayment(invoice.asaasPaymentId!);
            if (!ASAAS_PAID_STATUSES.has(payment.status)) continue;

            await invoiceRepo.markPaid(invoice.id);
            paid++;

            const stillOverdue = await invoiceRepo.findUnpaidDueBefore(invoice.userId, new Date());
            if (stillOverdue.length === 0) {
                await userRepo.setBillingBlocked(invoice.userId, false);
            }
        } catch (err) {
            console.error(`[billing] falha ao sincronizar fatura ${invoice.id}:`, (err as Error).message);
        }
    }

    return { paid };
}
