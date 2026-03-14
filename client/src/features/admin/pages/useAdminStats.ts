import { useState, useEffect } from "react";
import { adminApi, type AdminStats } from "../../../services/api/adminApi";

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getStats()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load stats")
      )
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}