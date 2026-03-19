import { PrismaClient, Product as PrismaProduct } from "@prisma/client";
import type { IProductRepository, CreateProductInput, ProductListFilters } from "../../../domain/repositories/IProductRepository";
import type { Product } from "../../../domain/entities/Product";

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(prismaProduct: PrismaProduct): Product {
    const product = new Product();
    // This safely maps properties from the Prisma object to the domain entity instance
    Object.assign(product, {
      ...prismaProduct,
      inStock: (prismaProduct as any).inStock,
      createdAt: new Date(prismaProduct.createdAt),
      updatedAt: new Date(prismaProduct.updatedAt),
    });
    return product;
  }

  async create(data: CreateProductInput): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        priceCents: data.priceCents,
        inStock: data.inStock ?? 0,
        images: data.images ?? [],
        vendorId: data.vendorId,
        moderationStatus: "PENDING", // Default status
        isActive: true,
      },
    });
    return this.toDomain(product);
  }

  async findMany(filters: ProductListFilters & { limit?: number; offset?: number }): Promise<Product[]> {
    const { limit, offset, ...where } = filters as any;
    const products = await this.prisma.product.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return products.map(this.toDomain);
  }
}