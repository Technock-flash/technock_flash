export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export class Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  inStock: number;
  images: string[];
  categoryId: string;
  vendorId: string;
  moderationStatus: ModerationStatus;
  moderationComment?: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;

  // You can add business logic methods here, e.g., canPublish()
}