import type { IProductRepository } from "../../../domain/repositories/IProductRepository";
import type { IProductListCache } from "../../../domain/ports/IProductListCache";
import type { Product } from "../../../domain/entities/Product";

export interface ListProductsInput {
  vendorId?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}

const CACHE_TTL_SECONDS = 300;

export class ListProductsUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly cache?: IProductListCache
  ) {}

  async execute(input: ListProductsInput = {}): Promise<Product[]> {
    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;
    const cacheKey = `v:${input.vendorId ?? "all"}:c:${input.categoryId ?? "all"}:${limit}:${offset}`;

    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const products = await this.productRepo.findMany({
      vendorId: input.vendorId,
      categoryId: input.categoryId,
      isActive: true,
      moderationStatus: "APPROVED",
      limit,
      offset
    });

    if (this.cache) {
      await this.cache.set(cacheKey, products, CACHE_TTL_SECONDS);
    }
    return products;
  }
}
