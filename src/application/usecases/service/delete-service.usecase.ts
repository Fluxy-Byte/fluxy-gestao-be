import type { ServiceRepository } from "../../../domain/repository/service.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { invalidateServiceCaches } from "./list-services.usecase";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

export async function deleteServiceUsecase(
    repo: ServiceRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    id: string,
) {
    await repo.softDelete(id, userId);
    await invalidateServiceCaches(userId);
    await recordAuditLog(auditRepo, {
        userId,
        about: "Serviço removido",
        type: "DELETE",
        entityId: id,
        entityType: "Service",
    });
}
