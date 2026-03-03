import type { Request, Response, NextFunction } from "express";
import type { IRateLimitStore } from "../../../domain/ports/IRateLimitStore";

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export const memoryRateLimitStore: IRateLimitStore = {
  async get(key: string) {
    const v = memoryStore.get(key);
    if (!v) return null;
    if (Date.now() > v.resetAt) {
      memoryStore.delete(key);
      return null;
    }
    return v;
  },
  async set(key: string, count: number, windowMs: number) {
    memoryStore.set(key, { count, resetAt: Date.now() + windowMs });
  },
  async increment(key: string, windowMs: number) {
    const existing = memoryStore.get(key);
    const now = Date.now();
    if (!existing || now > existing.resetAt) {
      const resetAt = now + windowMs;
      memoryStore.set(key, { count: 1, resetAt });
      return { count: 1, resetAt };
    }
    existing.count += 1;
    return { count: existing.count, resetAt: existing.resetAt };
  }
};

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  store?: IRateLimitStore;
  keyGenerator?: (req: Request) => string;
}

/**
 * In-memory rate limiter. For production, use Redis (e.g. rate-limit-redis).
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, store = memoryRateLimitStore, keyGenerator = defaultKey } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = keyGenerator(req);
    const { count, resetAt } = await store.increment(key, windowMs);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - count)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
    if (count > max) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }
    next();
  };
}

function defaultKey(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (typeof forwarded === "string" ? forwarded.split(",")[0] : null) || req.socket.remoteAddress || "unknown";
  return ip.trim();
}
