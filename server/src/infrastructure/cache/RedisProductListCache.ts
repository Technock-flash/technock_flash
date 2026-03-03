import type { IProductListCache } from "../../domain/ports/IProductListCache";
import type { Product } from "../../domain/entities/Product";
import { redis } from "./redisClient";

const KEY_PREFIX = "products:list:";
const DEFAULT_TTL = 300; // 5 minutes

export class RedisProductListCache implements IProductListCache {
  async get(key: string): Promise<Product[] | null> {
    const data = await redis.get(`${KEY_PREFIX}${key}`);
    if (!data) return null;
    try {
      return JSON.parse(data) as Product[];
    } catch {
      return null;
    }
  }

  async set(key: string, products: Product[], ttlSeconds: number = DEFAULT_TTL): Promise<void> {
    await redis.setex(`${KEY_PREFIX}${key}`, ttlSeconds, JSON.stringify(products));
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const fullPattern = `${KEY_PREFIX}${pattern}`;
    const keys = await redis.keys(fullPattern);
    if (keys.length > 0) await redis.del(...keys);
  }
}
