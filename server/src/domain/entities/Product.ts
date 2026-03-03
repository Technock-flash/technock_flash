export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  compareAtCents: number | null;
  inStock: number;
  sku: string | null;
  vendorId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
