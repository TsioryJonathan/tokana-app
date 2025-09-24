import { useEffect, useRef } from 'react';

export function useAutoRefresh(callback: () => void, intervalMs: number, enabled: boolean = true) {
  const savedCb = useRef(callback);
  useEffect(() => { savedCb.current = callback; }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => savedCb.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
