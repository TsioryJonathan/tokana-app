import { useEffect, useMemo, useRef, useState } from 'react';
import { getApiClient } from '@/lib/api/client';
import type { User } from '@/lib/api/models/User';

export type CourierSuggestion = Pick<User, 'id' | 'name' | 'phone'>;

export function useCourierSearch(initialQ = '') {
  const api = useMemo(getApiClient, []);
  const [q, setQ] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CourierSuggestion[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const query = q.trim();
        const res = await api.adminUsers.getApiAdminUsers('livreur', query, 1, 10);
        const items = (res.items ?? []).map((u) => ({ id: u.id!, name: u.name ?? null, phone: u.phone ?? null })) as CourierSuggestion[];
        const qLower = query.toLowerCase();
        const filtered = items.filter((u) => {
          const name = (u.name ?? '').toLowerCase();
          const phone = (u.phone ?? '').toLowerCase();
          return name.includes(qLower) || phone.includes(qLower);
        });
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q, api]);

  const clear = () => setResults([]);

  return { q, setQ, loading, results, clear };
}
