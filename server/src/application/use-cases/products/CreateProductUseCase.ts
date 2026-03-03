import type { IProductRepository } from "../../../domain/repositories/IProductRepository";
import type { IVendorRepository } from "../../../domain/repositories/IVendorRepository";
import type { IProductListCache } from "../../../domain/ports/IProductListCache";
import type { Product } from "../../../domain/entities/Product";
import { AppError } from "../../../shared/errors/AppError";

export interface CreateProductInput {
  name: string;
  description?: string;
  priceCents: number;
  compareAtCents?: number;
  inStock?: number;
  sku?: string;
  vendorOwnerId: string;
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly vendorRepo: IVendorRepository,
    private readonly productListCache?: IProductListCache
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const vendor = await this.vendorRepo.findByOwnerId(input.vendorOwnerId);
    if (!vendor) {
      throw new AppError("Vendor not found", 404);
    }

    if (input.priceCents < 0 || (input.inStock ?? 0) < 0) {
      throw new AppError("Invalid price or stock", 400);
    }

    const product = await this.productRepo.create({
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      compareAtCents: input.compareAtCents,
      inStock: input.inStock,
      sku: input.sku,
      vendorId: vendor.id
    });

    if (this.productListCache) {
      await this.productListCache.invalidatePattern("*");
    }
    return product;
  }
}
