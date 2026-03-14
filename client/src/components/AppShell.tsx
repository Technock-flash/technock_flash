import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  const { pathname } = useLocation();
  const isAdminSection = pathname.startsWith("/admin");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const renderNavLinks = () => {
    if (!user) {
      return (
        <>
          <Link to="/products">Products</Link>
          <Link to="/vendors">Vendors</Link>
          <Link to="/login">Login</Link>
        </>
      );
    }

    const logoutButton = (
      <button type="button" onClick={handleLogout} className={styles.btn}>
        Logout
      </button>
    );

    switch (user.role) {
      case "ADMIN":
        return (
          <>
            <Link to="/admin">Admin Dashboard</Link>
            {logoutButton}
          </>
        );
      case "VENDOR":
        return (
          <>
            <Link to="/vendor">Vendor Dashboard</Link>
            {logoutButton}
          </>
        );
      case "CUSTOMER":
      default:
        return (
          <>
            <Link to="/products">Products</Link>
            <Link to="/vendors">Vendors</Link>
            <Link to="/cart">
              Cart {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
            </Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/orders">My Orders</Link>
            {logoutButton}
          </>
        );
    }
  };

  return (
    <div
      className={isAdminSection ? `${styles.wrapper} ${styles.adminBg}` : styles.wrapper}
    >
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          ZimMarket
        </Link>
        <nav className={styles.nav}>{renderNavLinks()}</nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
