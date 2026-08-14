import type { OrderRepository } from "../../../domain/repository/order.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

export async function stopOrderRecurrenceUsecase(
    repo: OrderRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    id: string,
) {
    const existing = await repo.findDetailById(id, userId);
    if (!existing) throw new Error("Ordem de serviço não encontrada.");
    if (!existing.recurWeekly && !existing.recurMonthly) {
        throw new Error("Esta OS não é uma OS fixa.");
    }

    const order = await repo.stopRecurrence(id, userId);
    await recordAuditLog(auditRepo, {
        userId,
        about: `Recorrência da OS #${order.numberOrder} interrompida`,
        type: "UPDATE",
        entityId: order.id,
        entityType: "Order",
    });
    return order;
}
