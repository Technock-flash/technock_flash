import { apiClient } from "./client";

export interface Product {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  instock: number;
  images?: string;
  category?: string;
  vendorId?: string;
  isActive?: boolean;
  isApproved?: boolean;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>("/products");
  return response.data;
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: Partial<Product> | FormData): Promise<Product> => {
  const response = await apiClient.post<Product>("/products", data);
  return response.data;
};

export const updateProduct = async (id: string, data: Partial<Product> | FormData): Promise<Product> => {
  const response = await apiClient.put<Product>(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};