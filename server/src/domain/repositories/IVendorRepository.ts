import type { Vendor } from "../entities/Vendor";

export interface IVendorRepository {
  findByOwnerId(ownerId: string): Promise<Vendor | null>;
  create(data: {
    name: string;
    description?: string;
    ownerId: string;
    preferredCategoryIds?: string[];
  }): Promise<Vendor>;
  setPreferredCategories(vendorId: string, categoryIds: string[]): Promise<void>;
}
