import type { AuditLogRepository, CreateAuditLogInput } from "../../../domain/repository/audit-log.repository";

export async function recordAuditLog(repo: AuditLogRepository, data: CreateAuditLogInput) {
    try {
        await repo.create(data);
    } catch (err) {
        console.error("[audit] failed to record log:", (err as Error).message);
    }
}
