import { Link } from "react-router-dom";
import styles from "../components/HomePage.module.css";

export function HomePage() {
  return (
    <div className={styles.container}>
      <h1>Welcome to ZimMarket</h1>
      <p className={styles.subtitle}>
        Your multi-vendor marketplace
      </p>
      <div className={styles.actions}>
        <Link
          to="/products"
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          Browse products
        </Link>
        <Link
          to="/vendors"
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          View vendors
        </Link>
      </div>
    </div>
  );
}
