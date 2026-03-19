import { apiClient } from "/client";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  instock: number;
  categoryId: string | null;
  images: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string | number;
  instock: string | number;
  categoryId?: string;
  images?: string[];
}

/**
 * Product API Service
 * Implements the CRUD interface expected by useEntityManagement
 */
export const productsApi = {
  list: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>("/vendor/products");
    return response.data;
  },

  create: async (data: ProductFormData | FormData): Promise<Product> => {
    if (data instanceof FormData) {
      // Ensure schema compliance: map 'instock' to 'stock' if needed
      if (data.has("instock") && !data.has("stock")) {
        data.append("stock", data.get("instock") as string);
      }
      
      const response = await apiClient.post<Product>("/products", data);
      return response.data;
    }

    // explicit conversion for safety, though backend schema now also coerces
    const payload = {
      ...data,
      price: Number(data.price),
      stock: Number(data.instock), // Map to backend schema expectation
    };
    const response = await apiClient.post<Product>("/products", payload);
    return response.data;
  },

  update: async (data: Partial<Product> & { id: string }): Promise<Product> => {
    const { id, ...updates } = data;
    // Convert updates if they exist
    const payload = { ...updates };
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.instock !== undefined) payload.instock = Number(payload.instock);
    
    const response = await apiClient.patch<Product>(`/products/${id}`, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};