import { redis } from "./redis";

function bigintSafe(_key: string, val: unknown) {
    return typeof val === "bigint" ? Number(val) : val;
}

export function cacheKey(...parts: (string | number)[]) {
    return parts.join(":");
}

// Fails open: if Redis is unreachable, callers still get fresh data from `fn`.
export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    try {
        const hit = await redis.get(key);
        if (hit) return JSON.parse(hit) as T;
    } catch (err) {
        console.error(`[cache] read failed for ${key}:`, (err as Error).message);
    }

    const value = await fn();

    try {
        await redis.set(key, JSON.stringify(value, bigintSafe), "EX", ttlSeconds);
    } catch (err) {
        console.error(`[cache] write failed for ${key}:`, (err as Error).message);
    }

    return value;
}

export async function invalidate(...keys: string[]) {
    if (!keys.length) return;
    try {
        await redis.del(...keys);
    } catch (err) {
        console.error(`[cache] invalidate failed for ${keys.join(",")}:`, (err as Error).message);
    }
}
