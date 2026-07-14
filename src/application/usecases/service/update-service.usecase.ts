import type { ServiceRepository, UpdateServiceInput } from "../../../domain/repository/service.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { updateServiceSchema } from "../../../domain/validation/service.schema";
import { invalidateServiceCaches } from "./list-services.usecase";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

export async function updateServiceUsecase(
    repo: ServiceRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    id: string,
    input: UpdateServiceInput,
) {
    const data = updateServiceSchema.parse(input);
    const service = await repo.update(id, userId, data);
    await invalidateServiceCaches(userId);
    await recordAuditLog(auditRepo, {
        userId,
        about: `Serviço "${service.name}" atualizado`,
        type: "UPDATE",
        entityId: service.id,
        entityType: "Service",
    });
    return service;
}
