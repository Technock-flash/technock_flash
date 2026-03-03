import { Link } from "react-router-dom";
import { useAppSelector } from "../../../core/hooks/useAppSelector";
import { useAppDispatch } from "../../../core/hooks/useAppDispatch";
import {
  selectCartItems,
  selectCartTotals,
  updateQuantity,
  removeItem,
} from "../cartSlice";
import { formatPrice } from "../../../shared/utils/format";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { EmptyState } from "../../../shared/ui/EmptyState";

export function CartPage() {
  const items = useAppSelector(selectCartItems);
  const { subtotalCents, itemCount } = useAppSelector(selectCartTotals);
  const dispatch = useAppDispatch();

  if (items.length === 0) {
    return (
      <PageContainer title="Cart">
        <EmptyState
          title="Your cart is empty"
          description="Add products to get started."
          action={<Link to="/products">Browse products</Link>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Cart">
      <div style={{ display: "grid", gap: "1.5rem", maxWidth: 800 }}>
        {items.map((item) => (
          <div
            key={item.productId}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              background: "#1e1e1e",
              borderRadius: 8,
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 0.25rem" }}>{item.name}</h3>
              <p style={{ margin: 0, color: "#888" }}>
                {formatPrice(item.priceCents)} × {item.quantity}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  dispatch(
                    updateQuantity({
                      productId: item.productId,
                      quantity: parseInt(e.target.value, 10) || 1,
                    })
                  )
                }
                style={{
                  width: 60,
                  padding: "0.25rem 0.5rem",
                  background: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: 4,
                  color: "#fff",
                }}
              />
              <button
                type="button"
                onClick={() => dispatch(removeItem(item.productId))}
                style={{
                  padding: "0.25rem 0.5rem",
                  background: "transparent",
                  border: "1px solid #666",
                  color: "#e74c3c",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Remove
              </button>
            </div>
            <div style={{ fontWeight: 600 }}>
              {formatPrice(item.priceCents * item.quantity)}
            </div>
          </div>
        ))}
        <div
          style={{
            padding: "1rem",
            background: "#1e1e1e",
            borderRadius: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <span>Subtotal ({itemCount} items)</span>
          <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            {formatPrice(subtotalCents)}
          </span>
        </div>
        <Link
          to="/checkout"
          style={{
            display: "block",
            textAlign: "center",
            padding: "0.75rem 1.5rem",
            background: "#646cff",
            color: "#fff",
            borderRadius: 4,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Proceed to checkout
        </Link>
      </div>
    </PageContainer>
  );
}
