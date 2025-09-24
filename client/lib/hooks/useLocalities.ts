import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '@/lib/api/client';
import type { ZonePublicResponse } from '@/lib/api/models/ZonePublicResponse';

export type LocalityItem = {
  id: string; // synthetic ID: `${zoneKey}:${axisKey}:${name}` or DB id if available
  name: string;
  zoneLevel: 'ville' | 'peripherie' | 'super-peripherie';
  axisKey?: string;
};

const DEFAULT_LOCALITIES: LocalityItem[] = [
  { id: 'ville:nord:Analakely', name: 'Analakely', zoneLevel: 'ville', axisKey: 'nord' },
  { id: 'ville:sud:Anosy', name: 'Anosy', zoneLevel: 'ville', axisKey: 'sud' },
  { id: 'ville:est:Ankorondrano', name: 'Ankorondrano', zoneLevel: 'ville', axisKey: 'est' },
  { id: 'peripherie:nord:Ambohidratrimo', name: 'Ambohidratrimo', zoneLevel: 'peripherie', axisKey: 'nord' },
  { id: 'peripherie:ouest:Ivato Aéroport', name: 'Ivato Aéroport', zoneLevel: 'peripherie', axisKey: 'ouest' },
  { id: 'super-peripherie:ouest:Imerintsiatosika', name: 'Imerintsiatosika', zoneLevel: 'super-peripherie', axisKey: 'ouest' },
];

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function useLocalities() {
  const api = useMemo(getApiClient, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<LocalityItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = (await api.zones.getApiZones()) as unknown as ZonePublicResponse;
        if (!mounted) return;
        const out: LocalityItem[] = [];
        const zones = Object.entries(data || {}); // [zoneKey, {label, axes}]
        for (const [zoneKey, val] of zones) {
          const axes = Object.entries((val as any)?.axes || {}); // [axisKey, string[]]
          for (const [axisKey, locs] of axes) {
            for (const name of (locs as string[]) || []) {
              out.push({
                id: `${zoneKey}:${axisKey}:${name}`,
                name,
                zoneLevel: zoneKey as any,
                axisKey,
              });
            }
          }
        }
        if (out.length === 0) {
          // Fallback: minimal defaults to enable MVP UX if DB is not seeded yet
          // eslint-disable-next-line no-console
          console.warn('[useLocalities] /api/zones empty; using DEFAULT_LOCALITIES fallback');
          setItems(DEFAULT_LOCALITIES);
        } else {
          setItems(out);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Zones indisponibles');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [api]);

  const search = useCallback((query: string, limit = 20) => {
    const q = normalize(query);
    if (!q) return [] as LocalityItem[];
    const scored = items
      .map((it) => {
        const n = normalize(it.name);
        const prefix = n.startsWith(q);
        const contains = !prefix && n.includes(q);
        const score = prefix ? 2 : contains ? 1 : 0;
        return { it, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => (b.score - a.score) || a.it.name.localeCompare(b.it.name));
    return scored.slice(0, limit).map((s) => s.it);
  }, [items]);

  return { loading, error, items, search } as const;
}
