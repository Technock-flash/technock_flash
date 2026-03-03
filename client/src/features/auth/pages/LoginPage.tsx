import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch } from "../../../core/hooks/useAppDispatch";
import { useAppSelector } from "../../../core/hooks/useAppSelector";
import { login } from "../../../core/auth/authSlice";
import { PageContainer } from "../../../shared/ui/PageContainer";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: { pathname: string }; message?: string } | null;
  const from = state?.from?.pathname ?? "/";
  const successMessage = state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) navigate(from, { replace: true });
  };

  return (
    <PageContainer title="Login">
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {successMessage && (
          <p style={{ color: "#27ae60", margin: 0 }}>{successMessage}</p>
        )}
        {error && (
          <p style={{ color: "#e74c3c", margin: 0 }}>{error}</p>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.25rem",
              padding: "0.5rem 0.75rem",
              background: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: 4,
              color: "#fff",
            }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.25rem",
              padding: "0.5rem 0.75rem",
              background: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: 4,
              color: "#fff",
            }}
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
        <p style={{ margin: 0 }}>
          <Link to="/forgot-password" style={{ color: "#888", fontSize: "0.9rem" }}>
            Forgot password?
          </Link>
        </p>
        <p style={{ margin: 0, color: "#888" }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </PageContainer>
  );
}
