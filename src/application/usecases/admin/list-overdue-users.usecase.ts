import type { InvoiceRepository } from "../../../domain/repository/invoice.repository";

// Agrupa as faturas vencidas e não pagas por usuário, para o painel admin listar
// quem está com pagamento atrasado (independente de já ter sido bloqueado pelo job
// diário ou não — a lista reflete o atraso em tempo real).
export async function listOverdueUsersUsecase(invoiceRepo: InvoiceRepository, now = new Date()) {
    const overdueInvoices = await invoiceRepo.findOverdueWithUser(now);

    const byUser = new Map<
        string,
        {
            userId: string;
            name: string;
            email: string;
            companyName: string | null;
            plan: string;
            billingBlocked: boolean;
            overdueCount: number;
            oldestReferenceMonth: string;
            oldestDueDate: Date;
            totalOverdueAmount: number;
        }
    >();

    for (const invoice of overdueInvoices) {
        const existing = byUser.get(invoice.userId);
        if (existing) {
            existing.overdueCount++;
            existing.totalOverdueAmount += Number(invoice.amount);
        } else {
            byUser.set(invoice.userId, {
                userId: invoice.userId,
                name: invoice.user.name,
                email: invoice.user.email,
                companyName: invoice.user.companyName,
                plan: invoice.user.plan,
                billingBlocked: invoice.user.billingBlocked,
                overdueCount: 1,
                oldestReferenceMonth: invoice.referenceMonth,
                oldestDueDate: invoice.dueDate,
                totalOverdueAmount: Number(invoice.amount),
            });
        }
    }

    return Array.from(byUser.values()).sort((a, b) => a.oldestDueDate.getTime() - b.oldestDueDate.getTime());
}
