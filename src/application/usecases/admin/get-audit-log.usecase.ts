import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { auditLogFilterSchema } from "../../../domain/validation/admin.schema";

export function getAuditLogUsecase(repo: AuditLogRepository, input: unknown) {
    const { start, end, type, userId } = auditLogFilterSchema.parse(input);

    return repo.findMany({
        startDate: start ? new Date(`${start}T00:00:00`) : undefined,
        endDate: end ? new Date(`${end}T23:59:59`) : undefined,
        type,
        userId,
    });
}
