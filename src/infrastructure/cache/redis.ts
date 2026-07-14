import Redis from "ioredis";

export const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
    lazyConnect: false,
    maxRetriesPerRequest: 2,
});

redis.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
});
