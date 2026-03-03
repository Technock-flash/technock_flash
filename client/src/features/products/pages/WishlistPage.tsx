import { useAppSelector } from "../../../core/hooks/useAppSelector";
import { ProductGrid } from "../components/ProductGrid";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Link } from "react-router-dom";

export function WishlistPage() {
  const items = useAppSelector((s) => s.wishlist.items);

  return (
    <PageContainer title="Wishlist">
      {items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Add products from the catalog to see them here."
          action={<Link to="/products">Browse products</Link>}
        />
      ) : (
        <ProductGrid products={items} isLoading={false} />
      )}
    </PageContainer>
  );
}
