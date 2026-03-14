import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch } from "../../../core/hooks/useAppDispatch";
import { useAppSelector } from "../../../core/hooks/useAppSelector";
import { login } from "../../../core/auth/authSlice";
import styles from "../../../components/Auth.module.css";

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
    <div className={styles.container}>
      <div className={styles.panel}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {successMessage && <p className={styles.success}>{successMessage}</p>}
          {error && <p className={styles.error}>{error}</p>}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={styles.input}
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
              className={styles.input}
            />
          </label>
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
          <p className={styles.textCenter}>
            <Link to="/forgot-password" className={styles.link}>
              Forgot password?
            </Link>
          </p>
          <p className={styles.textCenter}>
            Don't have an account? <Link to="/register" className={styles.link}>Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
