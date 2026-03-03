import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderApi, type Order } from "../../../services/api/orderApi";
import { formatPrice } from "../../../shared/utils/format";
import { PageContainer } from "../../../shared/ui/PageContainer";

const statusSteps: Record<string, number> = {
  PENDING: 1,
  CONFIRMED: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
  CANCELLED: 0,
};

export function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    orderApi
      .getById(orderId)
      .then(setOrder)
      .catch((err: { response?: { status?: number } }) => {
        setError(
          err?.response?.status === 501
            ? "Order details coming soon"
            : err instanceof Error
              ? err.message
              : "Failed"
        );
      })
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) return <PageContainer title="Order" isLoading />;
  if (error || !order)
    return (
      <PageContainer title="Order">
        <p style={{ color: "#e74c3c" }}>{error ?? "Order not found"}</p>
        <Link to="/orders">Back to orders</Link>
      </PageContainer>
    );

  const step = statusSteps[order.status] ?? 0;
  const timeline = [
    { label: "Placed", done: step >= 1 },
    { label: "Confirmed", done: step >= 2 },
    { label: "Processing", done: step >= 3 },
    { label: "Shipped", done: step >= 4 },
    { label: "Delivered", done: step >= 5 },
  ];

  return (
    <PageContainer title={"Order " + order.orderNumber}>
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 0.75rem" }}>Status</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {timeline.map((t) => (
            <span
              key={t.label}
              style={{
                padding: "0.25rem 0.5rem",
                background: t.done ? "#2d5a27" : "#333",
                borderRadius: 4,
                fontSize: "0.875rem",
              }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 0.75rem" }}>Items</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {order.items.map((i) => (
            <li
              key={i.id}
              style={{
                padding: "0.75rem 0",
                borderBottom: "1px solid #333",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Item x {i.quantity}</span>
              <span>{formatPrice(i.totalCents)}</span>
            </li>
          ))}
        </ul>
      </div>
      <p>
        <strong>Total:</strong> {formatPrice(order.totalCents)}
      </p>
      <p>
        <Link to="/orders">Back to orders</Link>
      </p>
    </PageContainer>
  );
}
