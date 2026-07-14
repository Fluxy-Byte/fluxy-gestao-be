import type { ExpenseRepository } from "../../../domain/repository/expense.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

export async function deleteExpenseUsecase(
    repo: ExpenseRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    id: string,
) {
    await repo.softDelete(id, userId);
    await recordAuditLog(auditRepo, {
        userId,
        about: "Despesa removida",
        type: "DELETE",
        entityId: id,
        entityType: "Expense",
    });
}
