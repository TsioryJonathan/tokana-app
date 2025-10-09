import { useMemo } from 'react';

export function useBusinessAvailability() {
  const now = new Date();
  const hour = Number(
    new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', hour12: false, timeZone: 'Indian/Antananarivo' })
      .formatToParts(now)
      .find((p) => p.type === 'hour')?.value ?? '0'
  );
  const isStandardOrderWindow = hour >= 4 && hour < 23; // 04:00–23:00
  const isExpressWindow = hour >= 6 && hour < 15; // 06:00–15:00

  return useMemo(() => ({ isStandardOrderWindow, isExpressWindow, now }), [isStandardOrderWindow, isExpressWindow, now]);
}
