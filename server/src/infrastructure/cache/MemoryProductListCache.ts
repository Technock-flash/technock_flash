import type { IProductListCache } from "../../domain/ports/IProductListCache";
import type { Product } from "../../domain/entities/Product";

const store = new Map<string, { products: Product[]; expiry: number }>();
const KEY_PREFIX = "products:list:";

export class MemoryProductListCache implements IProductListCache {
  async get(key: string): Promise<Product[] | null> {
    const entry = store.get(`${KEY_PREFIX}${key}`);
    if (!entry || Date.now() > entry.expiry) {
      if (entry) store.delete(`${KEY_PREFIX}${key}`);
      return null;
    }
    return entry.products;
  }

  async set(key: string, products: Product[], ttlSeconds: number): Promise<void> {
    const expiry = Date.now() + ttlSeconds * 1000;
    store.set(`${KEY_PREFIX}${key}`, { products, expiry });
  }

  async invalidatePattern(pattern: string): Promise<void> {
    for (const key of Array.from(store.keys())) {
      if (pattern === "*" || key.includes(pattern)) {
        store.delete(key);
      }
    }
  }
}
