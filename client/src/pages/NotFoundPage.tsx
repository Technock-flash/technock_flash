import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
      <h1>404</h1>
      <p style={{ color: "#888", marginBottom: "1rem" }}>Page not found</p>
      <Link to="/">Go home</Link>
    </div>
  );
}
