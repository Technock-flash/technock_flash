import type { Product } from "../entities/Product";

export interface IProductListCache {
  get(key: string): Promise<Product[] | null>;
  set(key: string, products: Product[], ttlSeconds: number): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
}
