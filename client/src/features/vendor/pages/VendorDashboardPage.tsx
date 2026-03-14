import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  productApi,
  type Product,
} from "../../../services/api/productApi";
import { formatPrice } from "../../../shared/utils/format";
import { PageContainer } from "../../../shared/ui/PageContainer";

export function VendorDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    productApi
      .list({ limit: 20 })
      .then((res) =>
        setProducts(Array.isArray(res) ? res : (res as { items: Product[] }).items)
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageContainer title="Vendor dashboard">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1rem",
            background: "var(--color-bg-secondary, #f4f4f4)",
            borderRadius: 8,
            color: "var(--color-text-primary)",
          }}
        >
          <div style={{ color: "var(--color-text-secondary, #666)", fontSize: "0.875rem" }}>Products</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {products.length}
          </div>
        </div>
      </div>

      <h3 style={{ margin: "0 0 1rem" }}>Recent products</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p style={{ color: "#888" }}>
          No products yet. Add products to see them here.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Name</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Price</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 10).map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: "0.5rem" }}>
                    <Link to={`/products/${p.id}`}>{p.name}</Link>
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {formatPrice(p.priceCents)}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{p.inStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
