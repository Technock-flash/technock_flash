import type { IRateLimitStore } from "../../domain/ports/IRateLimitStore";

const store = new Map<string, { count: number; resetAt: number }>();
const PREFIX = "ratelimit:";

export class MemoryRateLimitStore implements IRateLimitStore {
  async get(key: string): Promise<{ count: number; resetAt: number } | null> {
    const entry = store.get(`${PREFIX}${key}`);
    if (!entry || Date.now() > entry.resetAt) {
      if (entry) store.delete(`${PREFIX}${key}`);
      return null;
    }
    return entry;
  }

  async set(key: string, count: number, windowMs: number): Promise<void> {
    const resetAt = Date.now() + windowMs;
    store.set(`${PREFIX}${key}`, { count, resetAt });
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    const fullKey = `${PREFIX}${key}`;
    const entry = store.get(fullKey);
    const now = Date.now();
    if (!entry || now > entry.resetAt) {
      const resetAt = now + windowMs;
      const newEntry = { count: 1, resetAt };
      store.set(fullKey, newEntry);
      return newEntry;
    }
    entry.count += 1;
    return entry;
  }
}
