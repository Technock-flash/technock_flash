import { useState } from "react";
import { formatPrice } from "../../../shared/utils/format";
import { RevenueChart } from "../components/RevenueChart";
import { useAdminStats } from "../hooks/useAdminStats";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";
import styles from "./AdminDashboardPage.module.css";

type Period = "day" | "week" | "month";

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>("month");
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAdminAnalytics(period);

  if (statsError) {
    return (
      <div>
        <h1>Admin Dashboard</h1>
        <p style={{ color: "#e74c3c" }}>{statsError}</p>
      </div>
    );
  }

  if (statsLoading || !stats) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className={styles.periodTabs}>
        {(["day", "week", "month"] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={period === p ? styles.active : ""}
            onClick={() => setPeriod(p)}
          >
            {p === "day" ? "Today" : p === "week" ? "7 days" : "30 days"}
          </button>
        ))}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total users</span>
          <span className={styles.statValue}>{stats.users}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Vendors</span>
          <span className={styles.statValue}>{stats.vendors}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total orders</span>
          <span className={styles.statValue}>{stats.orders}</span>
        </div>
      </div>

      {analyticsLoading && <p>Loading analytics...</p>}
      {analyticsError && <p style={{ color: "#e74c3c" }}>{analyticsError}</p>}
      {analytics && (
        <>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Revenue</span>
              <span className={styles.metricValue}>
                {formatPrice(analytics.totalRevenueCents)}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Conversion rate</span>
              <span className={styles.metricValue}>{analytics.conversionRate}%</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Avg order value</span>
              <span className={styles.metricValue}>
                {formatPrice(analytics.avgOrderValueCents)}
              </span>
            </div>
          </div>

          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>Revenue over time</h3>
            <RevenueChart data={analytics.revenueByPeriod} />
          </div>
        </>
      )}
    </div>
  );
}
