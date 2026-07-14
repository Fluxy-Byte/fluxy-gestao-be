import type { UserRepository } from "../../../domain/repository/user.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { dateRangeSchema } from "../../../domain/validation/admin.schema";

export async function getAdminMetricsUsecase(
    userRepo: UserRepository,
    auditRepo: AuditLogRepository,
    input: unknown,
) {
    const { start, end } = dateRangeSchema.parse(input);

    const [totalUsers, accessCount] = await Promise.all([
        userRepo.count(),
        auditRepo.countInRange({
            startDate: new Date(`${start}T00:00:00`),
            endDate: new Date(`${end}T23:59:59`),
        }),
    ]);

    return { totalUsers, accessCount };
}
