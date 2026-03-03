import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vendorApi, type Vendor } from "../../../services/api/vendorApi";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { EmptyState } from "../../../shared/ui/EmptyState";

export function VendorListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    vendorApi
      .list()
      .then(setVendors)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageContainer title="Vendors" isLoading />;
  if (vendors.length === 0)
    return (
      <PageContainer title="Vendors">
        <EmptyState title="No vendors yet" />
      </PageContainer>
    );

  return (
    <PageContainer title="Vendors">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {vendors.map((v) => (
          <Link
            key={v.id}
            to={`/vendors/${v.id}`}
            style={{
              padding: "1rem",
              background: "#1e1e1e",
              borderRadius: 8,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem" }}>{v.name}</h3>
            {v.description && (
              <p style={{ margin: 0, color: "#888", fontSize: "0.875rem" }}>
                {v.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
