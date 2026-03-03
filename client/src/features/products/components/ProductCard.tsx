import { memo } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../../services/api/productApi";
import { formatPrice } from "../../../shared/utils/format";
import { useAppDispatch } from "../../../core/hooks/useAppDispatch";
import { useAppSelector } from "../../../core/hooks/useAppSelector";
import { addItem } from "../../cart/cartSlice";
import { toggleWishlist } from "../wishlistSlice";
import styles from "./ProductCard.module.css";

interface Props {
  product: Product;
}

export const ProductCard = memo<Props>(({ product }) => {
  const dispatch = useAppDispatch();
  const inWishlist = useAppSelector((s) =>
    s.wishlist.items.some((p) => p.id === product.id)
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        quantity: 1,
        vendorId: product.vendorId,
        slug: product.slug,
      })
    );
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(toggleWishlist(product));
  };

  return (
    <Link to={`/products/${product.id}`} className={styles.card}>
      <div className={styles.image}>
        <div className={styles.placeholder}>No image</div>
        <button
          type="button"
          className={styles.wishBtn}
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {inWishlist ? "♥" : "♡"}
        </button>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>
          {formatPrice(product.priceCents)}
          {product.compareAtCents && (
            <span className={styles.compare}>
              {formatPrice(product.compareAtCents)}
            </span>
          )}
        </p>
        <button
          type="button"
          className={styles.addBtn}
          onClick={handleAddToCart}
          disabled={product.inStock <= 0}
        >
          {product.inStock > 0 ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </Link>
  );
});
