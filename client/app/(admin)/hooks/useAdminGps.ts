import { useCallback, useEffect, useState } from 'react';
import { getApiClient } from '../../../lib/api/client';
import type { AdminCourierLocation } from '../../../lib/api/models/AdminCourierLocation';
import { useToast } from '../../../components/ui/Toast';
import { useAutoRefresh } from './useAutoRefresh';

export function useAdminGps() {
  const { showToast } = useToast();

  const [couriers, setCouriers] = useState<AdminCourierLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const api = getApiClient();
      const res = await api.adminGps.getApiAdminGpsCouriers(onlyActive);
      setCouriers(res.items ?? []);
    } catch (e: any) {
      const msg: string = e?.body?.msg || e?.message || 'Chargement des positions livreurs échoué';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [onlyActive, showToast]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const { enabled: autoRefreshEnabled, setEnabled: setAutoRefreshEnabled } = useAutoRefresh(
    () => {
      load().catch(() => {});
    },
    { storageKey: 'admin_gps_autorefresh', intervalMs: 60000, defaultEnabled: true }
  );

  const toggleTracking = useCallback(
    async (id: number, enabled: boolean) => {
      setUpdatingId(id);
      try {
        const api = getApiClient();
        await api.adminGps.patchApiAdminGpsCouriersTracking(id, { enabled });
        showToast('Suivi GPS mis à jour', 'success');
        await load();
      } catch (e: any) {
        const msg: string = e?.body?.msg || e?.message || 'Mise à jour du suivi GPS échouée';
        showToast(msg, 'error');
      } finally {
        setUpdatingId(null);
      }
    },
    [load, showToast]
  );

  return {
    couriers,
    loading,
    error,
    onlyActive,
    setOnlyActive,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    updatingId,
    load,
    toggleTracking,
  };
}
