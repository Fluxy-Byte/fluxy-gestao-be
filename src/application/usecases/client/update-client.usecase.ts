import type { ClientRepository, UpdateClientInput } from "../../../domain/repository/client.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { updateClientSchema } from "../../../domain/validation/client.schema";
import { invalidate, cacheKey } from "../../../infrastructure/cache/cache";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

export async function updateClientUsecase(
    repo: ClientRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    id: string,
    input: UpdateClientInput,
) {
    const data = updateClientSchema.parse(input);
    const client = await repo.update(id, userId, data);
    await invalidate(cacheKey("clients", userId));
    await recordAuditLog(auditRepo, {
        userId,
        about: `Cliente "${client.name}" atualizado`,
        type: "UPDATE",
        entityId: client.id,
        entityType: "Client",
    });
    return client;
}
