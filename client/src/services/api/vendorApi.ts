import { apiClient } from "./client";
import { createProduct, updateProduct, deleteProduct } from "./products";
import { productApi } from "./productApi";

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt?: string;
}

export interface VendorDetail extends Vendor {
  isActive: boolean;
  _count?: { products: number };
}

export interface VendorProduct {
  id: string;
  name: string;
  priceCents: number;
  instock: number;
  moderationStatus: string;
  description?: string;
  categoryId?: string;
  images?: string[];
}

export const vendorApi = {
  list: async (limit = 20, offset = 0): Promise<Vendor[]> => {
    const { data } = await apiClient.get<Vendor[]>(
      `/vendors?limit=${limit}&offset=${offset}`
    );
    return data;
  },

  getById: async (id: string): Promise<VendorDetail> => {
    const { data } = await apiClient.get<VendorDetail>(`/vendors/${id}`);
    return data;
  },

  getMyProducts: async (): Promise<VendorProduct[]> => {
    // Use productApi.list which properly handles the response format { items: [] }
    const products = await productApi.list();
    return products as unknown as VendorProduct[];
  },

  createProduct,
  updateProduct,
  deleteProduct,
};
