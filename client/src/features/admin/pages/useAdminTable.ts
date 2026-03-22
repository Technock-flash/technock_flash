import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";

interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

type Fetcher<T, F> = (
  params: {
    page: number;
    limit: number;
    status?: F;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
) => Promise<PaginatedResponse<T>>;

interface UseAdminTableOptions<F> {
  limit: number;
  initialStatus?: F;
}

export function useAdminTable<T, F extends string = string>(
  fetcher: Fetcher<T, F>,
  options: UseAdminTableOptions<F>
) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<F | undefined>(options.initialStatus);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebounce(search, 500);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = useCallback((newStatus: F | undefined) => {
    setStatus(newStatus);
    setPage(1); // Reset page when filter changes
  }, []);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset page when search changes
  }, []);

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  }, [sortBy, sortOrder]);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: Parameters<Fetcher<T, F>>[0] = {
      page,
      limit: options.limit,
      search: debouncedSearch || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortBy ? sortOrder : undefined,
    };
    if (status) {
      params.status = status;
    }
    fetcher(params)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, status, debouncedSearch, sortBy, sortOrder, fetcher, options.limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    items,
    total,
    page,
    status,
    loading,
    error,
    search,
    sortBy,
    sortOrder,
    setPage,
    setStatus: handleStatusChange,
    setSearch: handleSearchChange,
    onSort: handleSort,
    refetch: fetch,
  };
}