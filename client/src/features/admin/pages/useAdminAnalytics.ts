import { useState, useEffect } from "react";
import { adminApi, type AdminAnalytics } from "../../../services/api/adminApi";

type Period = "day" | "week" | "month";

export function useAdminAnalytics(period: Period) {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getAnalytics(period)
      .then(setAnalytics)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
        setAnalytics(null); // Clear old data on error
      })
      .finally(() => setLoading(false));
  }, [period]);

  return { analytics, loading, error };
}