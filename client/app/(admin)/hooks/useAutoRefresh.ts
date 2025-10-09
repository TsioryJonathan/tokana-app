import { useCallback, useEffect, useState } from 'react';
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

  // load persisted value
  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(storageKey);
        if (v === '0') setEnabled(false);
        if (v === '1') setEnabled(true);
      } catch {}
    })();
  }, [storageKey]);

  // persist value
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(storageKey, enabled ? '1' : '0');
      } catch {}
    })();
  }, [enabled, storageKey]);

  // run interval
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      try { callback(); } catch {}
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, callback]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return { enabled, setEnabled, toggle } as const;
}
