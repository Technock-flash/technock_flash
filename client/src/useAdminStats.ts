import { useState, useEffect } from 'react';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  growthRate: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        setStats({
          totalRevenue: 45231.89,
          totalOrders: 156,
          activeCustomers: 1205,
          growthRate: 12.5,
        });
      } catch (err) {
        setError('Failed to load admin stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
};