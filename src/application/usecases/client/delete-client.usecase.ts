import type { ClientRepository } from "../../../domain/repository/client.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { invalidate, cacheKey } from "../../../infrastructure/cache/cache";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

export async function deleteClientUsecase(
    repo: ClientRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    id: string,
) {
    await repo.softDelete(id, userId);
    await invalidate(cacheKey("clients", userId));
    await recordAuditLog(auditRepo, {
        userId,
        about: "Cliente removido",
        type: "DELETE",
        entityId: id,
        entityType: "Client",
    });
}
