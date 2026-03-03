import { apiClient } from "./client";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceCents: number;
  totalCents: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
}

export const orderApi = {
  list: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>("/orders");
    return data;
  },

  getById: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },
};
