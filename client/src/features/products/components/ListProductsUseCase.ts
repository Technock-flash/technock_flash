import type { IProductRepository, ProductListFilters } from "../../../domain/repositories/IProductRepository";
import type { Product } from "../../../domain/entities/Product";
import type { IProductListCache } from "../../../domain/ports/IProductListCache";

export class ListProductsUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly productListCache: IProductListCache
  ) {}

  async execute(filters: ProductListFilters): Promise<Product[]> {
    const cacheKey = this.generateCacheKey(filters);
    
    // Try to get from cache first
    const cachedProducts = await this.productListCache.get(cacheKey);
    if (cachedProducts) {
      // Assuming the cache implementation correctly stores and retrieves class instances or that `toDomain` is called on retrieval.
      return cachedProducts;
    }

    // If not in cache, fetch from repository
    const products = await this.productRepository.findMany(filters);

    // Store in cache for subsequent requests
    await this.productListCache.set(cacheKey, products);

    return products;
  }

  private generateCacheKey(filters: ProductListFilters): string {
    const sortedFilters = Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    return sortedFilters.length > 0 ? `products:${new URLSearchParams(sortedFilters as any).toString()}` : "products:all";
  }
}