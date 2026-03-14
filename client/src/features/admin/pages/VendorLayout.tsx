import { NavLink, Outlet } from "react-router-dom";
import styles from "./VendorLayout.module.css";

const navLinks = [
  { to: "/vendor", label: "Dashboard" },
  { to: "/vendor/products", label: "Products" },
  { to: "/vendor/orders", label: "Orders" },
  { to: "/vendor/settings", label: "Settings" },
];

export function VendorLayout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="Vendor Sidebar">
        <div className={styles.logo}>
          <h2 style={{ color: 'var(--color-text-primary)' }}>Vendor Portal</h2>
        </div>
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/vendor"}
                  className={({ isActive }) => (isActive ? styles.active : "")}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className={styles.content}>
        <header className={styles.topHeader}>
          <div className={styles.breadcrumb} style={{ color: 'var(--color-text-secondary)' }}>
            <span>ZimMarket</span> / <span>Vendor Dashboard</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}