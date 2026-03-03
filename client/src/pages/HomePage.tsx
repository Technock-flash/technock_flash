import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <h1>Welcome to ZimMarket</h1>
      <p style={{ color: "#888", marginBottom: "2rem" }}>
        Your multi-vendor marketplace
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          to="/products"
          style={{
            padding: "0.75rem 1.5rem",
            background: "#646cff",
            color: "#fff",
            borderRadius: 4,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Browse products
        </Link>
        <Link
          to="/vendors"
          style={{
            padding: "0.75rem 1.5rem",
            background: "#333",
            color: "#fff",
            borderRadius: 4,
            textDecoration: "none",
            border: "1px solid #555",
          }}
        >
          View vendors
        </Link>
      </div>
    </div>
  );
}
