import { NavLink, Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";

export function AdminLayout() {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <h2 className={styles.title}>Admin</h2>
        <nav className={styles.nav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Overview
          </NavLink>
          <NavLink
            to="/admin/vendors"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Vendors
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Orders
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Products
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Users
          </NavLink>
          <NavLink
            to="/admin/refunds"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Refunds
          </NavLink>
          <NavLink
            to="/admin/cms"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            CMS
          </NavLink>
          <NavLink
            to="/admin/activity"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Activity
          </NavLink>
        </nav>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
