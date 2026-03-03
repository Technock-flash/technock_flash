import { useEffect, useState } from "react";
import { adminApi, type AdminAnalytics, type AdminStats } from "../../../services/api/adminApi";
import { formatPrice } from "../../../shared/utils/format";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { RevenueChart } from "../components/RevenueChart";
import styles from "./AdminDashboardPage.module.css";

type Period = "day" | "week" | "month";

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [period, setPeriod] = useState<Period>("month");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"));
  }, []);

  useEffect(() => {
    adminApi
      .getAnalytics(period)
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, [period]);

  if (error) {
    return (
      <PageContainer title="Admin">
        <p style={{ color: "#e74c3c" }}>{error}</p>
      </PageContainer>
    );
  }

  if (!stats) {
    return <PageContainer title="Admin" isLoading />;
  }

  return (
    <PageContainer title="Admin dashboard">
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
    </PageContainer>
  );
}
