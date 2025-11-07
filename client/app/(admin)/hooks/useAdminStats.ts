import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../../lib/api/client';
import type { AdminStatsResponse } from '../../../lib/api/models/AdminStatsResponse';

export type Period = 'today' | '7d';

export type AdminStats = AdminStatsResponse;

export function useAdminStats(initialPeriod: Period = 'today') {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (p: Period = period) => {
    try {
      setLoading(true);
      setError(null);
      const api = getApiClient();
      const data = await api.adminStats.getApiAdminStats(p);
      const defaultGlobal = { totalAll: 0, deliveredAll: 0, inProgressAll: 0, lateAll: 0 };
      setStats({ ...data, global: data.global ?? defaultGlobal });
    } catch (e) {
      setError('Impossible de charger les KPIs.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchStats(period); }, [period, fetchStats]);

  return useMemo(() => ({ period, setPeriod, stats, loading, error, refresh: () => fetchStats(period) }), [period, setPeriod, stats, loading, error, fetchStats]);
}
