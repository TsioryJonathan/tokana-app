import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAutoRefresh(
  callback: () => void,
  {
    intervalMs = 60000,
    storageKey = 'admin_kpis_autorefresh',
    defaultEnabled = true,
  }: { intervalMs?: number; storageKey?: string; defaultEnabled?: boolean } = {}
) {
  const [enabled, setEnabled] = useState<boolean>(defaultEnabled);
  const mountedRef = useRef(false);

  // mount flag
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // load persisted value
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(storageKey);
        if (cancelled || !mountedRef.current) return;
        if (v === '0') setEnabled(false);
        if (v === '1') setEnabled(true);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [storageKey]);

  // persist value
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await AsyncStorage.setItem(storageKey, enabled ? '1' : '0');
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [enabled, storageKey]);

  // run interval
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      try { if (mountedRef.current) callback(); } catch {}
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, callback]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return { enabled, setEnabled, toggle } as const;
}
