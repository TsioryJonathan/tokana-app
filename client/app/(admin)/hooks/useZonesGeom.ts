import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Zone } from '../../../lib/api/models/Zone';
import { getApiClient } from '../../../lib/api/client';

export type GeometryStatus = 'unknown' | 'ok' | 'missing';

export function useZonesGeom() {
  const api = useMemo(getApiClient, []);
  const [zones, setZones] = useState<Zone[]>([]);
  const [geomStatus, setGeomStatus] = useState<Record<number, GeometryStatus>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const zs = await api.adminZones.getApiAdminZones();
      setZones(zs);
      const results = await Promise.all(
        zs.map(async (z) => {
          try {
            const res = await api.adminZones.getApiAdminZonesGeometry(z.id!);
            const ok = !!(res as any)?.geometry?.type && Array.isArray((res as any)?.geometry?.coordinates);
            return [z.id!, ok ? 'ok' : 'missing'] as [number, GeometryStatus];
          } catch {
            return [z.id!, 'missing'] as [number, GeometryStatus];
          }
        })
      );
      setGeomStatus(Object.fromEntries(results));
    } catch (e) {
      setError('Impossible de charger les zones.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { zones, geomStatus, loading, error, refresh } as const;
}
