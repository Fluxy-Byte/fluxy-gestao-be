import type { CreateServiceInput, ServiceRepository } from "../../../domain/repository/service.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { createServiceSchema } from "../../../domain/validation/service.schema";
import { invalidateServiceCaches } from "./list-services.usecase";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

export async function createServiceUsecase(
    repo: ServiceRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    input: CreateServiceInput,
) {
    const data = createServiceSchema.parse(input);
    const service = await repo.create(userId, data);
    await invalidateServiceCaches(userId);
    await recordAuditLog(auditRepo, {
        userId,
        about: `Serviço "${service.name}" criado`,
        type: "CREATE",
        entityId: service.id,
        entityType: "Service",
    });
    return service;
}
