import { apiClient } from "./client";

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
};
