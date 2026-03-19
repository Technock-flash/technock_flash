import type { Product } from "../entities/Product";

export interface CreateProductInput {
  name: string;
  description?: string;
  priceCents: number;
  compareAtCents?: number;
  inStock?: number;
  sku?: string;
  vendorId: string;
  images?: string[];
}

export interface ProductListFilters {
  isPublished?: boolean;
  moderationStatus?: 'APPROVED';
}

export interface IProductRepository {
  create(data: CreateProductInput): Promise<Product>;
  findMany(filters: ProductListFilters): Promise<Product[]>;
}