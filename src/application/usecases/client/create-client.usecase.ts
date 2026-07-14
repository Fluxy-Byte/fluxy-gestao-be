import type { ClientRepository, CreateClientInput } from "../../../domain/repository/client.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { createClientSchema } from "../../../domain/validation/client.schema";
import { invalidate, cacheKey } from "../../../infrastructure/cache/cache";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

export async function createClientUsecase(
    repo: ClientRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    input: CreateClientInput,
) {
    const data = createClientSchema.parse(input);
    const client = await repo.create(userId, data);
    await invalidate(cacheKey("clients", userId));
    await recordAuditLog(auditRepo, {
        userId,
        about: `Cliente "${client.name}" criado`,
        type: "CREATE",
        entityId: client.id,
        entityType: "Client",
    });
    return client;
}
