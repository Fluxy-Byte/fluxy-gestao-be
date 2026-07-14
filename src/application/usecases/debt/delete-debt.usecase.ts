import type { DebtRepository } from "../../../domain/repository/debt.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

export async function deleteDebtUsecase(
    repo: DebtRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    id: string,
) {
    await repo.softDelete(id, userId);
    await recordAuditLog(auditRepo, {
        userId,
        about: "Dívida removida",
        type: "DELETE",
        entityId: id,
        entityType: "Debt",
    });
}
