import type { DebtRepository } from "../../../domain/repository/debt.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { updateDebtSchema } from "../../../domain/validation/debt.schema";
import { recordAuditLog } from "../audit/record-audit-log.usecase";
import { resolveDebtPayment } from "./resolve-debt-payment";

export async function updateDebtUsecase(
    repo: DebtRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    id: string,
    input: unknown,
) {
    const data = updateDebtSchema.parse(input);

    let paymentPatch: { paymentStatus?: "PENDING" | "PARTIAL" | "PAID"; amountPaid?: number } = {};
    if (data.paymentStatus !== undefined || data.amountPaid !== undefined) {
        const existing = await repo.findById(id, userId);
        if (!existing) throw new Error("Dívida não encontrada.");
        const amount = data.amount ?? Number(existing.amount);
        paymentPatch = resolveDebtPayment(amount, data);
    }

    const debt = await repo.update(id, userId, { ...data, ...paymentPatch });
    await recordAuditLog(auditRepo, {
        userId,
        about: `Dívida "${debt.description}" atualizada`,
        type: "UPDATE",
        entityId: debt.id,
        entityType: "Debt",
    });
    return debt;
}
