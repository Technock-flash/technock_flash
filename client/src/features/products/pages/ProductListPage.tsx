import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useProductList } from "../hooks/useProductList";
import { useCategoryList } from "../hooks/useCategoryList";
import { ProductFilters } from "../components/ProductFilters";
import { ProductGrid } from "../components/ProductGrid";
import { Pagination } from "../../../shared/ui/Pagination";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { EmptyState } from "../../../shared/ui/EmptyState";

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      categoryId: searchParams.get("category") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 24),
      sort: searchParams.get("sort") ?? "featured",
    }),
    [searchParams]
  );

  const { products, total, isLoading, error } = useProductList({
    categoryId: filters.categoryId,
    page: filters.page,
    pageSize: filters.pageSize,
  });

  const { categories } = useCategoryList();

  const filterState = useMemo(
    () => ({
      categoryId: filters.categoryId ?? "",
      sort: filters.sort,
    }),
    [filters.categoryId, filters.sort]
  );

  const handleFilterChange = (next: Partial<typeof filterState>) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next.categoryId !== undefined) {
        if (next.categoryId) p.set("category", next.categoryId);
        else p.delete("category");
        p.set("page", "1");
      }
      if (next.sort !== undefined) {
        if (next.sort) p.set("sort", next.sort);
        else p.delete("sort");
      }
      return p;
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(page));
      return p;
    });
  };

  return (
    <PageContainer title="Products">
      <ProductFilters
        categories={categories}
        value={filterState}
        onChange={handleFilterChange}
      />
      {error && (
        <p style={{ color: "#e74c3c", marginBottom: "1rem" }}>{error}</p>
      )}
      {!isLoading && products.length === 0 && (
        <EmptyState
          title="No products found"
          description="Try adjusting your filters."
        />
      )}
      <ProductGrid products={products} isLoading={isLoading} />
      {total > filters.pageSize && (
        <Pagination
          page={filters.page}
          pageSize={filters.pageSize}
          totalItems={total}
          onPageChange={handlePageChange}
        />
      )}
    </PageContainer>
  );
}
