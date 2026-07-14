import type { OrderRepository } from "../../../domain/repository/order.repository";

export function getOrderByNumberUsecase(repo: OrderRepository, userId: string, numberOrder: bigint) {
    return repo.findByNumber(userId, numberOrder);
}
