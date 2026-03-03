import { apiClient } from "./client";

export interface AdminStats {
  users: number;
  vendors: number;
  orders: number;
}

export interface RevenuePoint {
  date: string;
  revenueCents: number;
  orderCount: number;
}

export interface AdminAnalytics {
  revenueByPeriod: RevenuePoint[];
  totalRevenueCents: number;
  totalOrders: number;
  conversionRate: number;
  avgOrderValueCents: number;
}

export interface VendorWithOwner {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  isActive: boolean;
  owner: { email: string };
}

export interface ProductForModeration {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  vendor: { name: string };
  moderationStatus: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface RefundWithOrder {
  id: string;
  orderId: string;
  amountCents: number;
  reason: string | null;
  status: string;
  order: { orderNumber: string };
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId: string | null;
  createdAt: string;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await apiClient.get<AdminStats>("/admin/stats");
    return data;
  },

  getAnalytics: async (period?: string): Promise<AdminAnalytics> => {
    const { data } = await apiClient.get<AdminAnalytics>("/admin/analytics", {
      params: period ? { period } : undefined,
    });
    return data;
  },

  listVendors: async (params?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get<{
      items: VendorWithOwner[];
      total: number;
      page: number;
      limit: number;
    }>("/admin/vendors", { params });
    return data;
  },

  approveVendor: async (id: string) => {
    const { data } = await apiClient.post(`/admin/vendors/${id}/approve`);
    return data;
  },

  rejectVendor: async (id: string) => {
    const { data } = await apiClient.post(`/admin/vendors/${id}/reject`);
    return data;
  },

  listProductsForModeration: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await apiClient.get<{
      items: ProductForModeration[];
      total: number;
      page: number;
      limit: number;
    }>("/admin/products/moderation", { params });
    return data;
  },

  approveProduct: async (id: string) => {
    const { data } = await apiClient.post(`/admin/products/${id}/approve`);
    return data;
  },

  rejectProduct: async (id: string) => {
    const { data } = await apiClient.post(`/admin/products/${id}/reject`);
    return data;
  },

  listUsers: async (params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get<{
      items: AdminUser[];
      total: number;
      page: number;
      limit: number;
    }>("/admin/users", { params });
    return data;
  },

  updateUserRole: async (id: string, role: string) => {
    const { data } = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return data;
  },

  listRefunds: async (params?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get<{
      items: RefundWithOrder[];
      total: number;
      page: number;
      limit: number;
    }>("/admin/refunds", { params });
    return data;
  },

  approveRefund: async (id: string) => {
    const { data } = await apiClient.post(`/admin/refunds/${id}/approve`);
    return data;
  },

  rejectRefund: async (id: string) => {
    const { data } = await apiClient.post(`/admin/refunds/${id}/reject`);
    return data;
  },

  listCmsPages: async () => {
    const { data } = await apiClient.get<CmsPage[]>("/admin/cms");
    return data;
  },

  getCmsPage: async (slug: string) => {
    const { data } = await apiClient.get<CmsPage>(`/admin/cms/${slug}`);
    return data;
  },

  createCmsPage: async (body: { slug: string; title: string; content?: string }) => {
    const { data } = await apiClient.post<CmsPage>("/admin/cms", body);
    return data;
  },

  updateCmsPage: async (
    slug: string,
    body: { title?: string; content?: string; isPublished?: boolean }
  ) => {
    const { data } = await apiClient.patch<CmsPage>(`/admin/cms/${slug}`, body);
    return data;
  },

  deleteCmsPage: async (slug: string) => {
    await apiClient.delete(`/admin/cms/${slug}`);
  },

  listActivityLogs: async (params?: { entity?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get<{
      items: ActivityLog[];
      total: number;
      page: number;
      limit: number;
    }>("/admin/activity-logs", { params });
    return data;
  },
};
