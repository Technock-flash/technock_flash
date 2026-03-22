import { useEffect, useState } from "react";
import { adminApi } from "../../services/api/adminApi";

export type Period = "day" | "week" | "month";

export interface AnalyticsData {
  totalRevenueCents: number;
  conversionRate: number;
  avgOrderValueCents: number;
  revenueByPeriod: { date: string; revenueCents: number; orderCount: number }[];
}

export function useAdminAnalytics(period: Period) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.getAnalytics(period);
        // @ts-ignore
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  return { analytics, loading, error };
}