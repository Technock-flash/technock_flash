import { z } from "zod";

// 1. Zod Schemas (Single source of truth for validation)
export const createProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  priceCents: z.coerce.number().int().min(0, "Price must be a positive number"),
  stock: z.coerce.number().int().min(0, "Stock must be a positive number"),
  categoryId: z.string().uuid("Invalid category ID"),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

// 2. Data Transfer Objects (DTOs) - Represents the JSON data over the wire
export interface ProductDto {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  images: string[];
  categoryId: string;
  vendorId: string;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
  isPublished: boolean;
  createdAt: string; // Dates are passed as ISO strings in JSON
  updatedAt: string;
}