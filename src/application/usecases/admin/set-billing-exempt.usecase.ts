import type { UserRepository } from "../../../domain/repository/user.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { setBillingExemptSchema } from "../../../domain/validation/admin.schema";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

// Isenção de cobrança definida pelo admin (ex.: funcionários que usam a plataforma sem
// pagar). Isenta o usuário tanto da exigência de aceite de contrato quanto da geração de
// fatura/boleto (ver findBillableBeforeMonth e requireActiveBilling).
export async function setBillingExemptUsecase(
    userRepo: UserRepository,
    auditLogRepo: AuditLogRepository,
    targetUserId: string,
    input: unknown,
) {
    const { exempt } = setBillingExemptSchema.parse(input);
    await userRepo.setBillingExempt(targetUserId, exempt);
    await recordAuditLog(auditLogRepo, {
        userId: targetUserId,
        about: exempt ? "Isento de cobrança pelo administrador" : "Cobrança reativada pelo administrador",
        type: "STATUS_CHANGE",
    });
}
