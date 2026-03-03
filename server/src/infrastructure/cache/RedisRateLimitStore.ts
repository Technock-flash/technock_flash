import type { IRateLimitStore } from "../../domain/ports/IRateLimitStore";
import { redis } from "./redisClient";

const PREFIX = "ratelimit:";

export class RedisRateLimitStore implements IRateLimitStore {
  async get(key: string): Promise<{ count: number; resetAt: number } | null> {
    const data = await redis.get(`${PREFIX}${key}`);
    if (!data) return null;
    try {
      const { count, resetAt } = JSON.parse(data);
      if (Date.now() > resetAt) return null;
      return { count, resetAt };
    } catch {
      return null;
    }
  }

  async set(key: string, count: number, windowMs: number): Promise<void> {
    const resetAt = Date.now() + windowMs;
    const ttlSeconds = Math.ceil(windowMs / 1000);
    await redis.setex(
      `${PREFIX}${key}`,
      ttlSeconds,
      JSON.stringify({ count, resetAt })
    );
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    const fullKey = `${PREFIX}${key}`;
    const data = await redis.get(fullKey);
    const now = Date.now();
    if (!data) {
      const resetAt = now + windowMs;
      const ttlSeconds = Math.ceil(windowMs / 1000);
      await redis.setex(fullKey, ttlSeconds, JSON.stringify({ count: 1, resetAt }));
      return { count: 1, resetAt };
    }
    try {
      const parsed = JSON.parse(data) as { count: number; resetAt: number };
      if (now > parsed.resetAt) {
        const resetAt = now + windowMs;
        const ttlSeconds = Math.ceil(windowMs / 1000);
        await redis.setex(fullKey, ttlSeconds, JSON.stringify({ count: 1, resetAt }));
        return { count: 1, resetAt };
      }
      parsed.count += 1;
      const ttl = Math.ceil((parsed.resetAt - now) / 1000);
      if (ttl > 0) await redis.expire(fullKey, ttl);
      await redis.set(fullKey, JSON.stringify(parsed));
      return parsed;
    } catch {
      const resetAt = now + windowMs;
      const ttlSeconds = Math.ceil(windowMs / 1000);
      await redis.setex(fullKey, ttlSeconds, JSON.stringify({ count: 1, resetAt }));
      return { count: 1, resetAt };
    }
  }
}
