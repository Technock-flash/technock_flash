import { apiClient } from "./client";

export interface Product {
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
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  categoryId?: string;
  vendorId?: string;
  limit?: number;
  offset?: number;
}

export interface ListProductsResponse {
  items: Product[];
  total?: number;
}

export const productApi = {
  list: async (
    filters: ProductFilters = {}
  ): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.vendorId) params.set("vendorId", filters.vendorId);
    if (filters.limit != null) params.set("limit", String(filters.limit));
    if (filters.offset != null) params.set("offset", String(filters.offset));
    const { data } = await apiClient.get<ListProductsResponse | Product[]>(
      `/products?${params}`
    );
    if ("items" in data && !Array.isArray(data)) {
      return data.items;
    }
    return data as Product[];
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },
};
