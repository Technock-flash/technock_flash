import type { Product } from "../entities/Product";

export interface IProductRepository {
  findMany(options?: {
    vendorId?: string;
    categoryId?: string;
    isActive?: boolean;
    moderationStatus?: "PENDING" | "APPROVED" | "REJECTED";
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(data: {
    name: string;
    slug?: string;
    description?: string;
    priceCents: number;
    compareAtCents?: number;
    inStock?: number;
    sku?: string;
    vendorId: string;
  }): Promise<Product>;
}
