import { useEffect, useState } from 'react';
import { geocodeSearch, type MapboxFeature } from '@/lib/mapbox/geocoding';

export type UseMapboxGeocodingOptions = {
  limit?: number;
  bbox?: [number, number, number, number];
  country?: string;
  debounceMs?: number;
};

export function useMapboxGeocoding(initialQuery = '', opts?: UseMapboxGeocodingOptions) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      setError(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const feats = await geocodeSearch(q, {
          limit: opts?.limit ?? 5,
          bbox: opts?.bbox,
          country: opts?.country ?? 'MG',
        });
        if (!cancelled) setSuggestions(feats);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Recherche indisponible');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, opts?.debounceMs ?? 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, opts?.limit, opts?.country, ...(opts?.bbox ?? [])]);

  return { query, setQuery, loading, error, suggestions };
}
