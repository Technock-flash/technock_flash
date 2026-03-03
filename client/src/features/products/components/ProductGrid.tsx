import { memo } from "react";
import type { Product } from "../../../services/api/productApi";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "../../../shared/ui/Skeleton";
import styles from "./ProductGrid.module.css";

interface Props {
  products: Product[];
  isLoading: boolean;
}

export const ProductGrid = memo<Props>(({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
});
