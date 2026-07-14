import type { OrderRepository } from "../../../domain/repository/order.repository";
import { cached, cacheKey, invalidate } from "../../../infrastructure/cache/cache";

export function listOpenOrdersUsecase(repo: OrderRepository, userId: string) {
    return cached(cacheKey("orders:open", userId), 30, () => repo.findOpenByUser(userId));
}

export function listClosedOrdersUsecase(repo: OrderRepository, userId: string) {
    return cached(cacheKey("orders:closed", userId), 30, () => repo.findClosedByUser(userId));
}

export function listReceivableOrdersUsecase(repo: OrderRepository, userId: string) {
    return cached(cacheKey("orders:receivable", userId), 30, () => repo.findReceivableByUser(userId));
}

export async function getOrderDetailUsecase(repo: OrderRepository, userId: string, id: string) {
    const order = await repo.findDetailById(id, userId);
    if (!order) throw new Error("Ordem de serviço não encontrada.");
    return order;
}

export function listOrdersByClientUsecase(repo: OrderRepository, userId: string, clientId: string) {
    return repo.findByClientId(userId, clientId);
}

// Open/closed order lists change on every create or status/payment update — wipe
// them so the next read repopulates via `cached()` above, same as the dashboard cache.
export function invalidateOrdersListCache(userId: string) {
    return invalidate(
        cacheKey("orders:open", userId),
        cacheKey("orders:receivable", userId),
        cacheKey("orders:closed", userId),
    );
}
