import { z } from "zod";

/**
 * Product Creation Schema
 * Matches requirements for Vendor product creation.
 * Uses z.coerce to handle string-to-number conversion automatically,
 * ensuring 200 OK even if the frontend sends form strings.
 */
export const createProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  
  // Coerce handles "10.99" -> 10.99 automatically
  price: z.coerce.number().positive("Price must be greater than zero"),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  
  categoryId: z.string().optional(),
  images: z.array(z.string().url()).optional().default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;