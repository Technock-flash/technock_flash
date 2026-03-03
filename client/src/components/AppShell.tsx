import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAppSelector } from "../core/hooks/useAppSelector";
import { useAppDispatch } from "../core/hooks/useAppDispatch";
import { logout } from "../core/auth/authSlice";
import { selectCartTotals } from "../features/cart/cartSlice";
import styles from "./AppShell.module.css";

export function AppShell() {
  const { user } = useAppSelector((s) => s.auth);
  const { itemCount } = useAppSelector(selectCartTotals);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          ZimMarket
        </Link>
        <nav className={styles.nav}>
          <Link to="/products">Products</Link>
          <Link to="/vendors">Vendors</Link>
          {user ? (
            <>
              <Link to="/cart">
                Cart {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
              </Link>
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/orders">Orders</Link>
              {user.role === "VENDOR" && (
                <Link to="/vendor">Dashboard</Link>
              )}
              {user.role === "ADMIN" && (
                <Link to="/admin">Admin</Link>
              )}
              <button type="button" onClick={handleLogout} className={styles.btn}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
