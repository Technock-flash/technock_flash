import { apiClient } from "./client";

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
  ): Promise<Product[] | ListProductsResponse> => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.vendorId) params.set("vendorId", filters.vendorId);
    if (filters.limit != null) params.set("limit", String(filters.limit));
    if (filters.offset != null) params.set("offset", String(filters.offset));
    const { data } = await apiClient.get<Product[] | ListProductsResponse>(
      `/products?${params}`
    );
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },
};
