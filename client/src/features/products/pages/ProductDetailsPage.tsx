import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productApi, type Product } from "../../../services/api/productApi";
import { formatPrice } from "../../../shared/utils/format";
import { useAppDispatch } from "../../../core/hooks/useAppDispatch";
import { useAppSelector } from "../../../core/hooks/useAppSelector";
import { addItem } from "../../cart/cartSlice";
import { toggleWishlist } from "../wishlistSlice";
import { PageContainer } from "../../../shared/ui/PageContainer";

export function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const inWishlist = useAppSelector((s) =>
    product ? s.wishlist.items.some((p) => p.id === product.id) : false
  );

  useEffect(() => {
    if (!productId) return;
    productApi
      .getById(productId)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setIsLoading(false));
  }, [productId]);

  if (isLoading) {
    return <PageContainer title="Product" isLoading />;
  }
  if (error || !product) {
    return (
      <PageContainer title="Product">
        <p style={{ color: "#e74c3c" }}>{error ?? "Product not found"}</p>
        <Link to="/products">Back to products</Link>
      </PageContainer>
    );
  }

  const handleAddToCart = () => {
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

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
  };

  return (
    <PageContainer>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            aspectRatio: 1,
            background: "#2a2a2a",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#555",
          }}
        >
          No image
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: "0 0 0.5rem" }}>{product.name}</h1>
          <p style={{ fontSize: "1.25rem", margin: "0 0 1rem" }}>
            {formatPrice(product.priceCents)}
            {product.compareAtCents && (
              <span style={{ marginLeft: "0.5rem", color: "#666", textDecoration: "line-through" }}>
                {formatPrice(product.compareAtCents)}
              </span>
            )}
          </p>
          {product.description && (
            <p style={{ color: "#aaa", marginBottom: "1.5rem" }}>
              {product.description}
            </p>
          )}
          <p style={{ marginBottom: "1rem" }}>
            {product.inStock > 0
              ? `In stock: ${product.inStock}`
              : "Out of stock"}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.inStock <= 0}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#646cff",
                border: "none",
                borderRadius: 4,
                color: "#fff",
                cursor: product.inStock > 0 ? "pointer" : "not-allowed",
              }}
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={handleWishlist}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#333",
                border: "1px solid #555",
                borderRadius: 4,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {inWishlist ? "♥ In wishlist" : "♡ Add to wishlist"}
            </button>
          </div>
          <p style={{ marginTop: "1.5rem" }}>
            <Link to="/products">← Back to products</Link>
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
