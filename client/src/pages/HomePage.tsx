import { Link } from "react-router-dom";
import styles from "../components/HomePage.module.css";

const FEATURES = [
  {
    icon: "🛒",
    title: "Wide Product Range",
    description:
      "Discover thousands of products across dozens of categories, all in one place.",
  },
  {
    icon: "🏪",
    title: "Trusted Vendors",
    description:
      "Every seller is verified and reviewed so you can shop with confidence.",
  },
  {
    icon: "⚡",
    title: "Fast & Secure",
    description:
      "Lightning-fast checkout with secure payments and real-time order tracking.",
  },
  {
    icon: "🌍",
    title: "Local & Global",
    description:
      "Support Zimbabwean businesses while accessing products from around the world.",
  },
];

export function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>Zimbabwe&apos;s #1 Marketplace</span>
          <h1 className={styles.heroTitle}>Shop Everything, From Everyone</h1>
          <p className={styles.heroSubtitle}>
            ZimMarket connects buyers with hundreds of local and international
            vendors. Find exactly what you need, at the right price.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/products" className={`${styles.btn} ${styles.btnPrimary}`}>
              Browse Products
            </Link>
            <Link to="/vendors" className={`${styles.btn} ${styles.btnOutline}`}>
              Explore Vendors
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Why ZimMarket?</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className={styles.ctaBanner}>
        <h2>Ready to start selling?</h2>
        <p>Join hundreds of vendors already growing their business on ZimMarket.</p>
        <Link to="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
          Become a Vendor
        </Link>
      </section>
    </div>
  );
}
