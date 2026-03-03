import type { Vendor } from "../../domain/entities/Vendor";
import type { IVendorRepository } from "../../domain/repositories/IVendorRepository";
import { slugify } from "../../shared/utils/slugify";
import { prisma } from "./prismaClient";

export class PrismaVendorRepository implements IVendorRepository {
  async findByOwnerId(ownerId: string): Promise<Vendor | null> {
    const vendor = await prisma.vendor.findUnique({ where: { ownerId } });
    return vendor ? this.toDomain(vendor) : null;
  }

  async create(data: {
    name: string;
    description?: string;
    ownerId: string;
    preferredCategoryIds?: string[];
  }): Promise<Vendor> {
    let slug = slugify(data.name);
    const existing = await prisma.vendor.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    const vendor = await prisma.vendor.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        ownerId: data.ownerId,
        status: "PENDING",
        preferredCategories:
          data.preferredCategoryIds && data.preferredCategoryIds.length > 0
            ? {
                create: data.preferredCategoryIds.map((categoryId) => ({
                  categoryId
                }))
              }
            : undefined
      }
    });
    return this.toDomain(vendor);
  }

  async setPreferredCategories(vendorId: string, categoryIds: string[]): Promise<void> {
    await prisma.vendorCategoryPreference.deleteMany({ where: { vendorId } });
    if (categoryIds.length > 0) {
      await prisma.vendorCategoryPreference.createMany({
        data: categoryIds.map((categoryId) => ({ vendorId, categoryId }))
      });
    }
  }

  private toDomain(raw: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    ownerId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Vendor {
    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      ownerId: raw.ownerId,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }
}
