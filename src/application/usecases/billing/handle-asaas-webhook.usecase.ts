import type { InvoiceRepository } from "../../../domain/repository/invoice.repository";
import type { UserRepository } from "../../../domain/repository/user.repository";
import { ASAAS_PAID_STATUSES } from "../../../infrastructure/payment/asaas.client";

export interface AsaasWebhookPayload {
    event?: string;
    payment?: { id?: string; status?: string };
}

// Reage ao evento de pagamento que a Asaas envia via webhook (ex: PAYMENT_RECEIVED,
// PAYMENT_CONFIRMED) para marcar a fatura correspondente como paga sem depender do
// polling diário. Ignora silenciosamente eventos que não sejam de pagamento
// confirmado ou que não correspondam a nenhuma fatura conhecida — a Asaas trata
// qualquer resposta != 2xx como falha e reenvia o webhook, então não lançamos erro
// para casos que simplesmente não nos interessam.
export async function handleAsaasWebhookUsecase(
    invoiceRepo: InvoiceRepository,
    userRepo: UserRepository,
    payload: AsaasWebhookPayload,
): Promise<{ handled: boolean }> {
    const paymentId = payload.payment?.id;
    const status = payload.payment?.status;
    if (!paymentId || !status || !ASAAS_PAID_STATUSES.has(status)) {
        return { handled: false };
    }

    const invoice = await invoiceRepo.findByAsaasPaymentId(paymentId);
    if (!invoice || invoice.status === "PAID") {
        return { handled: false };
    }

    await invoiceRepo.markPaid(invoice.id);

    const stillOverdue = await invoiceRepo.findUnpaidDueBefore(invoice.userId, new Date());
    if (stillOverdue.length === 0) {
        await userRepo.setBillingBlocked(invoice.userId, false);
    }

    return { handled: true };
}
