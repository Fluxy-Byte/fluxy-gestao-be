import type { ClientRepository } from "../../../domain/repository/client.repository";
import { cached, cacheKey } from "../../../infrastructure/cache/cache";

export function listClientsUsecase(repo: ClientRepository, userId: string) {
    return cached(cacheKey("clients", userId), 60, () => repo.findAllByUser(userId));
}
