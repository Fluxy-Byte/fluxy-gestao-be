import type { InvoiceRepository } from "../../../domain/repository/invoice.repository";
import type { UserRepository } from "../../../domain/repository/user.repository";
import { sendMail } from "../../../infrastructure/email/mailer";
import { accountBlockedEmailTemplate } from "../../../infrastructure/email/templates";

// Roda depois do sync de status: qualquer usuário ainda não bloqueado com uma
// fatura vencida (de qualquer mês anterior) e não paga tem a conta bloqueada e é
// notificado por e-mail. Um usuário só recebe um e-mail por execução mesmo que
// tenha mais de uma fatura em aberto.
export async function blockOverdueUsersUsecase(
    invoiceRepo: InvoiceRepository,
    userRepo: UserRepository,
    now = new Date(),
): Promise<{ blocked: number }> {
    const overdueInvoices = await invoiceRepo.findAllUnpaidDueBefore(now);
    const byUser = new Map<string, (typeof overdueInvoices)[number]>();
    for (const invoice of overdueInvoices) {
        if (!byUser.has(invoice.userId)) byUser.set(invoice.userId, invoice);
    }

    const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:6502").split(",")[0];
    let blocked = 0;

    for (const [userId, invoice] of byUser) {
        try {
            const user = await userRepo.findById(userId);
            if (!user || user.billingBlocked) continue;

            await userRepo.setBillingBlocked(userId, true);
            await sendMail(
                user.email,
                "Sua conta Fluxy Gestão foi bloqueada por falta de pagamento",
                accountBlockedEmailTemplate(user.name, invoice.referenceMonth, `${frontendUrl}/profile`),
            );
            blocked++;
        } catch (err) {
            console.error(`[billing] falha ao bloquear usuário ${userId}:`, (err as Error).message);
        }
    }

    return { blocked };
}
