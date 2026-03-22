import { useEffect, useState } from "react";
import { adminApi } from "../../services/api/adminApi";

export interface AdminStats {
  users: number;
  vendors: number;
  orders: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}