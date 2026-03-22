import React, { useState } from 'react';
import { useAdminStats } from './useAdminStats';
import { useAdminAnalytics } from './useAdminAnalytics';
import type { Period } from './useAdminAnalytics';
import { RevenueChart } from '../components/RevenueChart';
import { formatPrice } from '../../../shared/utils/format';
import styles from './AdminDashboardPage.module.css';

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>('week');
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();
  const { analytics, loading: analyticsLoading, error: analyticsError } = useAdminAnalytics(period);

  const isLoading = statsLoading || analyticsLoading;
  const error = statsError || analyticsError;

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Users</span>
          <span className={styles.statValue}>{stats?.users || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Vendors</span>
          <span className={styles.statValue}>{stats?.vendors || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Orders</span>
          <span className={styles.statValue}>{stats?.orders || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Revenue</span>
          <span className={styles.statValue}>
            {formatPrice(analytics?.totalRevenueCents || 0)}
          </span>
        </div>
      </div>

      {/* Analytics Section */}
      <div className={styles.chartSection}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={styles.chartTitle}>Revenue Analytics</h2>
          <div className={styles.periodTabs}>
            {(['day', 'week', 'month'] as Period[]).map((p) => (
              <button
                key={p}
                className={period === p ? styles.active : ''}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {analytics?.revenueByPeriod && (
          <RevenueChart data={analytics.revenueByPeriod} />
        )}
      </div>

      {/* Additional Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Conversion Rate</span>
          <span className={styles.metricValue}>
            {(analytics?.conversionRate || 0).toFixed(2)}%
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Avg Order Value</span>
          <span className={styles.metricValue}>
            {formatPrice(analytics?.avgOrderValueCents || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
