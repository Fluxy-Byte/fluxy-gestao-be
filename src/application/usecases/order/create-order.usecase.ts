import type { CreateOrderInput, OrderRepository } from "../../../domain/repository/order.repository";
import type { ClientRepository } from "../../../domain/repository/client.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { createOrderSchema } from "../../../domain/validation/order.schema";
import { invalidateDashboardCache } from "./get-dashboard.usecase";
import { invalidateOrdersListCache } from "./list-orders.usecase";
import { recordAuditLog } from "../audit/record-audit-log.usecase";

export async function createOrderUsecase(
    orderRepo: OrderRepository,
    clientRepo: ClientRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    input: CreateOrderInput,
) {
    const data = createOrderSchema.parse(input);

    const client = await clientRepo.findById(data.clientId, userId);
    if (!client) throw new Error("Cliente não encontrado.");

    const order = await orderRepo.createWithItems(userId, data);
    await invalidateDashboardCache(userId);
    await invalidateOrdersListCache(userId);
    await recordAuditLog(auditRepo, {
        userId,
        about: `OS #${order.numberOrder} criada`,
        type: "CREATE",
        entityId: order.id,
        entityType: "Order",
    });
    return order;
}
