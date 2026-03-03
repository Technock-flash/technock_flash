import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi, type Order } from "../../../services/api/orderApi";
import { formatPrice } from "../../../shared/utils/format";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { EmptyState } from "../../../shared/ui/EmptyState";

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    orderApi
      .list()
      .then(setOrders)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed")
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageContainer title="Orders" isLoading />;
  if (error) {
    return (
      <PageContainer title="Orders">
        <p style={{ color: "#e74c3c" }}>{error}</p>
      </PageContainer>
    );
  }
  if (orders.length === 0) {
    return (
      <PageContainer title="Orders">
        <EmptyState
          title="No orders yet"
          description="Your order history will appear here."
          action={<Link to="/products">Browse products</Link>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Orders">
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Order</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Date</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Status</th>
              <th style={{ textAlign: "right", padding: "0.5rem" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td style={{ padding: "0.5rem" }}>
                  <Link to={`/orders/${o.id}`}>{o.orderNumber}</Link>
                </td>
                <td style={{ padding: "0.5rem", color: "#888" }}>
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "0.5rem" }}>{o.status}</td>
                <td style={{ padding: "0.5rem", textAlign: "right" }}>
                  {formatPrice(o.totalCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
