import type { Product } from "../../domain/entities/Product";
import type { IProductRepository } from "../../domain/repositories/IProductRepository";
import { slugify } from "../../shared/utils/slugify";
import { prisma } from "./prismaClient";

export class PrismaProductRepository implements IProductRepository {
  async findMany(options?: {
    vendorId?: string;
    categoryId?: string;
    isActive?: boolean;
    moderationStatus?: "PENDING" | "APPROVED" | "REJECTED";
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    const where: {
      vendorId?: string;
      isActive?: boolean;
      moderationStatus?: "PENDING" | "APPROVED" | "REJECTED";
      categories?: { some: { categoryId: string } };
    } = {};
    if (options?.vendorId) where.vendorId = options.vendorId;
    if (options?.isActive !== undefined) where.isActive = options.isActive;
    if (options?.moderationStatus) where.moderationStatus = options.moderationStatus;
    if (options?.categoryId) {
      where.categories = { some: { categoryId: options.categoryId } };
    }
    const products = await prisma.product.findMany({
      where,
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0
    });
    return products.map((p) => this.toDomain(p));
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({ where: { id } });
    return product ? this.toDomain(product) : null;
  }

  async create(data: {
    name: string;
    slug?: string;
    description?: string;
    priceCents: number;
    compareAtCents?: number;
    inStock?: number;
    sku?: string;
    vendorId: string;
    images?: string[];
  }): Promise<Product> {
    const slug = data.slug ?? slugify(data.name);
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        priceCents: data.priceCents,
        compareAtCents: data.compareAtCents ?? null,
        inStock: data.inStock ?? 0,
        sku: data.sku ?? null,
        vendorId: data.vendorId,
        images: data.images ?? [],
        moderationStatus: "PENDING"
      }
    });
    return this.toDomain(product);
  }

  private toDomain(raw: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    priceCents: number;
    compareAtCents: number | null;
    inStock: number;
    sku: string | null;
    images: string[];
    vendorId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      priceCents: raw.priceCents,
      compareAtCents: raw.compareAtCents,
      inStock: raw.inStock,
      sku: raw.sku,
      images: raw.images ?? [],
      vendorId: raw.vendorId,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }
}
