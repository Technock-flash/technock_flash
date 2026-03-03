import { useEffect, useState, useCallback } from "react";
import { productApi, type Product, type ProductFilters } from "../../../services/api/productApi";

export interface UseProductListOptions extends ProductFilters {
  categoryId?: string;
  vendorId?: string;
  page?: number;
  pageSize?: number;
}

export interface UseProductListResult {
  products: Product[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductList(
  filters: UseProductListOptions = {}
): UseProductListResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;
  const offset = (page - 1) * pageSize;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productApi.list({
        categoryId: filters.categoryId,
        vendorId: filters.vendorId,
        limit: pageSize,
        offset,
      });
      const items = Array.isArray(result) ? result : (result as { items: Product[] }).items;
      const totalCount = Array.isArray(result) ? items.length : (result as { total?: number }).total ?? items.length;
      setProducts(items);
      setTotal(totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters.categoryId, filters.vendorId, pageSize, offset]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, total, isLoading, error, refetch: fetchProducts };
}
