import type { OrderRepository } from "../../../domain/repository/order.repository";
import type { UserRepository } from "../../../domain/repository/user.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { updateScheduleSchema } from "../../../domain/validation/order.schema";
import { resolveDeliveryDate, usesScheduling } from "../../../domain/order-scheduling";
import { invalidateDashboardCache } from "./get-dashboard.usecase";
import { invalidateOrdersListCache } from "./list-orders.usecase";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

// Reagendar (mudar dia/horário de uma OS já criada) só faz sentido pra quem usa agenda
// de horário — Padrão/Laboratório editam a data de entrega pela tela de OS normalmente,
// não por aqui.
export async function updateOrderScheduleUsecase(
    orderRepo: OrderRepository,
    userRepo: UserRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    orderId: string,
    input: unknown,
) {
    const { deliveryDate } = updateScheduleSchema.parse(input);

    const user = await userRepo.findById(userId);
    if (!user) throw new Error("Usuário não encontrado.");
    if (!usesScheduling(user.businessCategory)) {
        throw new Error("Reagendamento disponível apenas para categorias com agenda de horário.");
    }

    const resolved = resolveDeliveryDate(user.businessCategory, deliveryDate);
    const order = await orderRepo.updateDeliveryDate(orderId, userId, resolved ? new Date(resolved) : null);
    await invalidateDashboardCache(userId);
    await invalidateOrdersListCache(userId);
    await recordAuditLog(auditRepo, {
        userId,
        about: `Agendamento da OS #${order.numberOrder} atualizado`,
        type: "UPDATE",
        entityId: order.id,
        entityType: "Order",
    });
    return order;
}
