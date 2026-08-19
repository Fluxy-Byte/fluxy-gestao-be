import type { UserRepository } from "../../../domain/repository/user.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { setContractAcceptanceSchema } from "../../../domain/validation/billing.schema";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

// Registra a decisão do usuário sobre a contratação paga da plataforma, pedida quando o
// mês gratuito termina (ver requireActiveBilling). Recusar não é diferente de nunca
// responder — a flag já nasce false — mas registramos o evento para o admin ter
// visibilidade da recusa explícita na auditoria.
export async function setContractAcceptanceUsecase(
    userRepo: UserRepository,
    auditLogRepo: AuditLogRepository,
    userId: string,
    input: unknown,
) {
    const { accepted } = setContractAcceptanceSchema.parse(input);
    const user = await userRepo.setContractAcceptance(userId, accepted);
    await recordAuditLog(auditLogRepo, {
        userId,
        about: accepted ? "Confirmou a contratação da plataforma" : "Recusou a contratação da plataforma",
        type: "STATUS_CHANGE",
    });
    return user;
}
