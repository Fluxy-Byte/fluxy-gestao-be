import type { ServiceRepository } from "../../../domain/repository/service.repository";
import { cached, cacheKey, invalidate } from "../../../infrastructure/cache/cache";

export function listServicesUsecase(repo: ServiceRepository, userId: string) {
    return cached(cacheKey("services", userId), 60, () => repo.findAllByUser(userId));
}

export function listActiveServicesUsecase(repo: ServiceRepository, userId: string) {
    return cached(cacheKey("services", "active", userId), 60, () => repo.findActiveByUser(userId));
}

export function invalidateServiceCaches(userId: string) {
    return invalidate(cacheKey("services", userId), cacheKey("services", "active", userId));
}
