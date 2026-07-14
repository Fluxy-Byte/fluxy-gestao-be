import type { UserRepository } from "../../../domain/repository/user.repository";
import type { InvoiceRepository } from "../../../domain/repository/invoice.repository";
import { lastDayOfMonth, monthKey, planPrice, startOfMonth, toAsaasDate } from "../../../domain/billing";
import { createAsaasPayment } from "../../../infrastructure/payment/asaas.client";
import { sendMail } from "../../../infrastructure/email/mailer";
import { invoiceEmailTemplate } from "../../../infrastructure/email/templates";
import { ensureAsaasCustomer } from "./ensure-asaas-customer";

// Gera a fatura do mês corrente para todo usuário pagante que já passou do primeiro
// mês (gratuito) na plataforma e ainda não tem fatura para este mês de competência.
export async function generateMonthlyInvoicesUsecase(
    userRepo: UserRepository,
    invoiceRepo: InvoiceRepository,
    now = new Date(),
): Promise<{ generated: number; failed: number }> {
    const currentMonthStart = startOfMonth(now);
    const referenceMonth = monthKey(now);
    const dueDate = lastDayOfMonth(now);

    const billableUsers = await userRepo.findBillableBeforeMonth(currentMonthStart);

    let generated = 0;
    let failed = 0;

    for (const user of billableUsers) {
        try {
            const existing = await invoiceRepo.findByUserAndMonth(user.id, referenceMonth);
            if (existing) continue;

            const customerId = await ensureAsaasCustomer(userRepo, user);
            const amount = planPrice(user.plan);

            const payment = await createAsaasPayment({
                customerId,
                value: amount,
                dueDate: toAsaasDate(dueDate),
                description: `Assinatura Fluxy Gestão — competência ${referenceMonth}`,
                externalReference: `${user.id}:${referenceMonth}`,
            });

            const invoice = await invoiceRepo.create(user.id, {
                referenceMonth,
                amount,
                dueDate,
                asaasPaymentId: payment.id,
                asaasInvoiceUrl: payment.invoiceUrl,
            });

            await sendMail(
                user.email,
                "Sua fatura Fluxy Gestão está disponível",
                invoiceEmailTemplate(
                    user.name,
                    amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                    dueDate.toLocaleDateString("pt-BR"),
                    invoice.asaasInvoiceUrl!,
                ),
            );

            generated++;
        } catch (err) {
            failed++;
            console.error(`[billing] falha ao gerar fatura para usuário ${user.id}:`, (err as Error).message);
        }
    }

    return { generated, failed };
}
